import express from 'express'
import 'dotenv/config'
import {Pool} from 'pg'
import { drizzle } from 'drizzle-orm/neon-http';

const app = express()

const PORT = 3000

const db = drizzle(process.env.DATABASE_URL)

// const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
// const pool = new Pool({
//   host: PGHOST,
//   database: PGDATABASE,
//   username: PGUSER,
//   password: PGPASSWORD,
//   port: 5432,
//   ssl: {
//     require: true,
//   },
// });

// async function getPgVersion(){
//     const client = await pool.connect()
//     try{
//         const result = await client.query('SELECT version()');
//         console.log(result.rows[0]);
//     }finally{
//         client.release();
//     }
// }




app.use(express.json())

app.get('/', (req , res) =>{
    res.send("Hello from server")
})

app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`);  
})