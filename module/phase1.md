# JavaScript Phase 1 — Master JavaScript

> **Goal:** Build a strong JavaScript foundation for Node.js/backend development and be able to explain concepts clearly in interviews.
>
> **Suggested duration:** 2–3 weeks
>
> **Learning method:** For every topic, understand **what → why → syntax → example → common mistakes → interview questions**.

---

# 0. JavaScript Mental Model

JavaScript is a programming language used to create logic and applications.

For backend development with Node.js, you will constantly work with:

- Variables
- Data types
- Functions
- Arrays
- Objects
- Loops
- ES6+
- Modules
- Classes
- Promises
- Async/Await
- Callbacks
- Closures
- `this`

A useful progression:

```text
Variables
   ↓
Data Types
   ↓
Functions
   ↓
Arrays + Objects
   ↓
Loops
   ↓
ES6+
   ↓
Modules
   ↓
Classes
   ↓
Callbacks
   ↓
Promises
   ↓
Async/Await
   ↓
Node.js
```

---

# 1. Variables — `let`, `const`, `var`

## 1.1 What is a variable?

A variable is a named reference used to store or access a value.

```js
let age = 29;

console.log(age);
```

Think:

```text
age → 29
```

---

## 1.2 `let`

Use `let` when the variable may be reassigned.

```js
let age = 29;

age = 30;

console.log(age); // 30
```

---

## 1.3 `const`

Use `const` when the variable should not be reassigned.

```js
const name = "Veekshith";

name = "Rahul"; // TypeError
```

Important:

`const` prevents **reassignment**, not mutation of an object.

```js
const user = {
    name: "John"
};

user.name = "Alex"; // Valid

console.log(user.name); // Alex
```

But this is not valid:

```js
const user = {
    name: "John"
};

user = {}; // TypeError
```

---

## 1.4 `var`

`var` is the older way of declaring variables.

```js
var age = 29;
```

Modern JavaScript generally prefers:

```js
const
let
```

because `var` is function-scoped and has confusing hoisting behavior.

---

## 1.5 Scope

Scope determines where a variable can be accessed.

### Global scope

```js
const name = "John";

function test() {
    console.log(name);
}
```

### Function scope

```js
function test() {
    const age = 29;

    console.log(age);
}

console.log(age); // ReferenceError
```

### Block scope

`let` and `const` are block-scoped.

```js
if (true) {
    let x = 10;
    const y = 20;
}

console.log(x); // ReferenceError
console.log(y); // ReferenceError
```

---

## 1.6 Interview questions

### Q1. Difference between `var`, `let`, and `const`?

| Feature | var | let | const |
|---|---|---|---|
| Scope | Function | Block | Block |
| Reassign | Yes | Yes | No |
| Redeclare same scope | Yes | No | No |
| Temporal Dead Zone | No | Yes | Yes |

Interview answer:

> `var` is function-scoped and can be redeclared. `let` and `const` are block-scoped and cannot be redeclared in the same scope. `let` can be reassigned, while `const` cannot.

### Q2. Can a `const` object be modified?

Yes.

```js
const user = { name: "John" };

user.name = "Alex";
```

The object is mutable; the variable binding cannot be reassigned.

### Q3. What is the Temporal Dead Zone?

The period between entering a scope and the point where a `let` or `const` variable is initialized.

```js
console.log(x); // ReferenceError

let x = 10;
```

---

# 2. Data Types

JavaScript types are broadly divided into:

```text
Primitive
    ↓
string
number
bigint
boolean
undefined
null
symbol

Non-primitive
    ↓
object
```

Functions are technically objects in JavaScript, although they have callable behavior.

---

## 2.1 String

```js
const name = "John";
```

---

## 2.2 Number

JavaScript uses the `Number` type for ordinary integers and floating-point numbers.

```js
const age = 29;
const price = 99.99;
```

Special numeric values include:

```js
NaN
Infinity
-Infinity
```

---

## 2.3 Boolean

```js
const isLoggedIn = true;
const isAdmin = false;
```

---

## 2.4 Undefined

A variable exists but has not been assigned a value.

```js
let city;

console.log(city); // undefined
```

---

## 2.5 Null

`null` represents an intentional absence of a value.

```js
const selectedUser = null;
```

---

## 2.6 BigInt

Used for integers larger than the safe integer range of `Number`.

```js
const bigNumber = 123456789012345678901234567890n;
```

---

## 2.7 Symbol

Symbols create unique primitive values.

```js
const id = Symbol("id");
```

Two symbols with the same description are still different:

```js
Symbol("id") === Symbol("id"); // false
```

---

## 2.8 `typeof`

