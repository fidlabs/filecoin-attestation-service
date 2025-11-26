import "dotenv/config";

export const EnvKeys = {
  LOG_LEVEL: "LOG_LEVEL",
  WALLET_PRIVATE_KEY: "WALLET_PRIVATE_KEY",
  RPC_URL: "RPC_URL",
  CHAIN_ID: "CHAIN_ID",
  APP_PORT: "APP_PORT",
  API_PASSPORT_URL: "API_PASSPORT_URL",
  API_PASSPORT_API_KEY: "API_PASSPORT_API_KEY",
  API_PASSPORT_SCORER_ID: "API_PASSPORT_SCORER_ID",
} as const;

type EnvKey = (typeof EnvKeys)[keyof typeof EnvKeys];

export const SERVICE_CONFIG: Record<EnvKey, string> = {
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY || "",
  RPC_URL: process.env.RPC_URL || "",
  CHAIN_ID: process.env.CHAIN_ID || "",
  APP_PORT: process.env.APP_PORT || "3000",
  API_PASSPORT_URL: process.env.API_PASSPORT_URL || "",
  API_PASSPORT_API_KEY: process.env.API_PASSPORT_API_KEY || "",
  API_PASSPORT_SCORER_ID: process.env.API_PASSPORT_SCORER_ID || "",
};
