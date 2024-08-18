import * as http from "http";
import { URL } from "url";
import { fetchTitle, TitleResult } from "./fetchTitle";
import async from "async";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get the port from environment variables, defaulting to 3000 if not set
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url || "", `http://${req.headers.host}`);

  const pathname = reqUrl.pathname.replace(/\/$/, ""); // Removes trailing slash

  if (pathname === "/I/want/title") {
    const addresses = reqUrl.searchParams.getAll("address");

    async.map(
      addresses,
      (
        address: string,
        callback: (err: Error | null, result: TitleResult | null) => void
      ) => {
        fetchTitle(address, callback);
      },
      (err: Error | null | undefined, results: Array<TitleResult | null>) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Server Error");
          return;
        }

        // Filter out null results
        const filteredResults = results.filter(
          (result) => result !== null
        ) as TitleResult[];

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write("<html><head></head><body>");
        res.write("<h1>Following are the titles of given websites:</h1>");
        res.write("<ul>");
        filteredResults.forEach((result) => {
          res.write(`<li>${result.address} - "${result.title}"</li>`);
        });
        res.write("</ul></body></html>");
        res.end();
      }
    );
  } else {
    // Return 404 for all other routes
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
