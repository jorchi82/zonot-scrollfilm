#!/usr/bin/env node
const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars', '--no-sandbox'] });
  const page = await b.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  const url = process.argv[2] || 'http://localhost:8902/';
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 45000 });

  const spikes = await page.evaluate(() => new Promise(res => {
    const end = Math.max(0, (document.scrollingElement || document.documentElement).scrollHeight - innerHeight);
    const filmH = document.getElementById('film').offsetHeight;
    const out = []; let last = performance.now(), y = 0;
    const tick = () => {
      const now = performance.now(); const d = now - last; last = now;
      if (d > 40) out.push({ y, d: +d.toFixed(1), inFilm: y < filmH, filmP: y < filmH ? +(y/filmH).toFixed(3) : null });
      y += 13; window.scrollTo(0, Math.min(y, end));
      if (y < end) requestAnimationFrame(tick);
      else res(out);
    };
    requestAnimationFrame(tick);
  }));
  console.log(JSON.stringify(spikes, null, 1));
  await b.close();
})();
