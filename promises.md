### 🧠 What is a Promise in JavaScript?
- A Promise is an object that represents the eventual result of an asynchronous operation — either a success or a failure.

### Think of it like a food delivery app:

1. You place an order (start an async task).
2. You get a Promise (token/receipt).
3. Later, the food is either delivered (resolved ✅) or cancelled (rejected ❌).

### ✅ Why are Promises used?

1. To avoid callback hell (nested callbacks).
2. To handle async operations cleanly (like fetching APIs, reading files, timers).
3. To allow chaining of async steps.


### 🔄 Life Cycle of a Promise
A Promise can be in one of three states:


State	------------Meaning
1. Pending	------------Initial state, operation ongoing
2. Fulfilled ----------Operation successful (resolve)
3. Rejected	--------Operation failed (reject)


### 🔗 JavaScript Promise Methods

| Method                       | Description                                                                  | Returns              | Example                                                                 |
|-----------------------------|------------------------------------------------------------------------------|----------------------|-------------------------------------------------------------------------|
| `Promise.resolve(value)`    | Creates a Promise that **resolves immediately** with the given value.        | Fulfilled Promise    | `Promise.resolve(42).then(console.log)` → `42`                          |
| `Promise.reject(reason)`    | Creates a Promise that **rejects immediately** with a reason.                | Rejected Promise     | `Promise.reject("Error").catch(console.error)`                          |
| `Promise.all([p1, p2])`     | Waits for **all Promises to resolve**. Fails fast if any one rejects.        | Array of results     | `Promise.all([p1, p2]).then(console.log)`                               |
| `Promise.allSettled([p1])`  | Waits for **all Promises to settle** (resolve or reject).                   | Array of statuses    | `Promise.allSettled([p1, p2]).then(console.log)`                        |
| `Promise.race([p1, p2])`    | Returns result of the **first settled Promise** (resolve or reject).         | Single result        | `Promise.race([p1, p2]).then(console.log)`                              |
| `Promise.any([p1, p2])`     | Returns the **first fulfilled Promise**. Throws aggregate error if all fails.    | First success value  | `Promise.any([p1, p2]).then(console.log)`                               |

## 🔁 forEach() and Promises: Why They Don't Mix
- In JavaScript, forEach() is a synchronous array method. It doesn’t wait for any asynchronous operation inside it to finish before moving to the next item.

### 🔎 The Problem
- If you use async/await inside a forEach(), the outer function doesn’t wait for all the Promises to resolve.
- forEach doesn’t return a Promise.
- So even though the callback is async, forEach doesn't know or care.
- It doesn't wait for anything. It just keeps looping synchronously.
