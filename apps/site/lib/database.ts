import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const databaseEnvNames = [
  "NEWSJACK_DATABASE_URL",
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
] as const;

let cachedSql: NeonQueryFunction<false, false> | undefined;

export function databaseUrl(): string | undefined {
  for (const name of databaseEnvNames) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }
  return undefined;
}

export function db(): NeonQueryFunction<false, false> {
  if (!cachedSql) {
    const url = databaseUrl();
    if (!url) {
      throw new Error(
        `${databaseEnvNames.join(" or ")} must be set for the Newsjack web app.`,
      );
    }
    cachedSql = neon(url);
  }
  return cachedSql;
}
