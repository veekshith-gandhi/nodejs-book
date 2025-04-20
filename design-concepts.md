# 🧠 Node.js Design Concepts

A list of fundamental design concepts that power Node.js internally:

| Concept                        | Description |
|-------------------------------|-------------|
| **Single-threaded Event Loop** | Node.js uses a single thread (the event loop) to handle multiple connections efficiently. |
| **Non-blocking I/O**           | I/O operations (like file reading or HTTP requests) are handled asynchronously without blocking the main thread. |
| **Event-driven Architecture**  | Code execution is based on events and callbacks, allowing high concurrency. |
| **libuv**                      | A C++ library that provides the event loop and thread pool for handling async operations in Node.js. |
| **Callback Queue**            | A queue where completed asynchronous task callbacks are pushed for execution by the event loop. |
| **Microtasks & Macrotasks**   | Task queues that prioritize operations: microtasks (Promises, `process.nextTick`) and macrotasks (`setTimeout`, `setImmediate`). |
| **V8 Engine**                 | The JavaScript engine (from Chrome) used to compile and execute JS code in Node.js. |
| **C++ Bindings**              | Core modules like `fs`, `http`, etc., are built on C++ and connected to JS using bindings. |
| **Module System**             | Node.js uses CommonJS (`require`) and supports ES Modules (`import`). Helps organize code into reusable modules. |
| **Streaming & Buffering**     | Node handles large data flows (like files, audio) in chunks using streams, preventing memory overload. |
| **Cluster Module**            | Allows scaling Node.js apps by spawning multiple processes (workers) sharing the same port. |
| **Worker Threads**            | Provides actual multi-threading support for CPU-intensive tasks in the background. |
| **Garbage Collection (V8)**   | V8 automatically clears unused memory objects to free up space. |
| **Middleware Pattern**        | Used in frameworks like Express.js to handle requests/responses in a layered way. |
| **Error Handling**            | Errors are managed with try/catch for sync code and callbacks/`.catch()` for async code. |

---

📝 These concepts help Node.js remain lightweight, fast, and efficient—perfect for real-time apps and high-performance backend services.