```js
typeof "hello";     // "string"
typeof 10;          // "number"
typeof true;        // "boolean"
typeof undefined;   // "undefined"
typeof {};          // "object"
typeof [];          // "object"
typeof function(){} // "function"
```

Important JavaScript oddity:

```js
typeof null; // "object"
```

This is a long-standing historical behavior.

---

## 2.9 Interview questions

### Q1. What is the difference between primitive and reference/object values?

Primitives represent individual immutable values:

```js
let a = 10;
let b = a;

b = 20;

console.log(a); // 10
```

Objects are mutable values accessed through references:

```js
const a = { value: 10 };
const b = a;

b.value = 20;

console.log(a.value); // 20
```

### Q2. Why is `typeof null` `"object"`?

It is a historical language behavior retained for backward compatibility.

### Q3. What is `NaN`?

`NaN` means "Not-a-Number", but its type is still `number`.

```js
typeof NaN; // "number"
```

Check it with:

```js
Number.isNaN(value);
```

Prefer `Number.isNaN()` over the global `isNaN()` when you need strict checking.

---

# 3. Functions

A function is reusable code that can accept input and produce an output.

```js
function add(a, b) {
    return a + b;
}

const result = add(10, 20);

console.log(result); // 30
```

---

## 3.1 Parameters vs Arguments

```js
function greet(name) {
    // name = parameter
    console.log(`Hello ${name}`);
}

greet("John");
// "John" = argument
```

---

## 3.2 Return

```js
function multiply(a, b) {
    return a * b;
}
```

`return` sends a value back to the caller.

---

## 3.3 Function declaration

```js
function add(a, b) {
    return a + b;
}
```

Function declarations are hoisted.

```js
sayHello();

function sayHello() {
    console.log("Hello");
}
```

This works.

---

## 3.4 Function expression

```js
const add = function(a, b) {
    return a + b;
};
```

The variable follows normal `let`/`const` initialization rules.

```js
add(); // ReferenceError if add is declared with const before initialization
```

---

## 3.5 Default parameters

```js
function greet(name = "Guest") {
    console.log(`Hello ${name}`);
}

greet(); // Hello Guest
```

---

## 3.6 Rest parameters

```js
function sum(...numbers) {
    return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3, 4); // 10
```

`...numbers` collects remaining arguments into an array.

---

## 3.7 Interview questions

### Q1. Function declaration vs function expression?

Main distinction:

```js
function test() {}
```

is a function declaration.

```js
const test = function() {};
```

is a function expression.

Function declarations are hoisted with their function body. Function expressions assigned to `let`/`const` are subject to normal initialization rules.

### Q2. What is a first-class function?

Functions can be:

- assigned to variables
- passed as arguments
- returned from functions
- stored in objects/arrays

Example:

```js
function greet() {
    return "Hello";
}

const fn = greet;

console.log(fn());
```

### Q3. What is a higher-order function?

A function that accepts another function or returns a function.

```js
function execute(fn) {
    return fn();
}

execute(() => console.log("Hello"));
```

---

# 4. Arrays

Arrays store ordered collections.

```js
const fruits = ["Apple", "Banana", "Orange"];
```

Indexes start at `0`.

```js
fruits[0]; // Apple
fruits[1]; // Banana
```

---

## 4.1 Common methods

### `push`

Adds to the end.

```js
fruits.push("Mango");
```

### `pop`

Removes from the end.

```js
fruits.pop();
```

### `shift`

Removes from the beginning.

```js
fruits.shift();
```

### `unshift`

Adds to the beginning.

```js
fruits.unshift("Grapes");
```

---

## 4.2 `map`

Transforms every element.

```js
const numbers = [1, 2, 3];

const doubled = numbers.map(n => n * 2);

console.log(doubled);
// [2, 4, 6]
```

`map()` returns a new array.

---

## 4.3 `filter`

Keeps elements that satisfy a condition.

```js
const numbers = [1, 2, 3, 4];

const even = numbers.filter(n => n % 2 === 0);

console.log(even);
// [2, 4]
```

---

## 4.4 `find`

Returns the first matching element.

```js
const users = [
    { id: 1, name: "John" },
    { id: 2, name: "Alex" }
];

const user = users.find(user => user.id === 2);

console.log(user);
```

---

## 4.5 `some`

Checks whether at least one element satisfies a condition.

```js
const numbers = [1, 3, 4];

numbers.some(n => n % 2 === 0);
// true
```

---

## 4.6 `every`

Checks whether all elements satisfy a condition.

```js
[2, 4, 6].every(n => n % 2 === 0);
// true
```

---

## 4.7 `reduce`

Reduces an array to one result.

```js
const numbers = [1, 2, 3, 4];

const total = numbers.reduce(
    (sum, number) => sum + number,
    0
);

console.log(total); // 10
```

