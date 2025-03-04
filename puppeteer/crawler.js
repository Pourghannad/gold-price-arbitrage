const { Client } = require('pg');
const puppeteer = require('puppeteer');
const cron = require('node-cron');

// PostgreSQL connection configuration
const client = new Client({
    user: 'your_username',
    host: 'localhost',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});

// Websites and their CSS selectors
const websites = [
    {
        name: 'Wallgold',
        url: 'https://wallgold.ir/',
        selector: 'body > div > div > div > div > div > div > div > div > div > h4 > span',
    },
    {
        name: 'Talasea',
        url: 'https://talasea.ir/',
        selector: 'body > main > section:nth-child(9) > div > div > div.flex-between.mb-5.lg\\:mb-1 > div.bg-white-100.rounded-6.flex.items-center.pl-6.pr-3.py-2\\.5.z-1.lg\\:hidden > span.text-subtitle2Bold.text-gray-900.mr-5.ml-1\\.5',
    },
];

async function fetchPrice(website) {
    let browser;
    try {
        // Launch Puppeteer browser
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Navigate to the website
        await page.goto(website.url, { waitUntil: 'networkidle2' });

        // Wait for the price element to load using the CSS selector
        await page.waitForSelector(website.selector);
        const priceElement = await page.$(website.selector);
        const priceText = await page.evaluate(el => el.textContent.trim(), priceElement);

        // Extract numeric value from the price text (remove non-numeric characters)
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

        console.log(`[${website.name}] The current price is: ${priceText} (${price})`);
        return price;
    } catch (error) {
        console.error(`[${website.name}] Error fetching the price:`, error.message);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function storePrice(website, price) {
    try {
        await client.query(
            'INSERT INTO gold_prices (website, price) VALUES ($1, $2)',
            [website.name, price]
        );
        console.log(`[${website.name}] Price stored in database.`);
    } catch (error) {
        console.error(`[${website.name}] Error storing price:`, error.message);
    }
}

async function fetchAllPrices() {
    // Fetch prices from both websites
    for (const website of websites) {
        const price = await fetchPrice(website);
        if (price !== null) {
            await storePrice(website, price);
        }
    }
}

// Connect to PostgreSQL and start the crawler
client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database.');

        // Fetch prices immediately when the script starts
        console.log('Fetching prices for the first time...');
        fetchAllPrices();

        // Schedule the crawler to run every 5 minutes
        cron.schedule('*/5 * * * *', () => {
            console.log('Fetching prices...');
            fetchAllPrices();
        });

        console.log('Crawler started. It will fetch prices every 5 minutes.');
    })
    .catch(err => {
        console.error('Error connecting to PostgreSQL database:', err);
    });