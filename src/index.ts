import "./http-server/server.js";

import { logger } from "./utils/logger.js";

try {
  logger.info("Starting Filecoin Attestation Service...");
} catch (err: unknown) {
  if (err instanceof Error) {
    const message = err instanceof Error ? err.message : String(err);

    logger.error(`Fatal startup error: ${message}`);
  } else {
    logger.error(`Fatal startup error: ${err}`);
  }
  process.exit(1);
}
