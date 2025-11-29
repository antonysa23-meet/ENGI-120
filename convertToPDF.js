const puppeteer = require("puppeteer");
const path = require("path");

// List of HTML files to convert (in pages folder)
const htmlFiles = [
    "About_Me.html",
    "Team_Pitstop.html",
    "Design_Analysis.html",
    "Design_Solution.html",
    "Prototype_Iteration.html",
    "Communication.html"
];

const pagesFolder = "pages";
const pdfsFolder = "pdfs";

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const htmlFile of htmlFiles) {
        const page = await browser.newPage();

        // Get the absolute path to your HTML file
        const htmlPath = path.join(__dirname, pagesFolder, htmlFile);
        const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;
        const pdfName = path.join(pdfsFolder, htmlFile.replace(".html", ".pdf"));

        console.log(`\nProcessing: ${htmlFile}`);
        console.log(`Loading HTML from: ${fileUrl}`);

        try {
            // Load the HTML file and wait for all resources
            await page.goto(fileUrl, {
                waitUntil: "networkidle0",
                timeout: 60000
            });

            // Wait a bit more for any animations to settle
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log(`Generating PDF: ${pdfName}`);

            // Get the full page height
            const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

            await page.pdf({
                path: pdfName,
                width: "8.5in", // Standard US Letter width
                height: `${bodyHeight}px`, // Dynamic height based on content
                printBackground: true,
                margin: {
                    top: "0px",
                    bottom: "0px",
                    left: "0px",
                    right: "0px"
                }
            });

            console.log(`✓ PDF generated successfully: ${pdfName}`);
        } catch (error) {
            console.error(`✗ Error processing ${htmlFile}:`, error.message);
        }

        await page.close();
    }

    await browser.close();
    console.log("\n✓ All PDFs generated successfully!");
})();
