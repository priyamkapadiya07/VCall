import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new", args: ['--use-fake-ui-for-media-stream'] });
  
  const page1 = await browser.newPage();
  page1.on('console', msg => console.log('PAGE 1:', msg.text()));
  page1.on('pageerror', err => console.log('PAGE 1 ERROR:', err));
  
  const page2 = await browser.newPage();
  page2.on('console', msg => console.log('PAGE 2:', msg.text()));
  page2.on('pageerror', err => console.log('PAGE 2 ERROR:', err));

  console.log("Page 1 joining...");
  await page1.goto('http://localhost:5173/room/debug123');
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Page 2 joining...");
  await page2.goto('http://localhost:5173/room/debug123');
  
  await new Promise(r => setTimeout(r, 5000));
  console.log("Done.");
  await browser.close();
})();
