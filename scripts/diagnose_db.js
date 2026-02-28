
const { Client } = require('pg');
require('dotenv').config();

async function checkDb() {
    const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('No database URL found');
        process.exit(1);
    }

    const client = new Client({ connectionString: dbUrl });
    try {
        await client.connect();
        console.log('Connected to database');

        const tables = ['users', 'loan_applications', 'loans', 'personal_info', 'bank_details', 'transactions', 'admin', 'admin_activity_log', 'withdrawals'];

        for (const table of tables) {
            try {
                const res = await client.query(`SELECT count(*) FROM public.${table}`);
                console.log(`Table ${table} exists. Row count: ${res.rows[0].count}`);

                const columns = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = '${table}'
        `);
                console.log(`Columns in ${table}:`);
                columns.rows.forEach(row => console.log(`  - ${row.column_name} (${row.data_type})`));
            } catch (err) {
                console.error(`Error checking table ${table}: ${err.message}`);
            }
        }
    } catch (err) {
        console.error('Connection error:', err.message);
    } finally {
        await client.end();
    }
}

checkDb();
