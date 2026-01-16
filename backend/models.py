from database import db
from datetime import datetime

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(500), nullable=False)
    invoice_number = db.Column(db.String(100))
    customer_name = db.Column(db.String(255))
    invoice_date = db.Column(db.String(50))
    due_date = db.Column(db.String(50))
    total_amount = db.Column(db.Float)
    tax_amount = db.Column(db.Float)
    subtotal = db.Column(db.Float)
    items = db.Column(db.Text)  # JSON string of items
    extracted_data = db.Column(db.Text)  # Full extracted data JSON
    status = db.Column(db.String(50), default='processed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Invoice {self.invoice_number}>'