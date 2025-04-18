## 🚰 1. What are Streams?
- Streams are like flowing water. They let you process data chunks piece-by-piece, rather than loading the whole thing in memory. This is super helpful for:

1. 🗂️ File reading/writing
2. 🌐 HTTP requests/responses
3. 🔄 Data transformations (e.g., compressing, encoding)


## 📦 Types of Streams
### 🔹 a) Readable Streams
- Streams you read from.
- Examples: fs.createReadStream, http.IncomingMessage
const fs = require('fs');
const readable = fs.createReadStream('bigfile.txt');
readable.on('data', (chunk) => console.log(chunk.toString()));