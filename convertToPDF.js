const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlPath = 'file:///' + path.resolve('pages/Prototype_Iteration.html').replace(/\\/g, '/');
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });

  // Get all video containers and their positions
  const videoContainers = await page.evaluate(() => {
    const videos = document.querySelectorAll('video');
    const containers = [];

    videos.forEach((video, index) => {
      let element = video;
      // Find the parent container (likely the div with text-center class)
      while (element && !element.classList.contains('text-center')) {
        element = element.parentElement;
      }
      if (element) {
        // Mark the container with a unique ID
        element.setAttribute('data-video-container', index);
        containers.push({
          index: index,
          id: `data-video-container="${index}"`
        });
      }
    });

    return containers;
  });

  if (videoContainers.length > 0) {
    console.log(`${videoContainers.length} video(s) detected! Splitting PDF into ${videoContainers.length + 1} parts...`);

    // Generate PDFs for each section
    for (let i = 0; i <= videoContainers.length; i++) {
      await page.goto(htmlPath, { waitUntil: 'networkidle0' });

      // Re-mark containers after reload
      await page.evaluate(() => {
        const videos = document.querySelectorAll('video');
        videos.forEach((video, index) => {
          let element = video;
          while (element && !element.classList.contains('text-center')) {
            element = element.parentElement;
          }
          if (element) {
            element.setAttribute('data-video-container', index);
          }
        });
      });

      await page.evaluate((partIndex, totalVideos) => {
        const allContainers = document.querySelectorAll('[data-video-container]');

        if (allContainers.length === 0) return;

        // Hide header for all parts except the first one
        if (partIndex > 0) {
          const header = document.querySelector('.hero-header');
          if (header) {
            header.style.display = 'none';
          }
        }

        if (partIndex === 0) {
          // Part 1: Show everything before first video
          const firstContainer = allContainers[0];
          const parent = firstContainer.parentElement;
          if (!parent) return;
          const children = Array.from(parent.children);
          const startIndex = children.indexOf(firstContainer);

          // Hide from first video onwards
          for (let j = startIndex; j < children.length; j++) {
            children[j].style.display = 'none';
          }
        } else if (partIndex <= totalVideos) {
          // Middle parts: Show content between videos
          const parent = allContainers[0].parentElement;
          if (!parent) return;
          const children = Array.from(parent.children);

          // Hide everything before previous video (including the video)
          const prevContainer = allContainers[partIndex - 1];
          const prevIndex = children.indexOf(prevContainer);
          for (let j = 0; j <= prevIndex; j++) {
            children[j].style.display = 'none';
          }

          // Hide from current video onwards (if not last part)
          if (partIndex < totalVideos) {
            const currentContainer = allContainers[partIndex];
            const currentIndex = children.indexOf(currentContainer);
            for (let j = currentIndex; j < children.length; j++) {
              children[j].style.display = 'none';
            }
          }
        }
      }, i, videoContainers.length);

      const pdfPath = `Prototype_Iteration_Part${i + 1}.pdf`;
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      console.log(`Part ${i + 1} PDF generated: ${pdfPath}`);
    }

  } else {
    console.log('No video detected. Generating single PDF...');

    // Generate single PDF if no video
    await page.pdf({
      path: 'Prototype_Iteration.pdf',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    console.log('PDF generated successfully: Prototype_Iteration.pdf');
  }

  await browser.close();
})();
