"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const url_1 = require("url");
// Function to fetch the title of a webpage
function fetchTitle(address, callback) {
    const parsedUrl = new url_1.URL(address);
    const protocol = parsedUrl.protocol === "https:" ? https : http;
    protocol
        .get(address, (res) => {
        let data = "";
        // Accumulate the data
        res.on("data", (chunk) => {
            data += chunk.toString();
        });
        // On end, parse the title
        res.on("end", () => {
            const match = data.match(/<title>([^<]*)<\/title>/);
            const title = match ? match[1] : "NO RESPONSE";
            callback(null, { address, title });
        });
    })
        .on("error", (err) => {
        callback(null, { address, title: "NO RESPONSE" });
    });
}
// Create the server
http
    .createServer((req, res) => {
    const reqUrl = new url_1.URL(req.url || "", `http://${req.headers.host}`);
    if (reqUrl.pathname === "/I/want/title") {
        const addresses = reqUrl.searchParams.getAll("address");
        let results = [];
        let completedRequests = 0;
        // Fetch the titles for all addresses
        addresses.forEach((address) => {
            console.log(address);
            fetchTitle(address, (err, result) => {
                results.push(result);
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
    }
    else {
        // Return 404 for all other routes
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    }
})
    .listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
});
