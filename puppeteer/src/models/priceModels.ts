import client from '../config/db';

// Create the gold_prices table if it doesn't exist
export const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS gold_prices (
            id SERIAL PRIMARY KEY,
            website VARCHAR(50) NOT NULL,
            price NUMERIC(10, 2) NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await client.query(query);
};

// Insert a new price into the database
export const insertPrice = async (website: string, price: number) => {
    const query = 'INSERT INTO gold_prices (website, price) VALUES ($1, $2) RETURNING *';
    const values = [website, price];
    const result = await client.query(query, values);
    return result.rows[0];
};

// Fetch the latest prices from the database
export const getLatestPrices = async () => {
    const query = `
        SELECT DISTINCT ON (website) *
        FROM gold_prices
        ORDER BY website, timestamp DESC;
    `;
    const result = await client.query(query);
    return result.rows;
};