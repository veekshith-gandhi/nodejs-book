## 🔍 Node.js Internal Architecture
### 🚀 High-Level Overview
- Node.js is built on:

1. V8 Engine – The JavaScript engine from Google Chrome, which compiles JS code into machine code.

2. libuv – A C library that handles asynchronous I/O, thread pooling, and the event loop.

3. Node.js Bindings – These are C++ functions that connect V8 and libuv to expose low-level system features to JavaScript..