import { FastifyReply, FastifyRequest } from "fastify";
import { findTenantByApiKey } from "./db.js";
import { checkRateLimit } from "./rate-limit.js";

export async function authHook(request:FastifyRequest, reply:FastifyReply){
    const authHeader=request.headers.authorization;
    if(!authHeader) return reply.status(401).send("Auth Header not found");
    const stripHeader=authHeader.slice(7);
    if(!stripHeader) return reply.status(401).send("Bearer Prefix not found");
    const info=await findTenantByApiKey(stripHeader);
    if(!info) return reply.status(401).send("Tenant not found");
    const allowed = await checkRateLimit(info.id, 10, 1); 
    if (!allowed) {
    return reply.status(429).send({ error: "Rate limit exceeded" });
    }
    (request as any).tenant=info;
}