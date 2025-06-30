## 🔤 Why Is It Called "HTTP"?

- HyperText Transfer Protocol.
- It was designed to transfer hypertext documents (like HTML pages) over the internet
- It uses a set of rules (protocol) for communication between clients (like browsers) and servers.

## 🌐 Why HTTP Became Popular?

- Simple and stateless: Easy to scale.
- Universally adopted by all browsers and devices.
- Supports REST architecture (clean, readable APIs).
- Easy to debug with tools like Postman or browser DevTools.

### 🔄 Are There Alternatives to HTTP?

Yes, but they serve different purposes:

| **Alternative**        | **What It's Used For**                                                |
|------------------------|----------------------------------------------------------------------|
| **HTTPS**              | Secure version of HTTP (adds encryption using TLS/SSL)               |
| **WebSocket**          | Real-time, two-way communication (e.g., live chat, games)            |
| **gRPC**               | High-performance Remote Procedure Call (RPC) framework               |
| **GraphQL over HTTP**  | More efficient querying by fetching only the needed data             |


### 🧠 Summary Table

| Feature             | `http.createServer`         | Express.js                         |
|---------------------|------------------------------|-------------------------------------|
| **Built-in**         | ✅ Yes                       | ❌ No (need to install)             |
| **Routing**          | ❌ Manual                    | ✅ Built-in                         |
| **Middleware**       | ❌ Not supported             | ✅ Supported                        |
| **Request Parsing**  | ❌ Manual                    | ✅ Auto (JSON, form, etc.)          |
| **Development Speed**| 🚶‍♂️ Slower                  | 🚀 Faster                           |
| **Best for**         | Learning, small projects     | Scalable web/API applications       |
