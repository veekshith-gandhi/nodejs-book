# 🧠 Object-Oriented Programming (OOP) Concepts in Node.js

| Concept        | Simple Explanation                     | JS/Node Example |
|----------------|------------------------------------------|-----------------|
| **Class**       | Blueprint or template                    | `class Car { ... }` |
| **Object**      | Real-world object made from a class      | `const myCar = new Car()` |
| **Encapsulation** | Keep data safe and controlled         | Private fields with `#`, use methods |
| **Abstraction**   | Hide inner complexity                 | Use public methods, hide private logic |
| **Inheritance**   | One class inherits from another       | `class Dog extends Animal {}` |
| **Polymorphism**  | Same method behaves differently       | `draw()` method in different shape classes |


## ✅ Examples

### 🔹 Class & Object (You use classes to define blueprints, and then you create objects from them.)
```js
class Car {
  constructor(brand, speed) {
    this.brand = brand;
    this.speed = speed;
  }

  drive() {
    console.log(`${this.brand} is driving at ${this.speed} km/h`);
  }
}

const myCar = new Car('BMW', 120);
myCar.drive(); // Output: BMW is driving at 120 km/h

🔹 Encapsulation :  Encapsulation means hiding internal details of an object and protecting data. 
    We do this by keeping data inside a class and using methods to interact with it.

class BankAccount {
  #balance = 0;

  deposit(amount) {
    if (amount > 0) this.#balance += amount;
  }

  getBalance() {
    return this.#balance;
  }
}

const acc = new BankAccount();
acc.deposit(500);
console.log(acc.getBalance());  // Output: 500

🔹 Abstraction : Abstraction means hiding complexity and showing only the essentials.

class CoffeeMachine {
  makeCoffee() {
    this.#boilWater();
    console.log("Here's your coffee!");
  }

  #boilWater() {
    console.log('Boiling water...');
  }
}

const machine = new CoffeeMachine();
machine.makeCoffee();  // Output: Boiling water... Here's your coffee!


🔹 Inheritance : Inheritance allows a class to reuse code from another class.

class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(`${this.name} barks.`);
  }
}

const dog = new Dog('Tommy');
dog.speak();  // Output: Tommy barks.


🔹 Polymorphism : Polymorphism means many forms — different classes can have methods
     with the same name but behave differently.

class Shape {
  draw() {
    console.log('Drawing a shape');
  }
}

class Circle extends Shape {
  draw() {
    console.log('Drawing a circle');
  }
}

class Square extends Shape {
  draw() {
    console.log('Drawing a square');
  }
}

function drawShape(shape) {
  shape.draw();
}

drawShape(new Circle()); // Drawing a circle
drawShape(new Square()); // Drawing a square

```
