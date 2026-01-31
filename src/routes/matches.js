import {Router} from 'express'
import { createMatchSchema, listMatchesQuerySchema } from '../validation/matches.js';
import { matches } from '../db/schema.ts';
import { getMatchStatus } from '../utils/match-status.js';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc } from 'drizzle-orm';

export const matchRouter = Router();
const MAX_LIMIT = 100;
const db = drizzle(process.env.DATABASE_URL);

matchRouter.post('/matches', async (req, res)=>{
    const parsed = createMatchSchema.safeParse(req.body);
    const { data: { startTime, endTime, homeScore, awayScore}} = parsed;
    if(!parsed.success){
        return res.status(400).json({error: 'Invalid payload', details: JSON.stringify(parsed.error)});
    }   

    try{
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore : homeScore ?? 0,
            awayScore : awayScore ?? 0,
            status: getMatchStatus(startTime, endTime)
        }).returning();

        res.status(201).json({
            data: event
        });
    }catch(e){
        res.status(500).json({
            error: "Internal server error",
            details: JSON.stringify(e.message)
        })
    }
});

matchRouter.get('/matches', async(req, res)=>{
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    if (!parsed.success){
                return res.status(400).json({error: 'Invalid query', details: JSON.stringify(parsed.error)});
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);
    try{
        const data = await db.select().from(matches).orderBy((desc(matches.createdAt))).limit(limit);
        res.json({data: data});
    }catch(e){
         res.status(500).json({
            error: "Internal server error",
            details: JSON.stringify(e.message)
        })
    }
})

