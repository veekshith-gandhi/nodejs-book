# What is the Event Loop?

Node.js uses an event loop to handle asynchronous tasks. Since Node.js is single-threaded, it cannot wait for one task to finish before starting another. Instead, it delegates tasks (like file reading, API calls) and processes them when they are ready.

# Task Types in Node.js

## Microtasks (High Priority)

- These run immediately after the current execution finishes and before the event loop continues to the next phase.
1. process.nextTick() (Highest priority in Node.js)
2. Promise.then() and Promise.catch()
3. queueMicrotask()

## Macrotasks (Lower Priority)
- These run in different event loop phases and include:

1. setTimeout()
2. setInterval()
3. setImmediate()
4. I/O operations (e.g., fs.readFile())
5. Timers and other callbacks


## Perfect Analogy for Microtasks vs. Macrotasks
## 🎬 Think of a Restaurant
### Imagine you're at a busy restaurant:

- Microtasks (Immediate Attention - Urgent VIP Customers)
These are customers who call the waiter directly for urgent orders (like extra ketchup).
Waiter stops for a second and serves them before moving to the next table.
- Macrotasks (Regular Orders - Scheduled Tasks)
These are regular food orders (setTimeout, setImmediate, file reading).
The waiter takes the order, sends it to the kitchen, and serves other tables while waiting.
- Event Loop (The Waiter)
The waiter (event loop) keeps moving between tables (tasks).
After serving VIP customers (microtasks), they go back to serving regular food orders (macrotasks).

## Execution Order in Node.js
Step-by-Step Order of Execution
1. Run Synchronous Code (main script).
2. Run Microtasks (process.nextTick and Promises).
3. Run Macrotasks in the Event Loop Phases (setTimeout, I/O, setImmediate).


## 📌 Execution Priority Order in Node.js
1️⃣ Synchronous Code (Top Priority)

Executes first before anything else.
Example: console.log("Start")
2️⃣ process.nextTick() (Highest Priority Microtask)

Runs immediately after synchronous code and before the event loop continues.
Example: process.nextTick(() => console.log("nextTick"))
3️⃣ Microtasks (Promise then/catch, queueMicrotask)

Runs after nextTick but before Macrotasks.
Example: Promise.resolve().then(() => console.log("Promise"))
4️⃣ Timers Phase (setTimeout, setInterval)

Executes after the given delay.
Example: setTimeout(() => console.log("setTimeout"), 0)
5️⃣ I/O Callbacks Phase (fs.readFile, network requests)

Runs callbacks after I/O operations complete.
Example: fs.readFile("file.txt", () => console.log("File Read"))
6️⃣ Check Phase (setImmediate)

Executes callbacks scheduled with setImmediate().
Example: setImmediate(() => console.log("setImmediate"))
7️⃣ Close Callbacks Phase (cleanup operations)

Runs cleanup tasks for closed resources (e.g., socket.on("close")).

 ┌───────────────────────────┐
 │        Main Script        │
 │  (Synchronous Execution)  │
 └───────────┬───────────────┘
             │
             ▼
 ┌───────────────────────────┐
 │  process.nextTick() Queue │  <--- Highest Priority Microtask
 └───────────┬───────────────┘
             │
             ▼
 ┌───────────────────────────┐
 │    Microtasks Queue       │  <--- Promises, queueMicrotask()
 └───────────┬───────────────┘
             │
             ▼
 ┌───────────────────────────┐
 │    Macrotasks (Timers)    │  <--- setTimeout, setInterval
 └───────────┬───────────────┘
             │
             ▼
 ┌───────────────────────────┐
 │  I/O Callbacks Phase      │  <--- fs.readFile, network calls
 └───────────┬───────────────┘
             │
             ▼
 ┌───────────────────────────┐
 │    Check Phase (setImmd)  │  <--- setImmediate()
 └───────────┬───────────────┘
             │
             ▼
 ┌───────────────────────────┐
 │  Close Callbacks Phase    │  <--- socket.on("close")
 └───────────────────────────┘
