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
  console.log(acc.getBalance()); 