Think:

```text
[1,2,3,4]
    ↓
reduce
    ↓
10
```

---

## 4.8 Interview questions

### Q1. Difference between `map`, `filter`, and `reduce`?

```text
map     → transform each element
filter  → select elements
reduce  → produce one accumulated result
```

### Q2. Does `map()` modify the original array?

Usually no. It returns a new array.

### Q3. `forEach()` vs `map()`?

`forEach()` is generally for performing an action for each element and does not produce a transformed array.

`map()` creates and returns a new array.

```js
const result = numbers.map(n => n * 2);
```

### Q4. What is the complexity of finding an item in an unsorted array?

Generally `O(n)`.

---

# 5. Objects

Objects store data as key-value pairs.

```js
const user = {
    name: "John",
    age: 29,
    city: "Bangalore"
};
```

Access:

```js
user.name;
user["name"];
```

---

## 5.1 Modify

```js
user.age = 30;
```

## 5.2 Add

```js
user.job = "Developer";
```

## 5.3 Delete

```js
delete user.job;
```

---

## 5.4 Nested objects

```js
const user = {
    name: "John",
    address: {
        city: "Bangalore",
        country: "India"
    }
};

console.log(user.address.city);
```

---

## 5.5 Optional chaining

Instead of:

```js
if (user && user.address && user.address.city) {
    console.log(user.address.city);
}
```

Use:

```js
console.log(user?.address?.city);
```

---

## 5.6 Nullish coalescing

```js
const name = user.name ?? "Guest";
```

`??` uses the fallback only when the left side is `null` or `undefined`.

This differs from `||`:

```js
0 || 10      // 10
0 ?? 10      // 0

"" || "Guest"   // Guest
"" ?? "Guest"   // ""

false || true   // true
false ?? true   // false
```

---

## 5.7 Interview questions

### Q1. Object property access: dot vs bracket?

```js
user.name;
user["name"];
```

Bracket notation is useful when the property name is dynamic:

```js
const key = "name";

user[key];
```

### Q2. Shallow copy vs deep copy?

Shallow copy:

```js
const copy = { ...user };
```

Nested objects are still shared.

Deep copying can be done with:

```js
const copy = structuredClone(user);
```

`structuredClone()` is preferable to JSON serialization for many general data structures, because JSON serialization loses or changes certain values/types.

### Q3. Why can two identical objects be unequal?

```js
{} === {}; // false
```

Objects are compared by identity/reference, not by structural contents.

---

# 6. Loops

## 6.1 `for`

```js
for (let i = 0; i < 5; i++) {
    console.log(i);
}
```

---

## 6.2 `while`

```js
let i = 0;

while (i < 5) {
    console.log(i);
    i++;
}
```

---

## 6.3 `for...of`

Best for iterating values of iterable objects such as arrays.

```js
const numbers = [10, 20, 30];

for (const number of numbers) {
    console.log(number);
}
```

---

## 6.4 `for...in`

Used to enumerate property keys.

```js
const user = {
    name: "John",
    age: 29
};

for (const key in user) {
    console.log(key);
}
```

Output:

```text
name
age
```

Don't normally use `for...in` to iterate array values.

---

## 6.5 Interview trap

What is the difference?

```text
for...of  → values
for...in  → keys/property names
```

---

# 7. ES6+ Features

ES6 means ECMAScript 2015.

It introduced major features including:

- `let`
- `const`
- Arrow functions
- Template literals
- Destructuring
- Spread/rest
- Classes
- Modules
- Promises

Modern JavaScript has many additional features beyond ES6.

---

# 8. Arrow Functions

Normal function:

```js
function add(a, b) {
    return a + b;
}
```

Arrow function:

```js
const add = (a, b) => {
    return a + b;
};
```

Short form:

```js
const add = (a, b) => a + b;
```

---

## 8.1 Single parameter

```js
const square = n => n * n;
```

Parentheses are optional for one simple parameter.

---

## 8.2 Important: Arrow functions and `this`

Arrow functions do **not** have their own `this`.

They capture `this` lexically from the surrounding scope.

```js
const obj = {
    name: "John",

    normal() {
        console.log(this.name);
    },

    arrow: () => {
        console.log(this.name);
    }
};
```

`normal()` gets `this` based on the call site.

The arrow function does not create its own `this`.

This is one of the most common advanced interview topics.

---

# 9. Template Literals

Old style:

```js
const name = "John";

console.log("Hello " + name);
```

Template literal:

```js
console.log(`Hello ${name}`);
```

They use backticks:

```text
`
```

They also support multiline strings and expressions:

```js
const a = 10;
const b = 20;

