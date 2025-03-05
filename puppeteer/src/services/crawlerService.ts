import puppeteer from 'puppeteer';
import { insertPrice } from '../models/priceModels';

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

// Fetch price from a website
async function fetchPrice(website: { name: string; url: string; selector: string }) {
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(website.url, { waitUntil: 'networkidle2' });

        // Wait for the price element to load
        await page.waitForSelector(website.selector);
        const priceElement = await page.$(website.selector);
        const priceText = await page.evaluate(el => el.textContent.trim(), priceElement);

        // Extract numeric value from the price text
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

        console.log(`[${website.name}] The current price is: ${priceText} (${price})`);
        return price;
    } catch (error: any) {
        console.error(`[${website.name}] Error fetching the price:`, error.message);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Fetch prices from all websites and store them in the database
export const fetchAllPrices = async () => {
    for (const website of websites) {
        const price = await fetchPrice(website);
        if (price !== null) {
            await insertPrice(website.name, price);
        }
    }
};