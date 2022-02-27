const Block = require('./block');
const Stake = require('./stake');
const Validators = require('./validator');
const Account = require('./account');
const Wallet = require('../wallet/wallet');

let secret = "I am the first leader!";

const TRANSACTION_TYPE = {
    transaction: "TRANSACTION",
    stake: "STAKE",
    validator_fee: "VALIDATOR_FEE"
};

class Blockchain{
    constructor() {
        this.chain = [Block.genesis()]; //this will be the initial block on the chain
        this.stakes = new Stake();
        this.accounts = new Account();
        this.validators = new Validators();
    }

    addBlock(data) {
        let block = Block.createBlock(this.chain[this.chain.length-1], data, new Wallet(secret));
        this.chain.push(block);
        console.log("New block added")
        return block;
    }

    createBlock(transactions, wallet) {
        const block = Block.createBlock(this.chain[this.chain.length-1], transactions, wallet);
        return block;
    }//an updated version of the createBlock function in block.js that takes in a wallet as a parameter so a forge master can sign the block when it is forged

    isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){
            return false;
        }   //checks if the genesis block is the same

        for (let i=1; i<chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i-1]; //previous block
            if ((block.lastHash !== lastBlock.hash) || (block.hash !== Block.blockHash(block))) {
                return false;
            }
        }

        return true;
    }

    //replaces invalid chains with the longest chain
    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) {
            console.log("New chain is not longer than the current chain");
            return;
        } else if (!this.isValidChain(newChain)) {
            console.log("New chain is invalid");
            return;
        }

        console.log("Replacing current chain with new chain");
        this.resetState();
        this.executeChain(newChain);
        this.chain = newChain;
    }

    update(transaction) {
        let amount = transaction.output.amount;
        let from = transaction.input.from;
        let to = transaction.output.to;
        this.accounts.transfer(from, to, amount);
        return console.log(this.accounts.getBalance(from));
    } //updates our transaction object and initiates the transfer

    // updateBalance() {
        
    // }

    getBalance(publicKey) {
        return this.accounts.getBalance(publicKey);
    }

    //getLeader() 
    getForgeMaster() {
        return this.stakes.getMax(this.validators.addresses);
    } //returns the address of the node with the max coins staked

    initialize(address) {
        this.accounts.initialize(address);
        this.stakes.initialize(address);
    }

    isValidBlock(block) {
        const lastBlock = this.chain[this.chain.length-1];

        if (
            block.lastHash === lastBlock.hash &&
            block.hash === Block.blockHash(block) &&
            Block.verifyBlock(block) &&
            Block.verifyForgeMaster(block, this.getForgeMaster())
        ) {
            console.log("block valid");
            this.addBlock(block);
            this.executeTransactions(block);
            return true;
        } else {
            return false;
        }
    }//Checks if a block is valid. An invalid block may have one or more of the following: an invalid hash, an invalid lastHash, an invalid forge master and an invalid signature

    executeTransactions(block) {
        block.data.forEach(transaction => {
            switch (transaction.type) {
                case TRANSACTION_TYPE.transaction:
                    this.accounts.update(transaction);
                    this.accounts.transferFee(block, transaction);
                    break;
                
                case TRANSACTION_TYPE.stake:
                    this.stakes.update(transaction);
                    this.accounts.decrement(
                        transaction.input.from,
                        transaction.output.amount
                    );
                    this.accounts.transferFee(block, transaction);
                    break;

                case TRANSACTION_TYPE.validator_fee:
                    if (this.validators.update(transaction)) {
                        this.accounts.decrement(
                            transaction.input.from,
                            transaction.output.amount
                        );
                        this.accounts.transferFee(block, transaction);
                    }
                    break;
            }
        });
    }

    executeChain(chain) {
        chain.forEach(block => {
            this.executeTransactions(block);
        });
    }//for new nodes that join the network

    resetState() {
        this.chain = [Block.genesis()];
        this.stakes = new Stake();
        this.accounts = new this.Account();
        this.validators = new Validators();
    }   //resets the state after a block has been mined so we can get a new validator, stakers etc to forge the next block
}

module.exports = Blockchain;