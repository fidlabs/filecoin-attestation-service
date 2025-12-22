import { Address } from "viem";
import { SERVICE_CONFIG } from "../config/env.js";
import { logger } from "../utils/logger.js";
import {
  PassportDataToSign,
  TransactionDetailsToSign,
} from "../utils/types.js";
import { getWalletClient, walletAccount } from "./blockchain-client.js";

const signDataDomainPayload = {
  name: "Passport Attestation Service",
  version: "1",
  chainId: Number(SERVICE_CONFIG.CHAIN_ID),
};

export async function signPassportData(
  dataToSign: PassportDataToSign
): Promise<Address> {
  const walletClient = getWalletClient();

  if (!walletClient) {
    throw new Error("Wallet client is not initialized");
  }

  logger.info(`Signing passport data...`);

  const signature = await walletClient.signTypedData({
    account: walletAccount,
    domain: signDataDomainPayload,
    types: {
      Passport: [
        { name: "subject", type: "address" },
        { name: "expiration_timestamp", type: "uint256" },
        { name: "score", type: "uint64" },
      ],
    },
    primaryType: "Passport",
    message: dataToSign,
  });

  logger.info(`Passport data signed. Signature: ${signature}`);

  return signature;
}

export async function signTransactionDetailsData(
  dataToSign: TransactionDetailsToSign
): Promise<Address> {
  const walletClient = getWalletClient();

  if (!walletClient) {
    throw new Error("Wallet client is not initialized");
  }

  logger.info(`Signing transaction details data...`);

  const signature = await walletClient.signTypedData({
    account: walletAccount,
    domain: signDataDomainPayload,
    types: {
      PaymentTransaction: [
        { name: "id", type: "bytes" },
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
      ],
    },
    primaryType: "PaymentTransaction",
    message: dataToSign,
  });

  logger.info(`Transaction details data signed. Signature: ${signature}`);

  return signature;
}