console.log(`Total = ${a + b}`);
```

---

# 10. Destructuring

Destructuring extracts values from arrays or objects.

## 10.1 Object destructuring

```js
const user = {
    name: "John",
    age: 29
};

const { name, age } = user;
```

Equivalent idea:

```js
const name = user.name;
const age = user.age;
```

---

## 10.2 Rename during destructuring

```js
const { name: userName } = user;

console.log(userName);
```

---

## 10.3 Default value

```js
const { city = "Unknown" } = user;
```

---

## 10.4 Array destructuring

```js
const numbers = [10, 20, 30];

const [first, second, third] = numbers;
```

---

## 10.5 Skip values

```js
const [first, , third] = numbers;
```

---

## 10.6 Real Node.js example

You will commonly see:

```js
const { id } = req.params;
```

and:

```js
const { username, password } = req.body;
```

Meaning:

> Extract these properties from the object.

---

# 11. Spread and Rest Operator

The same `...` syntax can mean different things depending on context.

## Spread

Expands values.

```js
const a = [1, 2, 3];

const b = [...a, 4, 5];

console.log(b);
// [1,2,3,4,5]
```

Object:

```js
const user = {
    name: "John",
    age: 29
};

const updatedUser = {
    ...user,
    age: 30
};
```

---

## Rest

Collects values.

```js
function sum(...numbers) {
    console.log(numbers);
}

sum(1, 2, 3);
```

Output:

```text
[1, 2, 3]
```

Remember:

```text
... on RHS / expansion → spread
... in parameter/collection position → rest
```

---

# 12. Modules — `import` / `export`

Modules allow you to split an application into files.

Example:

```text
project/
├── app.js
└── user.js
```

### user.js

```js
export function getUser() {
    return "John";
}
```

### app.js

```js
import { getUser } from "./user.js";

console.log(getUser());
```

---

## 12.1 Default export

```js
export default function getUser() {
    return "John";
}
```

Import:

```js
import getUser from "./user.js";
```

---

## 12.2 Named export

```js
export function add() {}
export function subtract() {}
```

Import:

```js
import { add, subtract } from "./math.js";
```

---

## 12.3 Interview: CommonJS vs ES Modules

Node.js commonly exposes both module systems.

CommonJS:

```js
const express = require("express");

module.exports = router;
```

ES Modules:

```js
import express from "express";

export default router;
```

High-level difference:

```text
CommonJS → require / module.exports
ESM      → import / export
```

Interviewers may ask about:

- module loading
- static vs dynamic imports
- ESM vs CommonJS
- interoperability
- `package.json` configuration
- file extensions and module resolution

---

# 13. Classes

A class is a blueprint for creating objects.

```js
class Car {
    constructor(brand) {
        this.brand = brand;
    }

    drive() {
        console.log(`${this.brand} is driving`);
    }
}
```

Create instances:

```js
const car1 = new Car("BMW");
const car2 = new Car("Audi");

car1.drive();
```

---

## 13.1 Constructor

The constructor runs when an instance is created.

```js
const car = new Car("BMW");
```

Conceptually:

```text
new Car("BMW")
     ↓
constructor("BMW")
     ↓
this.brand = "BMW"
```

---

## 13.2 `this`

`this` refers to the relevant object/context according to JavaScript's `this` rules.

```js
class User {
    constructor(name) {
        this.name = name;
    }

    greet() {
        console.log(this.name);
    }
}
```

---

## 13.3 Inheritance

```js
class Animal {
    speak() {
        console.log("Animal sound");
    }
}

class Dog extends Animal {
    speak() {
        console.log("Bark");
    }
}
```

---

## 13.4 `super`

```js
class Dog extends Animal {
    constructor(name) {
        super();
        this.name = name;
    }
}
```

`super()` calls the parent constructor.

---

## 13.5 Interview questions

### Q1. Are JavaScript classes truly classical OOP internally?

JavaScript's object model is prototype-based. `class` provides class syntax over the prototype system.

### Q2. What is a prototype?

Objects can inherit properties and methods through their prototype chain.

```text
object
  ↓
prototype
  ↓
prototype's prototype
  ↓
null
```

### Q3. Why are class methods memory-efficient?

Methods defined on the class prototype are generally shared by instances rather than recreated as separate function objects for every instance.

---

# 14. Callbacks

A callback is a function passed to another function to be executed later or as part of an operation.

```js
function greet(name, callback) {
    console.log(`Hello ${name}`);
    callback();
}

greet("John", () => {
    console.log("Callback executed");
});
```

Think:

```text
Function
   ↓
receives another function
   ↓
