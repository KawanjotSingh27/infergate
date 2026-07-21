import postgres from "postgres";

let sql: postgres.Sql | null = null;

export function getDb(): postgres.Sql {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    sql = postgres(url, { max: 5 });
  }
  return sql;
}

export interface RequestLogEntry {
  tenantId: string | null;
  provider: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  cacheHit: boolean;
  error?: string;
}

export async function logRequest(entry: RequestLogEntry) {
  const db = getDb();
  await db`
    INSERT INTO requests
      (tenant_id, provider, model, tokens_in, tokens_out, cost_usd, latency_ms, cache_hit, error)
    VALUES
      (${entry.tenantId}, ${entry.provider}, ${entry.model}, ${entry.tokensIn},
       ${entry.tokensOut}, ${entry.costUsd}, ${entry.latencyMs}, ${entry.cacheHit}, ${entry.error ?? null})
  `;
}

export async function findTenantByApiKey(apiKey:string){
  const db=getDb();
  const res=await db`SELECT id, name FROM tenants WHERE api_key = ${apiKey}`;
  return res[0]??null;
}