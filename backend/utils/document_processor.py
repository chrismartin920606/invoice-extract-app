import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from docx import Document
import io
import re
import json
import os

# For Ollama integration (fallback to regex if Ollama not available)
try:
    import requests
    OLLAMA_AVAILABLE = True
except:
    OLLAMA_AVAILABLE = False

class DocumentProcessor:
    def __init__(self):
        self.ollama_url = "http://localhost:11434/api/generate"
    
    def extract_from_pdf(self, filepath):
        """Extract text from PDF using OCR if needed"""
        text = ""
        try:
            # Try direct text extraction first
            doc = fitz.open(filepath)
            for page in doc:
                text += page.get_text()
            
            # If no text found, use OCR
            if not text.strip():
                print("No text found, using OCR...")
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    pix = page.get_pixmap()
                    img_data = pix.tobytes("png")
                    image = Image.open(io.BytesIO(img_data))
                    text += pytesseract.image_to_string(image)
            
            doc.close()
        except Exception as e:
            print(f"PDF extraction error: {e}")
        
        return text
    
    def extract_from_docx(self, filepath):
        """Extract text from DOCX"""
        text = ""
        try:
            doc = Document(filepath)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            print(f"DOCX extraction error: {e}")
        
        return text
    
    def extract_with_ollama(self, text):
        """Use Ollama to extract structured data from text"""
        if not OLLAMA_AVAILABLE:
            return self.extract_with_regex(text)
        
        prompt = f"""Extract invoice information from this text and return as JSON with this structure:
        {{
            "invoice_number": "string or null",
            "customer_name": "string or null",
            "invoice_date": "string or null",
            "due_date": "string or null",
            "total_amount": "float or null",
            "tax_amount": "float or null",
            "subtotal": "float or null",
            "items": [
                {{
                    "description": "string",
                    "quantity": "float",
                    "unit_price": "float",
                    "total": "float"
                }}
            ]
        }}
        
        Text: {text[:3000]}  # Limit text length
        
        Return ONLY valid JSON, no other text."""
        
        try:
            response = requests.post(self.ollama_url, json={
                "model": "phi3:mini",  # or whatever model you have
                "prompt": prompt,
                "stream": False
            })
            
            print(response.text)
            if response.status_code == 200:
                result = response.json()
                raw = result["response"]
                raw = raw.replace("```json", "").replace("```", "").strip()
                return json.loads(raw)
        except Exception as e:
            print(f"Ollama error: {e}")
        
        return self.extract_with_regex(text)
    
    def extract_with_regex(self, text):
        """Fallback regex-based extraction"""
        data = {
            "invoice_number": None,
            "customer_name": None,
            "invoice_date": None,
            "due_date": None,
            "total_amount": None,
            "tax_amount": None,
            "subtotal": None,
            "items": []
        }
        
        # Extract invoice number
        invoice_patterns = [
            r'Invoice\s*#?\s*[:]?\s*([A-Z0-9\-]+)',
            r'Invoice\s*Number\s*[:]?\s*([A-Z0-9\-]+)',
            r'INV[-_]?(\d+)'
        ]
        
        for pattern in invoice_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data['invoice_number'] = match.group(1)
                break
        
        # Extract amounts
        amount_patterns = {
            'total_amount': r'Total\s*[:]?\s*\$?(\d+\.?\d*)',
            'tax_amount': r'Tax\s*[:]?\s*\$?(\d+\.?\d*)',
            'subtotal': r'Subtotal\s*[:]?\s*\$?(\d+\.?\d*)'
        }
        
        for key, pattern in amount_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    data[key] = float(match.group(1))
                except:
                    pass
        
        # Simple item extraction (basic pattern)
        item_pattern = r'(\d+)\s*x\s*(.+?)\s*\$?(\d+\.?\d*)'
        items = re.findall(item_pattern, text)
        
        for qty, desc, price in items:
            data['items'].append({
                "description": desc.strip(),
                "quantity": float(qty),
                "unit_price": float(price),
                "total": float(qty) * float(price)
            })
        
        return data
    
    def process(self, filepath, use_ollama=True):
        """Main processing function"""
        text = ""
        
        if filepath.lower().endswith('.pdf'):
            text = self.extract_from_pdf(filepath)
        elif filepath.lower().endswith('.docx'):
            text = self.extract_from_docx(filepath)
        
        if use_ollama and OLLAMA_AVAILABLE:
            return self.extract_with_ollama(text)
        else:
            return self.extract_with_regex(text)

def process_document(filepath):
    """Public interface for document processing"""
    processor = DocumentProcessor()
    return processor.process(filepath)