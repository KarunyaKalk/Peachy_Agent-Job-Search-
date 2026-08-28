import io
from typing import Dict, Any
import pdfplumber
import docx

def parse_file_to_text(file_bytes: bytes, filename: str) -> str:
    """Extract raw text from PDF or DOCX file bytes."""
    filename_lower = filename.lower()
    text = ""
    
    if filename_lower.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    elif filename_lower.endswith(".docx") or filename_lower.endswith(".doc"):
        doc = docx.Document(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            if para.text:
                text += para.text + "\n"
    else:
        text = file_bytes.decode("utf-8", errors="ignore")
        
    return text.strip()
