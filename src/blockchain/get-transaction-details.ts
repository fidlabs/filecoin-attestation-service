import { SERVICE_CONFIG } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { LotusChainGetMessageResponse } from "../utils/types.js";

export async function getMessageInfoByCid(
  messageCid: string
): Promise<LotusChainGetMessageResponse | undefined> {
  const body = {
    jsonrpc: "2.0",
    method: "Filecoin.ChainGetMessage",
    params: [{ "/": messageCid }],
    id: 1,
  };

  try {
    logger.info(`Fetching transaction details for message CID: ${messageCid}`);

    const res = await fetch(SERVICE_CONFIG.RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

    const data = await res.json();

    if (data.error)
      throw new Error(`Lotus error: ${JSON.stringify(data.error)}`);

    return data.result;
  } catch (err) {
    logger.error("Error while request to lotus API: " + err);
  } finally {
    logger.info(
      `Fetching transaction details for message CID: ${messageCid} - done`
    );
  }
}
