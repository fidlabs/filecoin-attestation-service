import express, { NextFunction, Request, Response } from "express";

import { Address } from "viem";
import { signData } from "../blockchain/sign-data.js";
import { SERVICE_CONFIG } from "../config/env.js";
import { fetchStampsScoreByAddress } from "../services/passport-api.js";
import { logger } from "../utils/logger.js";
import { StructToSign } from "../utils/types.js";

const app = express();
const port = SERVICE_CONFIG.APP_PORT || 3000;

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  next();
}

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const bodyParser = express.json();

app.post(
  "/sign-passport-struct",
  bodyParser,
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.body.address) {
      return res.status(400).json({ error: "Missing address in request body" });
    }

    const result = await fetchStampsScoreByAddress(req.body.address);

    if (!result) {
      return res.status(500).json({ error: "Failed to fetch stamps score" });
    }

    const structToSign: StructToSign = {
      subject: result.address as Address,
      expiration_timestamp: BigInt(
        Math.floor(new Date(result.expiration_timestamp).getTime() / 1000)
      ),
      score: BigInt(Math.floor(Number(result.score))),
    };

    const signature = await signData(structToSign);

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      struct: structToSign,
      signedStructSignature: signature,
    });
  }
);

app.listen(port, () => {
  logger.info("Attestation service started on port " + port);
  logger.info(`Health endpoint: GET /health`);
});
