import { Address } from "viem";

export type StructToSign = {
  subject: Address;
  expiration_timestamp: bigint;
  score: bigint;
};
