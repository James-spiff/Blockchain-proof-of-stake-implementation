const SHA256 = require('crypto-js/sha256');
const ChainUtil = require('../chain-util');

class Block {
    constructor(timestamp, lastHash, hash, data, validator, signature) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.validator = validator; //forgeMaster
        this.signature = signature;
    }

    toString() {
        return `Block -
        Timestamp: ${this.timestamp}
        Last Hash: ${this.lastHash}
        Hash: ${this.hash}
        Data: ${this.data}
        Validator: ${this.validator}
        Signature: ${this.signature}`;
    } //prints the details of the block in readable format

    static genesis() {
        return new this(`genesis time`, "----", "genesis-hash", []);
    }

    static hash(timestamp, lastHash, data) {
        return SHA256(`${timestamp}${lastHash}${data}`).toString();
    }

    static createBlock(lastBlock, data, wallet) {
        let hash;
        let timestamp = Date.now();
        const lastHash = lastBlock.hash;
        hash = Block.hash(timestamp, lastHash, data);

        let validator = wallet.getPublicKey(); //gets the public key of the validator/forgeMaster
        let signature = Block.signBlockHash(hash, wallet);

        return new this(timestamp, lastHash, hash, data, validator, signature);

    }

    static blockHash(block) {
        //we destructure block and get the timestamp, lastHash and data from it
        const { timestamp, lastHash, data } = block;
        return Block.hash(timestamp, lastHash, data);
    }

    static signBlockHash(hash, wallet) {
        return wallet.sign(hash);
    }

    static verifyBlock(block) {
        return ChainUtil.verifySignature(
            block.validator,
            block.signature,
            Block.hash(block.timestamp, block.lastHash, block.data)
        );
    }

    static verifyForgeMaster(block, forgeMaster) {
        return block.validator == forgeMaster ? true : false;
    }
}

module.exports = Block;