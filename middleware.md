# 🤩 Express.js Middleware – Full Guide

Middleware is a function that runs **between** when a request is received and a response is sent. It has access to:
- `req` – Request Object
- `res` – Response Object
- `next()` – Passes control to the next middleware

---

## 🧠 Analogy

Imagine your app is a restaurant:
1. A **customer** (request) comes in.
2. The **waiter** (middleware) checks the order.
3. The **chef** (route handler) cooks the meal.
4. The **waiter** delivers the response.

Each step (like checking ID, cleaning table, etc.) = middleware function.

---

## ✅ Basic Middleware Syntax

```js
app.use((req, res, next) => {
  console.log('Middleware runs!');
  next(); // Move to the next middleware or route handler
});
```

---

## 🔄 Types of Middleware

| Type                 | Description                                 |
|----------------------|---------------------------------------------|
| Application-level     | Runs for all routes using `app.use()`       |
| Route-level           | Runs for specific routes only               |
| Error-handling        | Handles errors (has 4 parameters)           |
| Built-in              | Built-in Express middleware                 |
| Third-party           | Middleware from NPM (e.g., `cors`, `helmet`)|

---

## 📂 Application-level Middleware

```js
app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});
```

---

## 🚦 Route-level Middleware

```js
const logMiddleware = (req, res, next) => {
  console.log('Only for /about');
  next();
};

app.get('/about', logMiddleware, (req, res) => {
  res.send('About page');
});
```

---

## ❌ Error-handling Middleware

```js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

---

## 📆 Built-in Middleware

```js
app.use(express.json()); // Parses JSON body
app.use(express.urlencoded({ extended: true })); // Parses form data
app.use(express.static('public')); // Serves static files
```

---

## 🌍 Third-party Middleware

Install:
```bash
npm install cors helmet morgan
```

Use:
```js
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));
```

---

## 🛠️ Custom Middleware Example

```js
const express = require('express');
const app = express();

// 1. Logger Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 2. JSON Body Parser
app.use(express.json());

// 3. Route
app.post('/data', (req, res) => {
  res.send(`Received: ${JSON.stringify(req.body)}`);
});

// 4. Error Handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).send('Server Error');
});

app.listen(3000, () => console.log('Server running'));
```

---

## ⚠️ Rules to Remember

- Always call `next()` unless ending the response.
- Middleware order **matters** (top to bottom).
- You can stack multiple middleware for a route.

---

## 🧠 Interview Tips – Middleware

| Question                         | Tip                                         |
|----------------------------------|----------------------------------------------|
| What is middleware?              | Functions in the request-response cycle     |
| How does middleware help?        | Reuse logic like auth, logging, parsing     |
| What happens without `next()`?   | Request hangs – response never sent         |

---
