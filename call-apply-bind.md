# Understanding `call`, `apply`, and `bind` in JavaScript

In JavaScript, functions are **first-class objects**, which means you can pass them around like variables. They also have some special methods: `call`, `apply`, and `bind`. These allow you to manually set the value of `this` inside a function.

---

## Why do we need `call`, `apply`, or `bind`?

Sometimes, you want to execute a function in the context of another object (i.e., change the value of `this` inside a function). That’s where these methods help.

---

## `call()` – Call Immediately with Arguments Separated by Comma

### Syntax:
```js
functionName.call(thisContext, arg1, arg2, ...)

const person = {
  name: 'Alice',
};

function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

greet.call(person, 'Hello', '!'); // Hello, Alice!
```

## apply() – Call Immediately with Arguments as an Array

### Syntax:
```js
functionName.apply(thisContext, [arg1, arg2, ...])

function greet(place, time) {
    console.log("Hello, " + this.name + ". Welcome to " + place + " at " + time);
}

const person = { name: "Veekshith" };

greet.apply(person, ["Bangalore", "6 PM"]);
// Hello, Veekshith. Welcome to Bangalore at 6 PM
```
### ✅ apply is useful when you already have arguments in an array or array-like format.

## bind() – Return a New Function with Bound this (and Optional Arguments)
```js
const newFunc = functionName.bind(thisContext, arg1, arg2, ...)

const greetAlice = greet.bind(person, 'Hey', '.');
greetAlice(); // Hey, Alice.


Multiple arg
function multiply(a, b, c) {
  return `${this.label}: ${a * b * c}`;
}

const context = { label: 'Result' };

const multiplyWithContext = multiply.bind(context, 2, 3); // pre-bind 2 and 3
console.log(multiplyWithContext(4)); // Result: 24

```

### ✅ bind does not call the function immediately. It returns a new function with this bound and optionally some or all arguments preset.


## Use Cases:

- Use call or apply when you want to invoke a function with a specific this.
- Use bind when you want to delay execution or pass around a function with fixed context.
