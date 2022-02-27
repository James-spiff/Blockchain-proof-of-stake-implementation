//This class will be used for holding all unconfirmed transaction before some of the transactions are are mined and made into a new block
//the miners/stakers are responsible for creating the new blocks
//to update the transaction pool our transactions are broadcasted to the network using the p2p server
const Transaction = require("./transaction")
const {TRANSACTION_THRESHOLD} = require('../config'); 

class TransactionPool {
    constructor() {
        this.transactions = []; //our array of transactions
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
        if (this.transactions.length >= TRANSACTION_THRESHOLD) {
            return true;
        } else {
            return false;
        }
    }

    validTransactions() {
        return this.transactions.filter(transaction => {
            if (!Transaction.verifyTransaction(transaction)) {
                console.log(`Invalid signature from ${transaction.data.from}`); //transaction.data.from gives us our public key
                return;
            }
            
            return transaction;
        });
    }   //this filters out the invalid transactions that have been pushed into the transaction list

    transactionExists(transaction) {
        let exists = this.transactions.find(t => t.id === transaction.id); //checks for transactions that exists in our transactions array using the id
        return exists;
    }

    clear() {
        this.transactions = [];
    }//clears our transaction pool after a new block has been validated
}

module.exports = TransactionPool;
