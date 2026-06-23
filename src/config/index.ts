import dotenv from "dotenv";

dotenv.config();

// Centralized, typed environment access. Every other module reads from
// here instead of reaching for process.env directly, so defaults and
// naming live in exactly one place.
const env = process.env;

function required(key: string, fallback?: string): string {
  const value = env[key] ?? fallback;
  if (value === undefined) {
    // Fail loudly at boot rather than mid-request.
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const config = {
  nodeEnv: env.NODE_ENV ?? "development",
  isProduction: env.NODE_ENV === "production",
  port: Number(env.PORT ?? 5000),

  databaseUrl: required("DATABASE_URL"),

  jwt: {
    secret: required("JWT_SECRET"),
    expiresIn: env.JWT_EXPIRES_IN ?? "7d",
    // Refresh tokens ship in Phase 14 (Security). Keys reserved here so
    // the auth module can reference them without a second wiring pass.
    refreshSecret: env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN ?? "30d",
  },

  clientUrl: env.CLIENT_URL ?? "http://localhost:5173",

  // Invitation token lifetime, in days.
  invitationExpiresInDays: Number(env.INVITATION_EXPIRES_IN_DAYS ?? 7),
} as const;

export default config;
