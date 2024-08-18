import * as http from "http";
import * as https from "https";
import { URL } from "url";
import { FetchTitleStatus } from "./enums/fetchTitleStatus"; // Import the message enum

export interface TitleResult {
  address: string;
  title: string;
}

export function fetchTitle(address: string): Promise<TitleResult> {
  return new Promise((resolve, reject) => {
    // Automatically add 'http://' if the protocol is missing
    if (!/^https?:\/\//i.test(address)) {
      address = `http://${address}`;
    }

    const parsedUrl = new URL(address);
    const protocol = parsedUrl.protocol === "https:" ? https : http;

    const request = protocol.get(address, (res) => {
      // Handle HTTP redirects
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        // Recursively follow the redirect
        fetchTitle(res.headers.location!).then(resolve).catch(reject);
        return;
      }

      let data = "";

      res.on("data", (chunk: Buffer) => {
        data += chunk.toString();
      });

      res.on("end", () => {
        const match = data.match(/<title>([^<]*)<\/title>/);
        const title = match ? match[1] : FetchTitleStatus.NO_RESPONSE;
        resolve({ address, title });
      });
    });

    request.on("error", () => {
      resolve({ address, title: FetchTitleStatus.NO_RESPONSE });
    });
  });
}
