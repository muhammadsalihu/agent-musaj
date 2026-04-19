import sys
import os
import subprocess

try:
    from pypdf import PdfReader
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    from pypdf import PdfReader

def extract(pdf_path, out_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Saved to {out_path}")

extract("From Text to Tech Research Paper Bahman 1st Edition.pdf", "paper1.txt")
extract("The Power of Small LLMs in Geometry GeneraƟon for Physical.pdf", "paper2.txt")
