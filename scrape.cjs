const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://yaps.kaito.ai/mira', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Wait 8 seconds for dynamic React content to render
  await new Promise(resolve => setTimeout(resolve, 8000));

  const leaderboardData = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    return rows.slice(0, 10).map(row => {
      const cols = row.querySelectorAll('td');
      return {
        username: cols[1]?.innerText.trim(),
        yaps: cols[2]?.innerText.trim(),
        mindshare: cols[3]?.innerText.trim()
      };
    });
  });

  fs.writeFileSync('kaito-leaderboard.json', JSON.stringify(leaderboardData, null, 2));
  console.log('✅ Data saved to kaito-leaderboard.json');

  await browser.close();
})();