calls it
```

Callbacks are fundamental to understanding Node.js asynchronous programming.

---

# 15. Promises ⭐

A Promise represents the eventual completion or failure of an asynchronous operation and its resulting value.

A Promise has three states:

```text
Pending
   ↓
 ┌───────────┐
 ↓           ↓
Fulfilled  Rejected
```

---

## 15.1 Creating a Promise

```js
const promise = new Promise((resolve, reject) => {

    const success = true;

    if (success) {
        resolve("Success");
    } else {
        reject("Failed");
    }

});
```

---

## 15.2 Consuming a Promise

```js
promise
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.log(error);
    });
```

Think:

```text
Promise
   ↓
success → then()
failure → catch()
```

---

## 15.3 `finally`

Runs after settlement regardless of success/failure.

```js
promise
    .then(...)
    .catch(...)
    .finally(() => {
        console.log("Finished");
    });
```

---

## 15.4 Promise chaining

```js
getUser()
    .then(user => getOrders(user))
    .then(orders => getPayment(orders))
    .then(payment => console.log(payment))
    .catch(error => console.error(error));
```

Each `.then()` can return a value or another Promise.

---

# 16. Async / Await ⭐⭐⭐

`async/await` provides syntax for working with Promises in a sequential-looking style.

```js
async function getData() {

    const user = await getUser();

    const orders = await getOrders(user);

    return orders;
}
```

---

## 16.1 `async`

An `async` function always returns a Promise.

```js
async function hello() {
    return "Hello";
}
```

Conceptually:

```text
hello()
  ↓
Promise
  ↓
"Hello"
```

---

## 16.2 `await`

`await` waits for a Promise's settlement before continuing the current async function.

```js
const user = await getUser();
```

Important:

> `await` does not block the entire JavaScript/Node.js process. It suspends that async function's continuation while other work can proceed.

---

## 16.3 Error handling

```js
async function getUserData() {
    try {
        const user = await getUser();
        return user;
    } catch (error) {
        console.error(error);
    }
}
```

---

# 17. Promise Concurrency Methods

These are very important for backend interviews.

## `Promise.all`

Runs multiple Promises concurrently and waits for all.

```js
const [users, products] = await Promise.all([
    getUsers(),
    getProducts()
]);
```

If one rejects, the returned Promise rejects.

Use when:

> All operations are required.

---

## `Promise.allSettled`

Waits for all operations regardless of success/failure.

```js
const results = await Promise.allSettled([
    getUsers(),
    getProducts()
]);
```

Use when:

> You want the result of every operation, including failures.

---

## `Promise.race`

Settles when the first Promise settles.

```js
const result = await Promise.race([
    request(),
    timeout()
]);
```

The first fulfilled **or rejected** Promise determines the result.

---

## `Promise.any`

Fulfills when the first Promise fulfills.

```js
const result = await Promise.any([
    server1(),
    server2(),
    server3()
]);
```

If all reject, it rejects with an `AggregateError`.

---

# 18. Sequential vs Concurrent Async Operations

Bad when operations are independent:

```js
const users = await getUsers();
const products = await getProducts();
```

If neither depends on the other, they unnecessarily wait sequentially.

Better:

```js
const [users, products] = await Promise.all([
    getUsers(),
    getProducts()
]);
```

Think:

```text
Sequential:

A ───────→
          B ───────→


Concurrent:

A ───────→
B ───────→
```

This is a very common Node.js interview optimization question.

---

# 19. Important Tricky Interview Questions

## Q1. What is the output?

```js
console.log(a);

var a = 10;
```

Answer:

```text
undefined
```

Because `var` declaration is hoisted and initialized with `undefined`.

---

## Q2. What is the output?

```js
console.log(a);

let a = 10;
```

Answer:

```text
ReferenceError
```

Because `a` is in the Temporal Dead Zone until initialization.

---

## Q3. What is the output?

```js
console.log(typeof null);
```

Answer:

```text
object
```

Historical JavaScript behavior.

---

## Q4. What is the output?

```js
console.log([] == false);
```

This is `true` because loose equality performs type coercion.

Prefer strict equality:

```js
=== 
```

---

## Q5. Difference between `==` and `===`?

```js
5 == "5"   // true
5 === "5"  // false
```

`==` performs coercion.

`===` checks without coercing the operands.

Prefer `===` in most application code.

---

## Q6. What is the output?

```js
const a = {};
const b = {};

console.log(a === b);
```

Answer:

```text
false
```

Different object identities.

---

## Q7. What is the output?

```js
const a = {};
const b = a;

console.log(a === b);
```

Answer:

```text
true
```

Both variables reference the same object.

---

# 20. Tricky Closure Question

What does this print?

```js
function outer() {
    let count = 0;

    return function inner() {
        count++;
        console.log(count);
    };
}

