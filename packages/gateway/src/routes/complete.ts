import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ProviderRegistry } from "../providers/registry.js";
import { ProviderError } from "../providers/types.js";
import { logRequest } from "../lib/db.js";
import {authHook} from '../lib/auth.js';

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ),
  provider: z.string().optional(),
  model: z.string().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
});

export function registerCompleteRoute(app: FastifyInstance, registry: ProviderRegistry) {
  app.post("/v1/complete", {preHandler:authHook}, async (request, reply) => {
    const parsed = requestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
    }

    const { messages, provider: providerName, model, maxTokens, temperature } = parsed.data;
    const provider = providerName ? registry.get(providerName) : registry.pickDefault();

    try {
      const result = await provider.complete({ messages, model, maxTokens, temperature });
      logRequest({
        tenantId: (request as any).tenant.id,
        provider: result.provider,
        model: result.model,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        costUsd: result.costUsd,
        latencyMs: result.latencyMs,
        cacheHit: result.cacheHit,
      }).catch((err) => app.log.error({ err }, "failed to log request"));
      return reply.send(result);
    } catch (err) {
      if (err instanceof ProviderError) {
        app.log.error({ err }, `provider ${err.provider} failed`);
        return reply.status(502).send({ error: `Provider ${err.provider} failed`, message: err.message });
      }
      app.log.error({ err }, "unexpected error");
      return reply.status(500).send({ error: "Internal error" });
    }
  });
}