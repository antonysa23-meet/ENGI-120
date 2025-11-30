# Design Blueprint: Team Wheelders Design Analysis

This document serves as the visual and structural blueprint for the `Design_Analysis.html` page. It incorporates the Rice University (Rice Design Engineering) brand identity to ensure a professional, academic presentation.

## 1. Visual Identity & Color Palette

We adhere to the Rice University Brand Standards for color and typography.

### Primary Colors
These are the dominant colors for headers, footers, and primary accents.

-   **Rice Blue**
    -   Hex: `#00205B`
    -   Usage: Main headers, navigation bars, primary buttons/links.
-   **Rice Gray**
    -   Hex: `#7C7E7F`
    -   Usage: Subtitles, secondary text, borders.

### Secondary & Accent Colors
Used for backgrounds, highlights, and table alternates.

-   **Light Gray**: `#E0E2E6` (Section backgrounds)
-   **Medium Blue**: `#4D9AD4` (Accents, icons)
-   **Bright Blue**: `#9FDDF9` (Highlighting key data)
-   **White**: `#FFFFFF` (Content background)

### Typography
We use web-safe alternatives that closely match the official Rice fonts (Copernicus and Mallory).

-   **Headings (Serif)**: *Cormorant Garamond* (Google Font) - Matches *Copernicus*.
    -   Usage: `h1`, `h2`, `h3`, Mission Statement.
-   **Body Text (Sans-Serif)**: *Lato* (Google Font) - Matches *Mallory*.
    -   Usage: Paragraphs, lists, table data.

---

## 2. Layout Structure

The page is organized into distinct, vertically stacked sections.

### Header Section
-   **Background**: Rice Blue (`#00205B`).
-   **Text Color**: White (`#FFFFFF`).
-   **Elements**:
    -   Top Left: Team Wheelders Name.
    -   Top Right: Client Name (Rice Robotics Club).
    -   Center: "Design Analysis Stage" Title.
    -   Bottom Row: Team Members list, Placeholder for Team Photo/Logo.

### Mission Statement
-   **Style**: Prominent, centered text box.
-   **Font**: *Cormorant Garamond*, Italicized.
-   **Background**: Light Gray (`#F5F5F5`) with a left border in Rice Blue.

### Content Sections (Learnings, Features, etc.)
-   **Container**: White card-style sections with subtle shadows.
-   **Headings**: Rice Blue, centered or left-aligned with an underline.
-   **Grid**: Use a 2-column grid for "Learnings" to break up text.

### Design Criteria (DC) Table
-   **Style**: Professional engineering data table.
-   **Header Row**: Rice Blue background, White text.
-   **Rows**: Alternating white and very light gray (`#F9F9F9`).
-   **Justification Column**: Smaller text size for readability.

### Images
-   **Placement**: Interspersed throughout relevant sections.
-   **Style**: Rounded corners (4px), subtle drop shadow, captioned with *Figure X*.

---

## 3. Implementation Plan

1.  Import Google Fonts (`Cormorant Garamond` and `Lato`).
2.  Define CSS variables (root) for the color palette.
3.  Apply flexbox/grid layouts for the header and content sections.
4.  Style the DC Table for high readability.

