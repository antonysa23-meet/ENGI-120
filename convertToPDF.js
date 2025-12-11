// save as generate_pdfs.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const htmlFiles = [
  'About_Us.html',
  'About_Antony.html',
  'About_Connor.html',
  'About_Hong.html',
  'About_Luke.html',
  'Communication.html',
  'Design_Analysis.html',
  'Design_Solution.html',
  'Prototype_Iteration.html',
  'Team_Pitstop.html',
  'Pitstop_Antony.html',
  'Pitstop_Connor.html',
  'Pitstop_Hong.html',
  'Pitstop_Luke.html'
];

const PDF_WIDTH_PX = 1200;      // matches your previous width
const SAFETY_PADDING_PX = 6;    // small extra to avoid 1px crop

async function ensureFullyRendered(page) {
  // wait for network quiet, images, fonts and final paints
  await page.waitForNetworkIdle({ idleTime: 250, timeout: 5000 }).catch(() => {});
  await page.evaluate(async () => {
    // images
    await Promise.all([...document.images].map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        const onDone = () => { resolve(); img.removeEventListener('load', onDone); img.removeEventListener('error', onDone); };
        img.addEventListener('load', onDone);
        img.addEventListener('error', onDone);
      });
    }));
    // fonts
    if (document.fonts) {
      await document.fonts.ready;
    }
    // final paint 2 frames
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

/**
 * Measure "true" content height by cloning visible content into a stripped wrapper.
 * This avoids margins, pseudo-elements or invisible trailing space that inflate scrollHeight.
 */
async function measureTrueContentHeight(page) {
  return await page.evaluate((pdfWidth, safetyPadding) => {
    // scroll to top then bottom then top to stabilize possible lazy layout
    window.scrollTo(0, 0);
    window.scrollTo(0, 99999);
    window.scrollTo(0, 0);

    // remove animations, ::before/::after content for measurement
    const styleTag = document.createElement('style');
    styleTag.id = '__pptr_pdf_measure_reset';
    styleTag.innerText = `
      * { transition: none !important; animation: none !important; }
      *::before, *::after { content: none !important; }
      html, body { margin: 0 !important; padding: 0 !important; }
    `;
    document.head.appendChild(styleTag);

    // choose elements to include in the PDF: prefer .container children or fallback to body children
    const sourceRoot = document.querySelector('.container') || document.body;
    const children = Array.from(sourceRoot.children);

    // create measure wrapper with the same width and reset styles
    const wrapper = document.createElement('div');
    wrapper.id = '__pptr_pdf_measure_wrapper';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.width = pdfWidth + 'px';
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-99999px';
    wrapper.style.top = '0';
    wrapper.style.padding = '0';
    wrapper.style.margin = '0';
    wrapper.style.background = 'transparent';
    wrapper.style.display = 'block';

    // clone visible children only
    children.forEach(child => {
      const cs = window.getComputedStyle(child);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;

      // Skip header if it's supposed to be hidden
      if (child.classList && (child.classList.contains('hero-header') || child.tagName === 'HEADER')) {
        if (cs.display === 'none') return;
      }

      // clone node shallow, but replace computed margins/padding with 0 to avoid large gaps
      const clone = child.cloneNode(true);
      clone.style.margin = '0 !important';
      clone.style.padding = '0 !important';
      clone.style.boxSizing = 'border-box';
      clone.style.maxWidth = '100%';
      clone.style.minHeight = '0';
      clone.style.minWidth = '0';

      // also collapse heavy utility spacing classes that bootstrap may have (safe to override in clone)
      clone.querySelectorAll && clone.querySelectorAll('.mb-5, .my-5, .pb-5, .pt-5, .py-5, .mt-5').forEach(el => {
        el.style.margin = '0 !important';
        el.style.padding = '0 !important';
      });

      // images: ensure natural sizing so clone width doesn't blow up
      clone.querySelectorAll && clone.querySelectorAll('img').forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
      });

      wrapper.appendChild(clone);
    });

    document.body.appendChild(wrapper);

    // force a paint
    const height = Math.ceil(wrapper.scrollHeight) + safetyPadding;

    // cleanup
    wrapper.remove();
    styleTag.remove();

    return height;
  }, PDF_WIDTH_PX, SAFETY_PADDING_PX);
}

(async () => {
  const pdfsDir = 'PDFs';
  if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir);

  const browser = await puppeteer.launch();
  for (const htmlFile of htmlFiles) {
    console.log(`\n========== Processing ${htmlFile} ==========`);
    const page = await browser.newPage();

    // set viewport width to your PDF width to avoid reflow on render
    await page.setViewport({ width: PDF_WIDTH_PX, height: 900 });

    const htmlPath = 'file:///' + path.resolve(`pages/${htmlFile}`).replace(/\\/g, '/');
    await page.goto(htmlPath, { waitUntil: 'domcontentloaded' });

    // hide navbar & disable animations in page context (keeps original layout but removes padding/invisible space)
    await page.evaluate(() => {
      if (window.AOS) try { window.AOS.init({ disable: true }); } catch(e) {}
      const s = document.createElement('style');
      s.id = '__pptr_pdf_hide';
      s.innerText = `
        * { transition: none !important; animation: none !important; }
        .navbar { display: none !important; }
        html, body { margin: 0 !important; padding: 0 !important; height: auto !important; }
        .container { padding-bottom: 0 !important; margin-bottom: 0 !important; }
      `;
      document.head.appendChild(s);
      document.querySelectorAll('[data-aos]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.removeAttribute('data-aos');
        el.removeAttribute('data-aos-delay');
        el.removeAttribute('data-aos-duration');
      });
    });

    // wait for images/fonts/paints
    await ensureFullyRendered(page);

    // Generate single PDF for each page
    const base = htmlFile.replace('.html', '');
    const out = path.join(pdfsDir, `${base}.pdf`);

    // ensure final stabilization (some pages reflow on scroll)
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await ensureFullyRendered(page);

    // measure using cloned snapshot to avoid stray whitespace
    const heightPx = await measureTrueContentHeight(page);

    await page.pdf({
      path: out,
      printBackground: true,
      width: `${PDF_WIDTH_PX}px`,
      height: `${heightPx}px`,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    console.log(`Generated ${out}`);

    await page.close();
  }

  await browser.close();
  console.log('\nAll done.');
})();
