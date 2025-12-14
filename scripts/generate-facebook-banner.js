const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateBanner() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport to exact banner size
  await page.setViewport({
    width: 820,
    height: 462,
    deviceScaleFactor: 2 // 2x for high quality (retina)
  });

  // Create the HTML content directly
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 820px;
      height: 462px;
      overflow: hidden;
    }

    .banner {
      width: 820px;
      height: 462px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #0f1419 0%, #1a1a2e 50%, #0f1419 100%);
    }

    /* Background with stadium lights effect */
    .banner::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(ellipse 300px 200px at 15% 20%, rgba(249, 115, 22, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse 300px 200px at 85% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse 400px 300px at 50% 120%, rgba(14, 165, 233, 0.1) 0%, transparent 60%),
        linear-gradient(180deg, rgba(15, 20, 25, 0.3) 0%, rgba(26, 26, 46, 0.8) 50%, rgba(15, 20, 25, 0.95) 100%);
    }

    /* Content container */
    .content {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    /* Main layout */
    .main-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 50px;
    }

    /* Text section */
    .text-section {
      text-align: left;
    }

    .tagline {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 58px;
      line-height: 1.0;
      letter-spacing: 2px;
      margin-bottom: 14px;
    }

    .tagline .mind {
      color: #0EA5E9;
      text-shadow: 0 0 40px rgba(14, 165, 233, 0.7), 0 0 80px rgba(14, 165, 233, 0.3);
    }

    .tagline .muscle {
      color: #F97316;
      text-shadow: 0 0 40px rgba(249, 115, 22, 0.7), 0 0 80px rgba(249, 115, 22, 0.3);
    }

    .subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 17px;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    /* Logo/Shield section */
    .logo-section {
      flex-shrink: 0;
      position: relative;
    }

    .logo-section img {
      width: 200px;
      height: 200px;
      object-fit: contain;
      filter: drop-shadow(0 0 50px rgba(14, 165, 233, 0.6)) drop-shadow(0 0 100px rgba(249, 115, 22, 0.3));
    }

    /* Glow effect behind logo */
    .logo-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, rgba(249, 115, 22, 0.1) 40%, transparent 70%);
      border-radius: 50%;
      z-index: -1;
    }
  </style>
</head>
<body>
  <div class="banner">
    <div class="content">
      <div class="main-content">
        <div class="text-section">
          <div class="tagline">
            <div class="mind">Discipline the Mind.</div>
            <div class="muscle">Dominate the Game.</div>
          </div>
          <div class="subtitle">AI Training for Baseball & Softball Athletes</div>
        </div>
        <div class="logo-section">
          <div class="logo-glow"></div>
          <img src="https://mindandmuscle.ai/assets/images/logo.png" alt="Mind & Muscle Logo">
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

  console.log('Loading banner content...');
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Extra wait for images

  const outputPath = path.join(__dirname, '..', 'public', 'assets', 'images', 'facebook-banner.png');

  console.log('Taking screenshot...');
  await page.screenshot({
    path: outputPath,
    type: 'png',
    clip: {
      x: 0,
      y: 0,
      width: 820,
      height: 462
    }
  });

  await browser.close();

  console.log(`\n✅ Facebook banner saved to: ${outputPath}`);
  console.log(`   Dimensions: 1640 x 924px (2x retina quality)`);
  console.log(`   Upload this directly to Facebook!`);
}

generateBanner().catch(console.error);