const counter = outer();

counter();
counter();
counter();
```

Output:

```text
1
2
3
```

Why?

`inner()` closes over `count`.

The returned function retains access to the lexical environment created by `outer()`.

This is called a **closure**.

---

# 21. `var` Loop Trap

What does this print?

```js
for (var i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log(i);
    }, 100);
}
```

Output:

```text
3
3
3
```

Why?

`var` is function-scoped, so all callbacks reference the same `i`.

With `let`:

```js
for (let i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log(i);
    }, 100);
}
```

Output:

```text
0
1
2
```

`let` creates a per-iteration binding.

---

# 22. `this` Interview Trap

```js
const user = {
    name: "John",

    greet() {
        console.log(this.name);
    }
};

user.greet();
```

Output:

```text
John
```

But:

```js
const greet = user.greet;

greet();
```

The method has been detached from the object. In strict-mode/module code, `this` is `undefined`.

Key lesson:

> For normal functions, `this` is determined primarily by how the function is called.

Arrow functions behave differently because they capture `this` lexically.

---

# 23. Promise Trick Question

What is the output?

```js
console.log("A");

Promise.resolve().then(() => {
    console.log("B");
});

console.log("C");
```

Output:

```text
A
C
B
```

Why?

Promise callbacks run asynchronously through the microtask queue after the current synchronous code completes.

---

# 24. `async` Return Trick

```js
async function test() {
    return 10;
}

console.log(test());
```

It does not directly print:

```text
10
```

It prints a Promise-like representation because:

```js
test()
```

returns a Promise.

To get the value:

```js
const result = await test();
```

---

# 25. `await` Does Not Mean Everything Stops

Consider:

```js
async function test() {
    console.log("A");

    await Promise.resolve();

    console.log("B");
}

test();

console.log("C");
```

Output:

```text
A
C
B
```

`await` suspends the continuation of `test()`, not the entire JavaScript runtime.

---

# 26. Promise.all Interview Scenario

Suppose:

```js
const user = await getUser();
const orders = await getOrders();
const recommendations = await getRecommendations();
```

If these three calls don't depend on each other, this is unnecessarily sequential.

Better:

```js
const [user, orders, recommendations] =
    await Promise.all([
        getUser(),
        getOrders(),
        getRecommendations()
    ]);
```

Potential interview question:

> "How would you reduce API latency when calling three independent services?"

Answer:

> Execute independent I/O operations concurrently with `Promise.all()` rather than awaiting them sequentially.

---

# 27. Advanced Interview Questions Checklist

## Variables / Scope

- What is lexical scope?
- `var` vs `let` vs `const`?
- What is hoisting?
- What is the Temporal Dead Zone?
- Why does `const` still allow object mutation?
- What is block scope?
- What is function scope?
- What is global scope?
- What is variable shadowing?

## Functions

- Function declaration vs expression?
- What are first-class functions?
- What are higher-order functions?
- What are callbacks?
- What are default parameters?
- What are rest parameters?
- What is a closure?
- What is an IIFE?
- What is currying?
- What is function composition?

## Arrays

- `map` vs `forEach`?
- `filter` vs `find`?
- `some` vs `every`?
- `reduce` use cases?
- Which methods mutate the original array?
- What is array destructuring?
- How would you remove duplicates?
- Time complexity of common array operations?

## Objects

- Primitive vs reference values?
- Shallow vs deep copy?
- `Object.keys()` vs `Object.values()` vs `Object.entries()`?
- What is optional chaining?
- What is nullish coalescing?
- How does property lookup work?
- What is the prototype chain?
- Why are `{}` and `{}` not equal?

## ES6+

- Arrow functions vs normal functions?
- How does `this` behave in arrow functions?
- Destructuring?
- Spread vs rest?
- Template literals?
- Default parameters?
- Optional chaining?
- Nullish coalescing?
- Modules?

## Classes / OOP

- What is a class?
- What is an instance?
- What is a constructor?
- What is inheritance?
- What is polymorphism?
- What is encapsulation?
- What is `super`?
- What are prototypes?
- Are JavaScript classes actually class-based internally?

## Promises

- What is a Promise?
- Promise states?
- `.then()` / `.catch()` / `.finally()`?
- Promise chaining?
- What happens when `.then()` returns another Promise?
- `Promise.all()`?
- `Promise.allSettled()`?
- `Promise.race()`?
- `Promise.any()`?
- How do you handle partial failures?

## Async/Await

- What does `async` do?
- What does `await` do?
- Does `await` block Node.js?
- How does `try/catch` work with async functions?
- Sequential vs concurrent async operations?
- How do you implement a timeout?
- How do you limit concurrency?
- How do you handle partial failures?

---

# 28. Coding Questions You Should Practice

## Beginner

### 1. Reverse an array

```js
function reverseArray(arr) {
    // implement
}
```

### 2. Find maximum

```js
function findMax(numbers) {
    // implement
}
```

### 3. Remove duplicates

```js
function removeDuplicates(arr) {
    // implement
}
```

### 4. Count character frequency

```js
function countCharacters(str) {
    // implement
}
```

### 5. Check palindrome

```js
function isPalindrome(str) {
    // implement
}
```

---

# 29. Intermediate JavaScript Problems

### 1. Group objects by property

Input:

```js
const users = [
    { name: "A", department: "IT" },
    { name: "B", department: "HR" },
    { name: "C", department: "IT" }
];
```

Expected concept:

```text
IT → A, C
HR → B
```

---

### 2. Find duplicate values

```js
[1, 2, 3, 2, 4, 1]
```

Expected:

```js
[1, 2]
```

---

### 3. Flatten nested array

```js
[1, [2, [3, 4]], 5]
```

Expected:

```js
[1, 2, 3, 4, 5]
```

---

### 4. Implement your own `map`

Understand how array iteration works internally.

```js
function myMap(arr, callback) {
    // implement
}
```

---

### 5. Implement your own `filter`

```js
function myFilter(arr, callback) {
    // implement
}
```

---

# 30. Advanced Async Interview Problems

## Problem 1 — Retry failed API

Design:

```text
API request
    ↓
