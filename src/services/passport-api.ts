import { Address } from "viem";
import { SERVICE_CONFIG } from "../config/env.js";
import { logger } from "../utils/logger.js";

async function fetchPassportData(url: string) {
  logger.info(`Fetching data from Passport API: ${url} ...`);

  const passportResponse = await fetch(url, {
    headers: {
      "x-api-key": SERVICE_CONFIG.API_PASSPORT_API_KEY,
    },
  });

  if (!passportResponse.ok) {
    throw new Error(
      `Failed to fetch data from Passport API service: ${passportResponse.status} ${passportResponse.statusText}`
    );
  }

  const data = await passportResponse.json();

  logger.info(`Received data from Passport API`);

  return data;
}

export async function fetchStampsByAddress(
  address: string,
  withMetadata = false
): Promise<void | null> {
  const url = `${SERVICE_CONFIG.API_PASSPORT_URL}/v2/stamps/${address}?include_metadata=${withMetadata}`;

  try {
    return await fetchPassportData(url);
  } catch (error) {
    logger.error(`Failed to fetch stamps for address ${address}: ${error}`);
  }
}

type StampsScoreResponse = {
  address: string;
  score: string;
  passing_score: boolean;
  last_score_timestamp: string;
  expiration_timestamp: string;
  threshold: string;
  error: string | null;
};

export async function fetchStampsScoreByAddress(
  address: Address
): Promise<StampsScoreResponse | null> {
  const scorer_id = SERVICE_CONFIG.API_PASSPORT_SCORER_ID;
  const url = `${SERVICE_CONFIG.API_PASSPORT_URL}/v2/stamps/${scorer_id}/score/${address}`;

  try {
    const data = await fetchPassportData(url);
    return data as StampsScoreResponse;
  } catch (error) {
    logger.error(
      `Failed to fetch stamps score for address ${address}: ${error}`
    );
    return null;
  }
}
