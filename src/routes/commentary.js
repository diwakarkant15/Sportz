
import { Router } from "express";
import { matchIdParamSchema } from "../validation/matches.js";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";
import { commentary } from "../db/schema.ts";
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc } from "drizzle-orm";


const db = drizzle(process.env.DATABASE_URL);
const MAX_LIMIT = 100;

export const commentaryRouter = Router({mergeParams : true});


commentaryRouter.get('/', (req, res) => {
    res.status(200).json({
        message: "Commentary list"
    })
})

commentaryRouter.get('/', async (req, res)=>{
    const paramsResult = matchIdParamSchema.safeParse(req.params);
    if(!paramsResult.success){
        return res.status(400).json({
            error: 'Invalid match ID',
            details: paramsResult.error.issues
        })
    }

    const queryResult = listCommentaryQuerySchema.safeParse(req.body);
    if(!queryResult.success){
        return res.status(400).json({
            error: "invalid query params",
            details: queryResult.error.issues
        })
    }

    try{
        const {id: matchId} = paramsResult.data;
        const {limit = 10 } = queryResult.data;

        const safeLimit = Math.min(limit, MAX_LIMIT);
        const results = await db.select().from(commentary).where(eq(commentary.matchId, matchId)).orderBy(desc(commentary.createdAt)).limit(safeLimit);
        
        res.status(200).json({
            data: results
        })
    }catch(e){
        console.error('Failed to fetch commentary: ', e.message);
        res.status(500).json({
            error: 'Failed to fetch commentary'
        });
    }
});

commentaryRouter.post('/', async(req, res)=>{
    const paramsResult = matchIdParamSchema.safeParse(req.params);
    if(!paramsResult.success){
        return res.status(400).json({
            error: "Invalid match ID",
            details: paramsResult.error.issues
        })
    }
    const bodyResult = createCommentarySchema.safeParse(req.body);
    if(!bodyResult.success){
        return res.status(400).json({
            error: 'Invalid commentary payload',
            details: bodyResult.error.issues
        })
    }
    
    try{
        const {minutes, ...rest} = bodyResult.data;
        const [result] = await db.insert(commentary).values({
            matchId: paramsResult.data.id,
            minute: minutes,
            ...rest
        }).returning();

        res.status(201).json({ data: result});
    }catch(e){
        console.error('Failed to create commentary', e.message);
        return res.status(500).json({
            error: "Failed to create commentary"
        })
    }
})