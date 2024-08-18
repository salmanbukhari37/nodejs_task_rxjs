import * as http from "http";
import * as https from "https";
import { URL } from "url";
import { Observable } from "rxjs";
import { TitleResult } from "./interfaces/TitleResult";
import { FetchTitleStatus } from "./enums/fetchTitleStatus";

export function fetchTitle(address: string): Observable<TitleResult> {
  return new Observable<TitleResult>((subscriber) => {
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
        // Recursively follow the redirect using the same Observable pattern
        fetchTitle(res.headers.location!).subscribe(subscriber);
        return;
      }

      let data = "";

      res.on("data", (chunk: Buffer) => {
        data += chunk.toString();
      });

      res.on("end", () => {
        const match = data.match(/<title>([^<]*)<\/title>/);
        const title = match ? match[1] : FetchTitleStatus.NO_RESPONSE;
        subscriber.next({ address, title });
        subscriber.complete();
      });
    });

    request.on("error", () => {
      subscriber.next({ address, title: FetchTitleStatus.NO_RESPONSE });
      subscriber.complete();
    });
  });
}
