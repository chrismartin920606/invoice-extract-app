from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from database import db, init_db
from models import Invoice
from utils.document_processor import process_document
import json

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///invoices.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Create uploads directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize database
init_db(app)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Process document
            extracted_data = process_document(filepath)
            
            # Save to database
            invoice = Invoice(
                filename=filename,
                filepath=filepath,
                invoice_number=extracted_data.get('invoice_number'),
                customer_name=extracted_data.get('customer_name'),
                invoice_date=extracted_data.get('invoice_date'),
                due_date=extracted_data.get('due_date'),
                total_amount=extracted_data.get('total_amount'),
                tax_amount=extracted_data.get('tax_amount'),
                subtotal=extracted_data.get('subtotal'),
                items=json.dumps(extracted_data.get('items', [])),
                extracted_data=json.dumps(extracted_data),
                status='processed'
            )
            
            db.session.add(invoice)
            db.session.commit()
            
            return jsonify({
                'message': 'File processed successfully',
                'data': extracted_data,
                'invoice_id': invoice.id
            })
            
        except Exception as e:
            print(f"Error processing file: {e}")
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    try:
        invoices = Invoice.query.order_by(Invoice.created_at.desc()).all()
        result = []
        
        for invoice in invoices:
            result.append({
                'id': invoice.id,
                'filename': invoice.filename,
                'invoice_number': invoice.invoice_number,
                'customer_name': invoice.customer_name,
                'invoice_date': invoice.invoice_date,
                'due_date': invoice.due_date,
                'total_amount': invoice.total_amount,
                'status': invoice.status,
                'created_at': invoice.created_at.isoformat() if invoice.created_at else None
            })
        
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching invoices: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/invoices/<int:invoice_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_invoice(invoice_id):
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        
        if request.method == 'GET':
            return jsonify({
                'id': invoice.id,
                'filename': invoice.filename,
                'invoice_number': invoice.invoice_number,
                'customer_name': invoice.customer_name,
                'invoice_date': invoice.invoice_date,
                'due_date': invoice.due_date,
                'total_amount': invoice.total_amount,
                'tax_amount': invoice.tax_amount,
                'subtotal': invoice.subtotal,
                'items': json.loads(invoice.items) if invoice.items else [],
                'extracted_data': json.loads(invoice.extracted_data) if invoice.extracted_data else {},
                'status': invoice.status,
                'created_at': invoice.created_at.isoformat() if invoice.created_at else None
            })
        
        elif request.method == 'PUT':
            data = request.json
            
            # Update fields
            invoice.invoice_number = data.get('invoice_number', invoice.invoice_number)
            invoice.customer_name = data.get('customer_name', invoice.customer_name)
            invoice.invoice_date = data.get('invoice_date', invoice.invoice_date)
            invoice.due_date = data.get('due_date', invoice.due_date)
            invoice.total_amount = data.get('total_amount', invoice.total_amount)
            invoice.tax_amount = data.get('tax_amount', invoice.tax_amount)
            invoice.subtotal = data.get('subtotal', invoice.subtotal)
            
            if 'items' in data:
                invoice.items = json.dumps(data.get('items'))
            
            invoice.status = 'updated'
            
            db.session.commit()
            return jsonify({'message': 'Invoice updated successfully'})
        
        elif request.method == 'DELETE':
            db.session.delete(invoice)
            db.session.commit()
            return jsonify({'message': 'Invoice deleted successfully'})
            
    except Exception as e:
        print(f"Error managing invoice: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/compare/<int:id1>/<int:id2>', methods=['GET'])
def compare_invoices(id1, id2):
    try:
        invoice1 = Invoice.query.get_or_404(id1)
        invoice2 = Invoice.query.get_or_404(id2)
        
        data1 = json.loads(invoice1.extracted_data) if invoice1.extracted_data else {}
        data2 = json.loads(invoice2.extracted_data) if invoice2.extracted_data else {}
        
        # Compare key fields
        differences = {}
        fields_to_compare = ['invoice_number', 'customer_name', 'total_amount', 'tax_amount', 'subtotal']
        
        for field in fields_to_compare:
            val1 = data1.get(field)
            val2 = data2.get(field)
            if val1 != val2:
                differences[field] = {
                    'invoice1': val1,
                    'invoice2': val2
                }
        
        # Compare items
        items1 = data1.get('items', [])
        items2 = data2.get('items', [])
        
        if items1 != items2:
            differences['items'] = {
                'invoice1_items': len(items1),
                'invoice2_items': len(items2),
                'invoice1_total_quantity': sum(item.get('quantity', 0) for item in items1),
                'invoice2_total_quantity': sum(item.get('quantity', 0) for item in items2),
                'invoice1_total_value': sum(item.get('total', 0) for item in items1),
                'invoice2_total_value': sum(item.get('total', 0) for item in items2)
            }
        
        return jsonify({
            'invoice1': invoice1.filename,
            'invoice2': invoice2.filename,
            'differences': differences
        })
    except Exception as e:
        print(f"Error comparing invoices: {e}")
        return jsonify({'error': str(e)}), 500

# Windows-specific fix: Use different port and disable reloader
if __name__ == '__main__':
    # Try different ports if 5000 is busy
    for port in [5000, 5001, 5002, 5003]:
        try:
            print(f"Trying to start server on port {port}...")
            app.run(
                host='127.0.0.1',
                port=port,
                debug=False,  # Disable debug mode on Windows
                threaded=True
            )
            break
        except OSError as e:
            print(f"Port {port} not available: {e}")
            continue