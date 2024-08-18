import * as http from "http";
import { URL } from "url";
import { fetchTitle, TitleResult } from "./fetchTitle";

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url || "", `http://${req.headers.host}`);

  const pathname = reqUrl.pathname.replace(/\/$/, ""); // Removes trailing slash

  if (pathname === "/I/want/title") {
    const addresses = reqUrl.searchParams.getAll("address");

    let results: TitleResult[] = [];
    let completedRequests = 0;

    addresses.forEach((address) => {
      fetchTitle(address, (err, result) => {
        results.push(result!);
        completedRequests++;

        if (completedRequests === addresses.length) {
          // When all requests are done, render the HTML response
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write("<html><head></head><body>");
          res.write("<h1>Following are the titles of given websites:</h1>");
          res.write("<ul>");
          results.forEach((result) => {
            res.write(`<li>${result.address} - "${result.title}"</li>`);
          });
          res.write("</ul></body></html>");
          res.end();
        }
      });
    });
  } else {
    // Return 404 for all other routes
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
