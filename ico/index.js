const express = require("express");
const Blockchain = require("../blockchain/blockchain");
const bodyParser = require("body-parser");
const P2pServer = require("../app/p2p-server");
const Wallet = require("../wallet/wallet");
const TransactionPool = require("../wallet/transactionPool");
const Account = require("../blockchain/account")
const { TRANSACTION_THRESHOLD } = require("../config");

const HTTP_PORT = 3000;
const app = express();
app.use(bodyParser.json());

const blockchain = new Blockchain();
const secret = "I am the first leader!";
const wallet = new Wallet(secret);
const transactionPool = new TransactionPool();
//const account = new Account();
const p2pserver = new P2pServer(blockchain, transactionPool, wallet);

app.get("/ico/transactions", (req, res) => {
    res.json(transactionPool.transactions);
});

app.get("/ico/blocks", (req, res) => {
    res.json(blockchain.chain);
});

app.post("/ico/transfer", (req, res) => {
    const { to, amount, type } = req.body;
    const transaction = wallet.createTransaction(to, amount, type, blockchain, transactionPool);
    blockchain.update(transaction);
    p2pserver.broadcastTransaction(transaction);
    if (transactionPool.transactions.length >= TRANSACTION_THRESHOLD) {
        let block = blockchain.createBlock(transactionPool.transactions, wallet);
        p2pserver.broadcastBlock(block);
    }
    res.redirect("/ico/transactions");
});

app.get("/ico/public-key", (req, res) => {
    res.json({ publicKey: wallet.publicKey });
});

app.get("/ico/balance", (req, res) => {
    res.json({ balance: blockchain.getBalance(wallet.publicKey) });
});

app.post("/ico/balance-of", (req, res) => {
    res.json({ balance: blockchain.getBalance(req.body.publicKey) });
});

app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});

//const P2P_PORT = 5005;

p2pserver.listen();