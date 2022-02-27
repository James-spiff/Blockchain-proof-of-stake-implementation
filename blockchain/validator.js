//This class checks if a user is a validator
//Note: Below the transaction fee is paid to a burn address which is an unusable wallet address this process is called coin burning
//Coin burning is belived to increase the value of a coin by shortening it's available supply

class Validators {
    constructor() {
        this.addresses = ['5aad9b5e21f63955e8840e8b954926c60e0e2d906fdbc0ce1e3afe249a67f614']; //reps the 1st forge master/validator
    }

    update(transaction) {
        if (transaction.amount === 30 && transaction.to === "0") { //transaction.amount reps the validation fee and transaction.to reps the address the validation fee is paid to
            this.addresses.push(transaction.from);
            return true;
        }
        return false;
    } //adds the addresses of users that have paid the validation fee to the validation address to our list of validators
}

module.exports = Validators;