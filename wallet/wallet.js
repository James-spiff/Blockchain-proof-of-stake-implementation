const Transaction = require('./transaction');
const ChainUtil = require('../chain-util');
const {INITIAL_BALANCE} = require("../config")
//const TransactionPool = require('./transactionPool');

class Wallet {
    constructor(secret) {
        this.balance = INITIAL_BALANCE;   //every user starts with a balance of zero when they get a wallet but we'll hardcode an INITIAL_BALANCE 
        this.keyPair = ChainUtil.genKeyPair(secret);
        this.publicKey = this.keyPair.getPublic("hex");
    }

    toString() {
        return `Wallet -
                publicKey: ${this.publicKey.toString()}
                balance: ${this.balance}`;
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash).toHex(); //the dataHash is the hash of our transaction output
    }//we use this function which has the key pair to sign transactions we will implement it with the signTransaction function in transaction.js

    createTransaction(to, amount, type, blockchain, transactionPool) {
        this.balance = this.getBalance(blockchain);
        if (amount > this.balance) {
            console.log('Insufficient funds');
            return;
        }

        let transaction = Transaction.newTransaction(this, to, amount, type);
        transactionPool.addTransaction(transaction);
        return transaction;
    }

    getBalance(blockchain) {
        return blockchain.getBalance(this.publicKey);
    }

    getPublicKey() {
        return this.publicKey;
    }
}

module.exports = Wallet;