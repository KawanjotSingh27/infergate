import Fastify from "fastify";
import { ProviderRegistry } from "./providers/registry.js";
import { registerCompleteRoute } from "./routes/complete.js";
import "dotenv/config";

const app = Fastify({
  logger: {
    level: "info",
    transport: { target: "pino-pretty" },
  },
});

const registry = new ProviderRegistry({
  openaiKey:process.env.OPENAI_API_KEY,
  anthropicKey:process.env.ANTHROPIC_API_KEY
});

app.get("/health", async () => {
  return { status: "ok" };
});

registerCompleteRoute(app, registry);

app
  .listen({ port: 3000, host: "0.0.0.0" })
  .then(() => app.log.info("gateway listening on :3000"))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });