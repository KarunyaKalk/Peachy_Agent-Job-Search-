import os
import sys
from pathlib import Path
from typing import Dict, Any
from jinja2 import Environment, FileSystemLoader

# Set environment fallback for Homebrew dynamic libraries on macOS
if "DYLD_FALLBACK_LIBRARY_PATH" not in os.environ:
    os.environ["DYLD_FALLBACK_LIBRARY_PATH"] = "/opt/homebrew/lib:/usr/local/lib"

try:
    import weasyprint
except ImportError:
    weasyprint = None

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"

class PDFService:
    """
    Renders structured resume JSON models into ATS-compliant PDFs using
    Jinja2 HTML templates and WeasyPrint.
    """

    def __init__(self):
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(TEMPLATES_DIR)),
            autoescape=True
        )

    def render_resume_pdf(self, tailored_json: Dict[str, Any], job_title: str = "") -> bytes:
        """
        Renders ATS HTML/CSS resume template and compiles to PDF binary bytes.
        """
        # Ensure default visibility dictionary
        visibility = tailored_json.get("visibility", {
            "summary": True,
            "skills": True,
            "experiences": True,
            "projects": True,
            "education": True,
            "certifications": True
        })

        contact = tailored_json.get("contact", {
            "name": "Candidate",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin_url": "",
            "github_url": "",
            "portfolio_url": ""
        })

        template = self.jinja_env.get_template("resume_ats.html")
        html_content = template.render(
            contact=contact,
            job_title=job_title,
            summary=tailored_json.get("summary", ""),
            skills=tailored_json.get("skills", []),
            experiences=tailored_json.get("experiences", []),
            projects=tailored_json.get("projects", []),
            education=tailored_json.get("education", []),
            certifications=tailored_json.get("certifications", []),
            visibility=visibility
        )

        if not weasyprint:
            raise RuntimeError("WeasyPrint is not installed or available in Python environment.")

        # Compile HTML string to PDF binary bytes via WeasyPrint
        pdf_bytes = weasyprint.HTML(string=html_content).write_pdf()
        return pdf_bytes
