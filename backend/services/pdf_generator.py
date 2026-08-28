import os
import logging
from typing import Dict, Any
from jinja2 import Template

logger = logging.getLogger(__name__)

# ATS-Safe HTML Template (Single Column, semantic tags, clean typography)
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    @page {
        size: letter;
        margin: 0.6in;
    }
    body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 10.5pt;
        line-height: 1.4;
        color: #222222;
        margin: 0;
        padding: 0;
    }
    h1 {
        font-size: 20pt;
        margin: 0 0 4px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #111111;
        border-bottom: 2px solid #222222;
        padding-bottom: 4px;
    }
    .contact-info {
        font-size: 9.5pt;
        margin-bottom: 14px;
        color: #444444;
    }
    h2 {
        font-size: 12pt;
        text-transform: uppercase;
        margin: 14px 0 6px 0;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #cccccc;
        padding-bottom: 2px;
        color: #111111;
    }
    p {
        margin: 0 0 6px 0;
    }
    .section {
        margin-bottom: 12px;
    }
    .job-header {
        margin-bottom: 4px;
    }
    .job-title {
        font-weight: bold;
        font-size: 11pt;
    }
    .job-meta {
        font-style: italic;
        color: #555555;
        font-size: 9.5pt;
    }
    ul {
        margin: 4px 0 10px 18px;
        padding: 0;
    }
    li {
        margin-bottom: 3px;
    }
    .skills-category {
        margin-bottom: 4px;
    }
    .skills-title {
        font-weight: bold;
    }
</style>
</head>
<body>

    <h1>{{ profile.full_name }}</h1>
    <div class="contact-info">
        {{ profile.email }} | {{ profile.phone }} | {{ profile.location }}
        {% if profile.linkedin_url %}| {{ profile.linkedin_url }}{% endif %}
        {% if profile.portfolio_url %}| {{ profile.portfolio_url }}{% endif %}
    </div>

    {% if profile.summary %}
    <div class="section">
        <h2>Professional Summary</h2>
        <p>{{ profile.summary }}</p>
    </div>
    {% endif %}

    {% if profile.skills_json %}
    <div class="section">
        <h2>Technical Skills</h2>
        {% for category, skills in profile.skills_json.items() %}
        <div class="skills-category">
            <span class="skills-title">{{ category }}:</span> {{ skills | join(', ') }}
        </div>
        {% endfor %}
    </div>
    {% endif %}

    {% if profile.experience_json %}
    <div class="section">
        <h2>Work Experience</h2>
        {% for exp in profile.experience_json %}
        <div class="job-header">
            <span class="job-title">{{ exp.role }}</span> — <span style="font-weight: 600;">{{ exp.company }}</span>
            <div class="job-meta">{{ exp.dates }} | {{ exp.location }}</div>
        </div>
        <ul>
            {% for bullet in exp.bullets %}
            <li>{{ bullet }}</li>
            {% endfor %}
        </ul>
        {% endfor %}
    </div>
    {% endif %}

    {% if profile.education_json %}
    <div class="section">
        <h2>Education</h2>
        {% for edu in profile.education_json %}
        <div class="job-header">
            <span class="job-title">{{ edu.degree }}</span> — {{ edu.institution }}
            <div class="job-meta">{{ edu.year }} {% if edu.gpa %}| GPA: {{ edu.gpa }}{% endif %}</div>
        </div>
        {% endfor %}
    </div>
    {% endif %}

    {% if profile.certifications_json %}
    <div class="section">
        <h2>Certifications</h2>
        <p>{{ profile.certifications_json | join(' • ') }}</p>
    </div>
    {% endif %}

</body>
</html>
"""

def generate_ats_pdf(profile_data: Dict[str, Any], output_filename: str) -> str:
    """Generate ATS-safe PDF file using WeasyPrint (or ReportLab fallback) and return file path."""
    os.makedirs("generated_pdfs", exist_ok=True)
    file_path = os.path.join("generated_pdfs", output_filename)
    
    template = Template(HTML_TEMPLATE)
    rendered_html = template.render(profile=profile_data)
    
    try:
        from weasyprint import HTML
        HTML(string=rendered_html).write_pdf(file_path)
        logger.info(f"Successfully generated WeasyPrint ATS PDF: {file_path}")
        return file_path
    except Exception as e:
        logger.warning(f"WeasyPrint PDF generation unavailable or failed ({e}). Falling back to ReportLab / HTML output.")
        
        # ReportLab fallback
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            
            doc = SimpleDocTemplate(file_path, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
            styles = getSampleStyleSheet()
            story = []
            
            title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=18, leading=22)
            body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=10, leading=13)
            
            story.append(Paragraph(profile_data.get("full_name", "Resume"), title_style))
            story.append(Spacer(1, 8))
            story.append(Paragraph(f"{profile_data.get('email', '')} | {profile_data.get('phone', '')} | {profile_data.get('location', '')}", body_style))
            story.append(Spacer(1, 12))
            story.append(Paragraph(profile_data.get("summary", ""), body_style))
            
            doc.build(story)
            return file_path
        except Exception as ex:
            # HTML File Fallback if binary generation libraries are missing
            html_fallback_path = file_path.replace(".pdf", ".html")
            with open(html_fallback_path, "w", encoding="utf-8") as f:
                f.write(rendered_html)
            return html_fallback_path
