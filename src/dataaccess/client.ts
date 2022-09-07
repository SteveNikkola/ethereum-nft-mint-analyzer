import {Client} from 'pg';

const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT!),
})

async function processQuery(query: string) {
    await client.connect();
    await client.query(query);
    await client.end();
}

export {processQuery}