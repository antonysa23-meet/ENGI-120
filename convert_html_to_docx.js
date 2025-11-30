const fs = require("fs");
const path = require("path");
const HTMLtoDOCX = require("html-to-docx");

// Folder that contains your HTML files
const pagesFolder = "pages";

// Output folder for DOCX
const docsFolder = "docs";

// List of pages to convert
const htmlFiles = [
    "About_Me.html",
    "Team_Pitstop.html",
    "Design_Analysis.html",
    "Design_Solution.html",
    "Prototype_Iteration.html",
    "Communication.html"
];

(async () => {
    // Create output folder if missing
    if (!fs.existsSync(docsFolder)) {
        fs.mkdirSync(docsFolder);
    }

    console.log("Converting HTML pages to DOCX...\n");

    for (const file of htmlFiles) {
        try {
            const htmlPath = path.join(pagesFolder, file);
            const htmlContent = fs.readFileSync(htmlPath, "utf-8");

            const docxBuffer = await HTMLtoDOCX(htmlContent, null, {
                table: { row: { cantSplit: true } }
            });

            const outputFile = path.join(docsFolder, file.replace(".html", ".docx"));
            fs.writeFileSync(outputFile, docxBuffer);

            console.log(`✓ Created DOCX: ${outputFile}`);
        } catch (error) {
            console.error(`✗ Failed to convert ${file}:`, error.message);
        }
    }

    console.log("\n✓ All DOCX files created successfully!");
})();
