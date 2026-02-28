const { Client } = require('pg')
;(async () => {
  try {
    const client = new Client({ connectionString: 'postgresql://postgres.jopheqhwowhtyikfsodj:EasyLoan2024India@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' })
    await client.connect()
    const res = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name='users'")
    console.log('found:', JSON.stringify(res.rows, null, 2))
    await client.end()
  } catch (err) {
    console.error('error', err)
    process.exit(1)
  }
})()
