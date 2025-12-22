import { Address } from "viem";

export type PassportDataToSign = {
  subject: Address;
  expiration_timestamp: bigint;
  score: bigint;
};

export type TransactionDetailsToSign = {
  id: Address;
  from: Address;
  to: Address;
  amount: bigint;
};

export type LotusChainGetMessageResponse = {
  Version: number;
  To: string;
  From: string;
  Nonce: number;
  Value: string;
  GasLimit: number;
  GasFeeCap: string;
  GasPremium: string;
  Method: number;
  Params: string;
  CID: {
    "/": string;
  };
};
