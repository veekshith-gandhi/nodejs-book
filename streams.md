## 🚰 1. What are Streams?
- Streams are like flowing water. They let you process data chunks piece-by-piece, rather than loading the whole thing in memory. This is super helpful for:

1. 🗂️ File reading/writing
2. 🌐 HTTP requests/responses
3. 🔄 Data transformations (e.g., compressing, encoding)


## 📦 Types of Streams
### 🔹 a) Readable Streams
- Streams you read from.
- Examples: fs.createReadStream, http.IncomingMessage
- const fs = require('fs');
- const readable = fs.createReadStream('bigfile.txt');
- readable.on('data', (chunk) => console.log(chunk.toString()));

### 🔸 b) Writable Streams
- Streams you write to.
- Examples: fs.createWriteStream, http.ServerResponse
- const writable = fs.createWriteStream('output.txt');
- writable.write('Hello, stream!');

### 🔁 c) Duplex Streams
- Can read and write.

### 🔀 d) Transform Streams
- Like Duplex, but also modifies data as it passes.

### 🔄 3. pipe() and unpipe()

- pipe(): Sends output of one stream to another
- const read = fs.createReadStream('input.txt');
- const write = fs.createWriteStream('output.txt');
- read.pipe(write);
- Handles errors automatically
- Closes the writable stream on end of readable

- unpipe(): Stops the piping
- read.unpipe(write);