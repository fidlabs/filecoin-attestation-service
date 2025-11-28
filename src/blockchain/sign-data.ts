import { Address } from "viem";
import { SERVICE_CONFIG } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { StructToSign } from "../utils/types.js";
import { getWalletClient, walletAccount } from "./blockchain-client.js";

export async function signData(dataToSign: StructToSign): Promise<Address> {
  const walletClient = getWalletClient();

  if (!walletClient) {
    throw new Error("Wallet client is not initialized");
  }

  logger.info(`Signing data...`);

  const signature = await walletClient.signTypedData({
    account: walletAccount,
    domain: {
      name: "Passport Attestation Service",
      version: "1",
      chainId: Number(SERVICE_CONFIG.CHAIN_ID),
    },
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

  logger.info(`Data signed. Signature: ${signature}`);

  return signature;
}
