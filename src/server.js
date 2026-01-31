import express from 'express'
import 'dotenv/config'
import {Pool} from 'pg'
import { drizzle } from 'drizzle-orm/neon-http';
import {matchRouter} from './routes/matches.js'
import http from 'http'
import { attachWebSocketServer } from './ws/server.js';
import { securityMiddleware } from './arcjet.js';

const PORT = 3000
const HOST = '0.0.0.0'

const app = express()
const server = http.createServer(app)

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

app.use(securityMiddleware())

app.use('/api/v1', matchRouter)

const {broadCastMatchCreated} = attachWebSocketServer(server)
app.locals.broadCastMatchCreated = broadCastMatchCreated

server.listen(PORT, HOST, ()=>{
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://localhost:${HOST}/${PORT}`;
    console.log(`Server is listening on port ${baseUrl}`); 
    console.log(`WebSocket server is running on ${baseUrl.replace('http', 'ws')}/ws`);
     
})