//This lets users stake coins/assets which will be used to select the block forger. The user that stakes the most will be selected  

class Stake {
    constructor() {
        this.addresses = ['5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614']; //reps the address of the 1st forge master
        this.balance = {'5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614': 0}; //since this is the initial stake balance it will be set to zero
    }

    initialize(address) {
        if (this.balance[address] === undefined) {
            this.balance[address] = 0;
            this.addresses.push(address);
        }
    }   //checks if the balance associated with an address is undefined and initializes it to 0 then pushes the address into the addresses array

    addStake(from, amount) {
        this.initialize(from);
        this.balance[from] += amount;
    }

    getBalance(address) {
        this.initialize(address);
        return this.balance[address];
    }

    getMax(addresses) {
        let balance = -1;
        let forgeMaster = undefined; //forgeMaster is the block forger
        addresses.forEach(address => {
            let address_balance = this.getBalance(address);
            if (address_balance > balance) {
                forgeMaster = address;
                balance = address_balance
            } //loops through the balances of the address and replaces the address if it finds another address with a bigger balance
        });
        
        return forgeMaster;
    } //This returns the users address with the maximum staked coins

    update(transaction) {
        let amount = transaction.output.amount;
        let from = transaction.input.from;
        this.addStake(from, amount);
    } //updates our transaction object and triggers the addStake function
}

module.exports = Stake;