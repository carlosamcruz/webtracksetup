////////////////////////////////////////////////////////////////////////////////
// JESUS is the LORD of ALL
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
//General Purpose Token
////////////////////////////////////////////////////////////

import {
    method,
    prop,
    SmartContract,
    hash256,
    assert,
    ByteString,
    SigHash, PubKey, FixedArray, fill, Sig, hash160, toByteString, Utils, sha256, PubKeyHash
} from 'scrypt-ts'

export class GeneralTokenV2 extends SmartContract {
    // Stateful property to store counters value.
    @prop()
    readonly tokenType: ByteString; // data.

    @prop()
    readonly totalSupply: bigint; // data.

    @prop()
    readonly idData: ByteString; // data.

    @prop(true)
    //alice: PubKey; // alice's public Key
    alice: PubKeyHash; // alice's public Key
    
    @prop(true)
    data: ByteString; // data.

    @prop(true)
    sell: boolean; // data.

    @prop(true)
    price: bigint; // data.

    @prop(true)
    thisSupply: bigint; // data.

    @prop(true)
    //toBuyer: PubKey; // alice's public Key
    toBuyer: PubKeyHash; // alice's public Key

    //oderTakerAdd: PubKeyHash; // order Maker PUB Key


    //constructor(alice: PubKey, totalSupply: bigint, idData: ByteString) {    
    constructor(alice: PubKeyHash, totalSupply: bigint, idData: ByteString) {        
        super(...arguments);
        this.totalSupply = totalSupply
        this.idData = idData
        this.thisSupply = this.totalSupply

        this.alice = alice;
        this.data = toByteString('');
        this.sell = false
        this.price = 0n
        this.toBuyer = this.alice

        //General Purpose Token = 47656e6572616c20507572706f736520546f6b656e
        this.tokenType = toByteString('47656e6572616c20507572706f736520546f6b656e');
    }
     
    @method()    
    public setupToken(sig: Sig, pubkey: PubKey, finish: boolean, newData: ByteString, utxoReserved: ByteString) {    

        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);
        // build the transation outputs
        let outputs = toByteString('');

        if(finish)
        {
            //outputs = Utils.buildPublicKeyHashOutput(hash160(this.alice), this.ctx.utxo.value);
            outputs = Utils.buildPublicKeyHashOutput(this.alice, this.ctx.utxo.value);
        }
        else
        {
            this.data = newData;
            //this.dataInfo = newDataInfo
            outputs = this.buildStateOutput(this.ctx.utxo.value);
            
            console.log('State Output 100: ', outputs.substring(0, 100))
            //0200000000000000fd1d880176018801a901ac2097dfd76851bf465e8f715593b217714858bbe9570ff3bd5e33840a34e20f
        }

        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    //toBuyer == this.alice, for anyone can pay
    @method()
    //public sellOrder(sig: Sig, pubkey: PubKey, sell: boolean, price: bigint, toBuyer: PubKey) {    
    public sellOrder(sig: Sig, pubkey: PubKey, sell: boolean, price: bigint, toBuyer: PubKeyHash, utxoReserved: ByteString) {        
        // check signature `sig`


        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);
       
        //(a || b) && !(a && b) = XOR
        //(this.sell || sell) && !(this.sell && sell)
        assert((this.sell || sell) && !(this.sell && sell) , `checkSig failed, For Sele state alredy set as: ${sell}`);
        
        this.sell = sell

        if(sell)
        {
            this.price = price
            //Ordem preferencial
            this.toBuyer = toBuyer //sempre mudar - pois pode chegar de outro endereço

        }
        else
        {
            this.price = 0n
            this.toBuyer = this.alice
            //outputs = this.buildStateOutput(this.ctx.utxo.value);
        }

        // build the transation outputs
        let outputs = toByteString('');

        outputs = this.buildStateOutput(this.ctx.utxo.value);
        //Alert Output

        if(this.toBuyer != this.alice)
        {
            outputs += Utils.buildPublicKeyHashOutput(this.toBuyer, 1n);
        }
        //outputs += Utils.buildPublicKeyHashOutput(hash160(this.alice), 1n);

        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    @method()
    //public buying(newOwner: PubKey, price: bigint) {    
    public buying(newOwner: PubKeyHash, price: bigint, utxoReserved: ByteString) {        

        assert(this.sell, `Order failed, Not Selling`);
        assert(price >= this.price, `checkSig failed, Ask not Met`);

        if(this.toBuyer !== this.alice)
        {
            assert(this.toBuyer === newOwner, `Order failed, not the preferential buyer`);
        }

        assert(newOwner !== this.alice, `Current Owner Cannot Buy, Only Cancel Order`);

        // build the transation outputs
        let outputs = toByteString('');
    
        if(this.sell)
        {
            let lastAlice = this.alice
            this.alice = newOwner
            this.sell = false
            this.price = 0n

            outputs = this.buildStateOutput(this.ctx.utxo.value);            
            //outputs += Utils.buildPublicKeyHashOutput(hash160(lastAlice), price);
            outputs += Utils.buildPublicKeyHashOutput(lastAlice, price);
        }

        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    @method()

    public split(sig: Sig, pubkey: PubKey, numberOfSendTokens: bigint, toNewOwner: PubKeyHash, utxoReserved: ByteString) {    
    //public split(sig: Sig, numberOfSendTokens: bigint, toNewOwner: PubKey) {    

        assert(numberOfSendTokens <= this.thisSupply, `insuficient supply fund!!`);
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);


        // build the transation outputs
        let outputs1 = toByteString('');
        let outputs = toByteString('');


        if(this.thisSupply == numberOfSendTokens)
        {
            this.alice = toNewOwner
            outputs = this.buildStateOutput(this.ctx.utxo.value);
            //Alert Output
            //outputs += Utils.buildPublicKeyHashOutput(hash160(this.alice), 1n);
            outputs += Utils.buildPublicKeyHashOutput(this.alice, 1n);
        }
        else
        {
            this.thisSupply = this.thisSupply - numberOfSendTokens
            outputs1 = this.buildStateOutput(this.ctx.utxo.value);
            
            this.alice = toNewOwner
            this.thisSupply = numberOfSendTokens
            //outputs += this.buildStateOutput(this.ctx.utxo.value);
            outputs = this.buildStateOutput(this.ctx.utxo.value) + outputs1;
            //Alert Output
            //outputs += Utils.buildPublicKeyHashOutput(hash160(this.alice), 1n);
            outputs += Utils.buildPublicKeyHashOutput(this.alice, 1n);
        }

        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        console.log('This prevouts: ', this.prevouts)

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    @method()
    public mergeTokens(sig: Sig, pubkey: PubKey, Supply1: bigint, Supply2: bigint, utxoReserved: ByteString) {    
    //public mergeTokens(sig: Sig, Supply1: bigint, Supply2: bigint) {    

        assert( Supply1 == this.thisSupply || Supply2 == this.thisSupply, `supply dont match`);
        assert((Supply1 + Supply2) <= this.totalSupply, `to many tokens`);
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);

        // build the transation outputs
        let outputs = toByteString('');
        this.thisSupply = Supply1 + Supply2
        outputs = this.buildStateOutput(this.ctx.utxo.value);
        //outputs += Utils.buildPublicKeyHashOutput(hash160(this.alice), this.ctx.utxo.value);
        outputs += Utils.buildPublicKeyHashOutput(this.alice, this.ctx.utxo.value);

        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
}
