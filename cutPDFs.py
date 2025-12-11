try:
    import pymupdf as fitz
except ImportError:
    try:
        import fitz
    except ImportError:
        print("ERROR: PyMuPDF is not installed.")
        print("Please install it with: pip install pymupdf")
        exit(1)

import os
from pathlib import Path

# === CONFIGURATION ===
SOURCE_PDFS_DIR = "PDFs"
OUTPUT_CUTS_DIR = os.path.join(SOURCE_PDFS_DIR, "cuts")

# Define Y positions (in pixel units) for each PDF that needs cutting
# Format: "filename.pdf": [cut1, cut2, cut3, ...]
PDF_CUTS = {
    # Example - replace with your actual cut positions
    # "Communication.pdf": [3200, 7800, 12200],
    # "Design_Solution.pdf": [4400, 4910],
    "communication.pdf": [450],
}

# =====================

def cut_pdf(source_path, cuts, output_dir, base_name):
    """Cut a single PDF at specified Y positions"""
    if not cuts:
        print(f"  No cuts defined for {base_name}, skipping.")
        return

    doc = fitz.open(source_path)
    page = doc[0]  # single long page
    page_height = page.rect.height

    # Ensure cuts are sorted and valid
    cuts = sorted([c for c in cuts if 0 < c < page_height])
    cuts = [0] + cuts + [page_height]

    print(f"  Creating {len(cuts)-1} slices...")

    for i in range(len(cuts) - 1):
        top = cuts[i]
        bottom = cuts[i+1]

        # Create new PDF
        new_doc = fitz.open()
        new_page = new_doc.new_page(width=page.rect.width,
                                    height=bottom - top)

        # Define crop rectangle
        clip = fitz.Rect(0, top, page.rect.width, bottom)

        # Render the slice
        new_page.show_pdf_page(
            new_page.rect,
            doc,
            0,
            clip=clip
        )

        out_name = os.path.join(output_dir, f"{base_name}_slice_{i+1}.pdf")
        new_doc.save(out_name)
        new_doc.close()
        print(f"    Created: {out_name}")

    doc.close()

def main():
    # Create cuts directory if it doesn't exist
    os.makedirs(OUTPUT_CUTS_DIR, exist_ok=True)
    print(f"Output directory: {OUTPUT_CUTS_DIR}\n")

    if not PDF_CUTS:
        print("No PDFs configured for cutting.")
        print("Edit PDF_CUTS dictionary in this script to add cut positions.")
        return

    # Process each PDF
    for pdf_filename, cuts in PDF_CUTS.items():
        source_path = os.path.join(SOURCE_PDFS_DIR, pdf_filename)

        if not os.path.exists(source_path):
            print(f"WARNING: {source_path} not found, skipping.")
            continue

        base_name = Path(pdf_filename).stem
        print(f"Processing {pdf_filename}...")
        cut_pdf(source_path, cuts, OUTPUT_CUTS_DIR, base_name)
        print()

    print("Done!")

if __name__ == "__main__":
    main()
