const express = require('express');
const Blockchain = require('../blockchain/blockchain');
const bodyParser = require('body-parser'); //we use bodyparser to manipulate data in post requests
const P2pServer = require('./p2p-server');

const Wallet = require('../wallet/wallet');
const TransactionPool = require('../wallet/transactionPool');

//below we get the port from the user if provided via environment variables or we use port 3001 as the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001;

//create new app
const app = express();

app.use(bodyParser.json());

const blockchain = new Blockchain();
const transactionPool = new TransactionPool();

//create a new wallet
const wallet = new Wallet(Date.now.toString());
//Date.now() is used as our secret but a more secure secret should be used in production

const p2pserver = new P2pServer(blockchain, transactionPool, wallet);

p2pserver.listen(); //fires up our p2p server


//api to get the blocks
app.get('/blocks', (req, res) => {
    res.json(blockchain.chain);
});

//api to add blocks
app.post('/mine', (req, res) => {
    const block = blockchain.addBlock(req.body.data); //here it accepts data needed for the request
    console.log(`New block added: ${block.toString()}`);

    res.redirect('/blocks');

    p2pserver.syncChain(); //syncs our chain across all peers whenever we mine a new block
});

//api to view transactions in the transaction pool
app.get('/transactions', (req, res) => {
    res.json(transactionPool.transactions);
});

//api to create transactions or transfer funds
app.post('/transfer', (req, res) => {
    const { to, amount, type } = req.body; //let's the user fill in these variables
    const transaction = wallet.createTransaction(to, amount, type, blockchain, transactionPool);
    p2pserver.broadcastTransaction(transaction); //broadcasts our transaction whenever this request is posted
    res.redirect('/transactions');
});

app.get('/public-key', (req, res) => {
    res.json({ publicKey: wallet.publicKey });
}); //get's the public key associated with a wallet

app.get('/balance', (req, res) => {
    res.json({ balance: blockchain.getBalance(wallet.publicKey) });
}); //get's the users balance



app.listen(HTTP_PORT, ()=> {
    console.log(`listening on port ${HTTP_PORT}`);
})