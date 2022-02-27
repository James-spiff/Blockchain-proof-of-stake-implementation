const ChainUtil = require("../chain-util");
const { TRANSACTION_FEE } = require("../config");
const Account = require('../blockchain/account')

class Transaction {
    constructor() {
        this.id = ChainUtil.id();
        this.type = null; //reps the transaction type
        this.input = null; //reps an object/dictionary that has the values needed to send a transaction
        this.output = null; //reps an object/dictionary that has the reponse given whenever a transaction is sent
        //this.balance = Account.balance;
    }
 
    static newTransaction(senderWallet, to, amount, type) {
        if (amount + TRANSACTION_FEE > senderWallet.balance) {
            console.log("Not enough balance");
            return;
        }

        return Transaction.generateTransaction(senderWallet, to, amount, type);
    }

    static generateTransaction(senderWallet, to, amount, type) {
        const transaction = new this(); //a new instance of the class
        transaction.type = type;
        transaction.output = {
            to: to,
            amount: amount + TRANSACTION_FEE,
            fee: TRANSACTION_FEE
        };  //this will be passed as a response after every transaction

        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            from: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.output))
        };
    } //This function signs our transactions using the transaction and senderWallet instance. This gives us a digital signature used to verify transactions

    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(
            transaction.input.from,
            transaction.input.signature,
            ChainUtil.hash(transaction.output)
        ); //uses the verifySignature function in ChainUtil to verify our transactions. from reps the publicKey, signature is the digital signature and the hashed output is our data hash
    }

    // updateBalance() {

    // }
}

module.exports = Transaction;