Success → return
    ↓
Failure
    ↓
Retry
    ↓
Retry limit reached?
    ↓
Yes → throw error
```

Questions interviewer may ask:

- How many retries?
- Fixed vs exponential backoff?
- What errors should be retried?
- What if the API is rate-limited?
- How do you avoid retry storms?

---

## Problem 2 — Timeout a Promise

Concept:

```text
API Promise
     +
Timeout Promise
     ↓
Promise.race()
```

Implement:

```js
function withTimeout(promise, ms) {
    // implement
}
```

---

## Problem 3 — Limit concurrency

Suppose you have 10,000 API requests.

Bad:

```js
await Promise.all(
    requests.map(request => sendRequest(request))
);
```

Potential problem:

```text
10,000 requests
       ↓
10,000 concurrent operations
       ↓
Rate limits / memory / service overload
```

Design a concurrency limiter:

```text
10,000 tasks
     ↓
Concurrency = 10
     ↓
10 running
     ↓
Completed task
     ↓
Start next
```

This is an excellent Node.js interview problem.

---

# 31. Real Backend Example

A simplified Node.js controller might look like:

```js
async function getUser(req, res) {

    try {

        const { id } = req.params;

        const user = await database.getUser(id);

        res.json({
            success: true,
            user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });

    }
}
```

You should be able to identify:

```text
async function       → async function
const                → variable
destructuring        → { id }
object                → JSON response
await                → Promise handling
try/catch             → error handling
```

---

# 32. How to Explain JavaScript in an Interview

Don't answer only with definitions.

Use:

```text
1. Definition
2. Why it exists
3. Simple example
4. Real-world use
5. Important caveat
```

Example:

### Interviewer: "What is a Promise?"

Weak answer:

> Promise handles asynchronous operations.

Better answer:

> A Promise represents the eventual result of an asynchronous operation. It starts in a pending state and eventually becomes fulfilled or rejected. We can consume it using `.then()` and `.catch()`, or more commonly in modern code with `async/await`. For example, a database query can return a Promise, allowing the application to continue handling other work while waiting for the I/O operation.

---

# 33. Must-Know Output Questions

Before moving to Node.js, you should be able to solve these without running the code.

## Question 1

```js
console.log(a);

var a = 10;
```

Answer:

```text
undefined
```

---

## Question 2

```js
console.log(a);

let a = 10;
```

Answer:

```text
ReferenceError
```

---

## Question 3

```js
console.log(typeof null);
```

Answer:

```text
object
```

---

## Question 4

```js
console.log([] === []);
```

Answer:

```text
false
```

---

## Question 5

```js
console.log(5 == "5");
console.log(5 === "5");
```

Answer:

```text
true
false
```

---

## Question 6

```js
const obj = { a: 1 };

const copy = obj;

copy.a = 2;

console.log(obj.a);
```

Answer:

```text
2
```

---

## Question 7

```js
const numbers = [1, 2, 3];

const result = numbers.map(n => n * 2);

console.log(result);
```

Answer:

```text
[2, 4, 6]
```

---

## Question 8

```js
console.log("A");

Promise.resolve().then(() => {
    console.log("B");
});

