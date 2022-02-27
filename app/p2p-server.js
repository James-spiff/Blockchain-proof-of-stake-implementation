//Here we create a P2P server

const WebSocket = require('ws'); //This lets us implement a p2p server. Web sockets allow connect peers to communicate and transmit data to each other

//below we get the port from the user if provided via environment variables or we use port 5001 as the default port
const P2P_PORT = process.env.P2P_PORT || 5000;

//list of addresses to connect to
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const MESSAGE_TYPE = {
    chain: 'CHAIN',
    block: 'BLOCK',
    transaction: 'TRANSACTION'
} //an object that will help handling multiple messages it will be displayed as output on the console or postman

class P2pserver {
    constructor (blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.sockets = [];
        this.transactionPool = transactionPool; //this will help us broadcast our transactions
    }

    //this function creates a new p2p server and connects the peers
    listen() {
        //P2P server with the port as an argument
        const server = new WebSocket.Server({ port: P2P_PORT });

        //this listens for any new connection and sends the current chain to the newly connected peer
        //.on() is a method that attaches one or more event handlers for the selected elements and child elements
        server.on('connection', socket => this.connectSocket(socket)); //the connectSocket function is below it adds new sockets to the socket array

        this.connectToPeers();
        console.log(`Listening for peer to peer connection on port: ${P2P_PORT}`);
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log("Socket connected");

        this.messageHandler(socket);

        //sends the chain to a new peer connected to our server
        this.sendChain(socket);
    }

    connectToPeers() {
        //connects to peers
        peers.forEach(peer => {

            //creates a new socket for each peer
            const socket = new WebSocket(peer);

            //we save the socket connection object
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    //this function passes our data to each peer and runs the replaceChain function if it encounters an invalid chain
    messageHandler(socket) {
        //on receiving a message execute a callback function
        socket.on('message', message => {
            const data = JSON.parse(message);
            console.log("Recieved data from peer", data);

            switch(data.type) {
                case MESSAGE_TYPE.chain:
                    this.blockchain.replaceChain(data);
                    break;

                case MESSAGE_TYPE.transaction:
                    if (!this.transactionPool.transactionExists(data.transaction)) {
                        let thresholdReached = this.transactionPool.addTransaction(data.transaction); //This will trigger the addTransaction function and add our transaction then return true or false if we have passed the transaction threshold
                        this.broadcastTransaction(data.transaction);

                        if (thresholdReached) {
                            if (this.blockchain.getForgeMaster() === this.wallet.getPublicKey()) {
                                console.log("Creating block");
                                let block = this.blockchain.createBlock(
                                    this.transactionPool.transactions,
                                    this.wallet
                                ); 
                                this.broadcastBlock(block);
                            }// checks if the wallet address of the person trying to forge the new block is the elected forge master and creeates the block
                        }
                    }
                    break;
                
                case MESSAGE_TYPE.block:
                    if (this.blockchain.isValidBlock(data.block)) {
                        this.broadcastBlock(data.block);
                    }
                break;
            }
        });
    }

    //we use the function below to send our chain to a socket
    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPE.chain,
            chain: this.blockchain.chain
        }));
    }

    //the function below will be triggered in index.js to synchronize the chains connected to our socket so they are all the same across all peers
    syncChain() {
        this.sockets.forEach(socket => {
            this.sendChain(socket);
        });
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPE.transaction,
            transaction: transaction
        }));
    } //Here we send the new transaction to a socket

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => {
            this.sendTransaction(socket, transaction);
        });
    }//Here we broadcast the transaction sent above to all peers in our network
    
    broadcastBlock(block) {
        this.sockets.forEach(socket => {
            this.sendBlock(socket, block);
        });
    }//broadcasts our new block accross all peers

    sendBlock(socket, block) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPE.block,
            block: block
        }));
    }

    // isValidBlock(block) {

    // }

}

module.exports = P2pserver;