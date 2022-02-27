//This file holds the functions related to cryptocurrency

const EDDSA = require("elliptic").eddsa; //this package creates key pairs(public and private keys)
const eddsa = new EDDSA("ed25519");

const SHA256 = require('crypto-js/sha256');
const { ec } = require("elliptic");
const uuidV1 = require('uuid'); //This type of uuid is generated using timestamps. It is not advised to be used in production

class ChainUtil {
    static genKeyPair(secret) {
        return eddsa.keyFromSecret(secret);
    }

    //This function generates ids
    static id() {
        return uuidV1.v4();
    }

    static hash(data) {
        return SHA256(JSON.stringify(data)).toString();
    }

    static verifySignature(publicKey, signature, dataHash) {
        return ec.keyFromPublic(publicKey).verify(dataHash, signature);
    } //we decrypt a digital signature using the public key, signature and dataHash through the elliptic module
}

module.exports = ChainUtil;