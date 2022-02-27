//Here we create an account model which will have the following functionality
//Increment balance, decrement balance, transfer coins, transfer fee, get the balance of a given account and update the account state

//our addresses will have an initial address hardcoded into it and the rest of the addresses will be appended to the list when generated  
class Account {
    constructor() {
        this.addresses = ['5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614'];  //the following address was gotten from running the code in rought.txt on a node terminal. This is the initial address belonging to the 1st forge master
        this.balance = {'5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614': 10000}; //we set an initial value of 10000 for the 1st forge master
    }

    initialize(address) {
        if (this.balance[address] == undefined) {
            this.balance[address] = 0;
            this.addresses.push(address);
        } 
    } //checks if the balance associated with an address is undefined and initializes it to 0 then pushes the address into the addresses array

    transfer(from, to, amount) {
        this.initialize(from);
        this.initialize(to);
        this.increment(to, amount); //increases the amount to the reciever
        this.decrement(from, amount); //deducts the amount from the sender
    }

    increment(to, amount) {
        this.balance[to] += amount;
    }//credits 

    decrement(from, amount) {
        this.balance[from] -= amount;
    }//debits

    getBalance(address) {
        this.initialize(address);
        return this.balance[address];
    }

    update(transaction) {
        let amount = transaction.output.amount;
        let from = transaction.input.from;
        let to = transaction.output.to;
        this.transfer(from, to, amount);
    } //updates our transaction object and initiates the transfer

    transferFee(block, transaction) {
        let amount = transaction.output.fee;
        let from = transaction.input.from;
        let to = block.validator;
        this.transfer(from, to, amount);
    }//sends the transfer fees to the block validator/forge master
}

module.exports = Account;