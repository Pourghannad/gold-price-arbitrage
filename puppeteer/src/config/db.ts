import { Client } from 'pg';

const client = new Client({
    user: 'your_username',
    host: 'localhost',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL database.'))
    .catch(err => console.error('Error connecting to PostgreSQL database:', err));

export default client;