console.log("C");
```

Answer:

```text
A
C
B
```

---

# 34. Phase 1 Final Checklist

Before saying "I know JavaScript", you should be able to explain all of these without notes:

### Core

- [ ] `let`
- [ ] `const`
- [ ] `var`
- [ ] Scope
- [ ] Hoisting
- [ ] Temporal Dead Zone
- [ ] Primitive types
- [ ] Objects
- [ ] Arrays
- [ ] Functions
- [ ] Parameters / arguments
- [ ] Return values

### ES6+

- [ ] Arrow functions
- [ ] Template literals
- [ ] Destructuring
- [ ] Spread
- [ ] Rest
- [ ] Default parameters
- [ ] Optional chaining
- [ ] Nullish coalescing
- [ ] Modules

### OOP

- [ ] Classes
- [ ] Constructor
- [ ] `this`
- [ ] Inheritance
- [ ] `super`
- [ ] Prototypes

### Async JavaScript

- [ ] Callbacks
- [ ] Promises
- [ ] Promise states
- [ ] `.then()`
- [ ] `.catch()`
- [ ] `.finally()`
- [ ] `async`
- [ ] `await`
- [ ] `Promise.all`
- [ ] `Promise.allSettled`
- [ ] `Promise.race`
- [ ] `Promise.any`
- [ ] Sequential vs concurrent operations
- [ ] Closures
- [ ] Microtasks at a basic level

---

# 35. Interview Readiness Test

You are ready to move to Node.js when you can answer these verbally:

1. Why use `const` instead of `let`?
2. Why can a `const` object's properties change?
3. Explain hoisting.
4. Explain the Temporal Dead Zone.
5. Primitive vs reference values?
6. Why is `{}` equal to itself but not another `{}`?
7. `==` vs `===`?
8. `map()` vs `forEach()`?
9. `filter()` vs `find()`?
10. What is a closure?
11. What is a callback?
12. What is a Promise?
13. Promise states?
14. Why use `async/await`?
15. Does `await` block Node.js?
16. `Promise.all()` vs `Promise.allSettled()`?
17. `Promise.race()` vs `Promise.any()`?
18. Arrow function vs normal function?
19. How does `this` work?
20. Spread vs rest?
21. Shallow vs deep copy?
22. CommonJS vs ES Modules?
23. What is a prototype?
24. Are JavaScript classes actually class-based internally?
25. Why can independent API calls be executed with `Promise.all()`?

If you can explain these **without memorizing a definition**, your JavaScript foundation is strong enough to start serious Node.js preparation.

---

# Recommended 2–3 Week Study Plan

## Week 1 — Core JavaScript

### Day 1
- Variables
- `let` / `const` / `var`
- Scope
- Hoisting

### Day 2
- Data types
- Type coercion
- `==` vs `===`
- Truthy/falsy

### Day 3
- Functions
- Parameters
- Return
- Function expressions
- Higher-order functions

### Day 4
- Arrays
- Array methods
- `map`
- `filter`
- `reduce`
- `find`

### Day 5
- Objects
- Nested objects
- Optional chaining
- Nullish coalescing
- Shallow/deep copy

### Day 6
- Loops
- `for`
- `while`
- `for...of`
- `for...in`

### Day 7
- Revision
- Output questions
- Coding problems

---

# Week 2 — Modern JavaScript

### Day 8
- Arrow functions
- `this`

### Day 9
- Template literals
- Destructuring

### Day 10
- Spread
- Rest
- Default parameters

### Day 11
- Modules
- CommonJS
- ES Modules

### Day 12
- Classes
- Objects
- Prototypes
- Inheritance

### Day 13
- Closures
- Callbacks

### Day 14
- Revision
- Interview questions

---

# Week 3 — Async JavaScript

### Day 15
- Synchronous vs asynchronous
- Callbacks
- Callback problems

### Day 16
- Promises
- Promise states
- `.then`
- `.catch`
- `.finally`

### Day 17
- Async/await
- Error handling

### Day 18
- `Promise.all`
- `Promise.allSettled`
- `Promise.race`
- `Promise.any`

### Day 19
- Sequential vs concurrent execution
- Async output questions

### Day 20
- Retry
- Timeout
- Concurrency limiting

### Day 21
- Full revision
- Mock interview
- Coding problems

---

# Final Goal

Don't aim for:

> "I can write JavaScript syntax."

Aim for:

> **"I understand why JavaScript behaves this way, I can predict the output, I can write the code, and I can explain the trade-offs to an interviewer."**

That foundation will make the next Node.js topics — **V8, Event Loop, non-blocking I/O, callbacks, microtasks, `process.nextTick`, streams, worker threads, Express, Redis, Kafka, etc.** — much easier.
