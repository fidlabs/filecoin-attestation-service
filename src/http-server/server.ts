import express, { NextFunction, Request, Response } from "express";

import { Address } from "viem";
import { getMessageInfoByCid } from "../blockchain/get-transaction-details.js";
import {
  signPassportData,
  signTransactionDetailsData,
} from "../blockchain/sign-data.js";
import { SERVICE_CONFIG } from "../config/env.js";
import { fetchStampsScoreByAddress } from "../services/passport-api.js";
import { logger } from "../utils/logger.js";
import {
  PassportDataToSign,
  TransactionDetailsToSign,
} from "../utils/types.js";

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

    const passportDataToSign: PassportDataToSign = {
      subject: result.address as Address,
      expiration_timestamp: BigInt(
        Math.floor(new Date(result.expiration_timestamp).getTime() / 1000)
      ),
      score: BigInt(Math.floor(Number(result.score))),
    };

    const signature = await signPassportData(passportDataToSign);

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      data: {
        signedSignature: signature,
        signedData: {
          subject: passportDataToSign.subject,
          expiration_timestamp:
            passportDataToSign.expiration_timestamp.toString(),
          score: passportDataToSign.score.toString(),
        },
      },
    });
  }
);

app.post(
  "/sign-message-details",
  bodyParser,
  authMiddleware,
  async (req: Request, res: Response) => {
    if (!req.body.msgCid) {
      return res
        .status(400)
        .json({ error: "Missing message CID in request body" });
    }

    const result = await getMessageInfoByCid(req.query.msgCid as string);

    const transactionDetailsToSign: TransactionDetailsToSign = {
      id: req.query.msgCid as Address,
      from: result?.From as Address,
      to: result?.To as Address,
      amount: BigInt(result!.Value),
    };

    const signature = await signTransactionDetailsData(
      transactionDetailsToSign
    );

    if (!result) {
      return res
        .status(500)
        .json({ error: "Failed to fetch transaction details" });
    }

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      data: {
        signedSignature: signature,
        signedData: {
          id: transactionDetailsToSign.id,
          from: transactionDetailsToSign.from,
          to: transactionDetailsToSign.to,
          amount: transactionDetailsToSign.amount.toString(),
        },
      },
    });
  }
);

app.listen(port, () => {
  logger.info("Attestation service started on port " + port);
  logger.info(`Health endpoint: GET /health`);
  logger.info(`Sign passport struct endpoint: POST /sign-passport-struct`);
  logger.info(`Get transaction details endpoint: GET /transaction-details`);
});
