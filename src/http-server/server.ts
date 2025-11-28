import express, { NextFunction, Request, Response } from "express";

import { Address } from "viem";
import { getMessageInfoByCid } from "../blockchain/get-transaction-details.js";
import { signData } from "../blockchain/sign-data.js";
import { SERVICE_CONFIG } from "../config/env.js";
import { fetchStampsScoreByAddress } from "../services/passport-api.js";
import { logger } from "../utils/logger.js";
import { StructToSign } from "../utils/types.js";

const app = express();
const port = SERVICE_CONFIG.APP_PORT || 3000;

const bodyParser = express.json();

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  next();
}

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

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
      data: {
        signedStructSignature: signature,
        signedData: {
          ...structToSign,
          expiration_timestamp: structToSign.expiration_timestamp.toString(),
          score: structToSign.score.toString(),
        },
      },
    });
  }
);

app.get("/message-details", async (req: Request, res: Response) => {
  if (!req.query.msgCid) {
    return res
      .status(400)
      .json({ error: "Missing message CID in request body" });
  }

  const result = await getMessageInfoByCid(req.query.msgCid as string);

  if (!result) {
    return res
      .status(500)
      .json({ error: "Failed to fetch transaction details" });
  }

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    data: {
      from: result.From,
      to: result.To,
      amount: result.Value,
    },
  });
});

app.listen(port, () => {
  logger.info("Attestation service started on port " + port);
  logger.info(`Health endpoint: GET /health`);
  logger.info(`Sign passport struct endpoint: POST /sign-passport-struct`);
  logger.info(`Get transaction details endpoint: GET /transaction-details`);
});
