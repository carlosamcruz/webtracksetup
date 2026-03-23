////////////////////////////////////////////////////////////////////////////////
// JESUS is the LORD of ALL
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
//MarketPlaceToken Token
////////////////////////////////////////////////////////////

import {
    method,
    prop,
    SmartContract,
    hash256,
    assert,
    ByteString,
    SigHash, PubKey, FixedArray, fill, Sig, hash160, toByteString, Utils, sha256, toHex
} from 'scrypt-ts'

export class MarketPlaceToken extends SmartContract {
    // Stateful property to store counters value.

    @prop(true)
    alice: PubKey; // alice's public Key

    @prop(true)
    tokenSats: ByteString; // data.

    @prop(true)
    tokenScriptSize: ByteString; // data.

    @prop(true)
    tokenP2pkhScript: ByteString; // data.

    @prop(true)
    tokenData: ByteString; // data.

    @prop(true)
    sell: boolean; // data.

    @prop(true)
    price: bigint; // data.

    @prop(true)
    //toBuyer: PubKey; // alice's public Key

    toBuyerP2PKHScript: ByteString; // alice's public Key


    constructor(alice: PubKey) {    
        super(...arguments);

        this.alice = alice;
        this.tokenSats = toByteString('');
        this.tokenScriptSize = toByteString('');
        this.tokenP2pkhScript = toByteString('');
        this.tokenData = toByteString('');
        this.sell = false
        this.price = 0n
        this.toBuyerP2PKHScript = toByteString('');
    }
     
    @method()    
    public finish(sig: Sig) {    

        assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.sell !== false, `Cant finish in sell, pubkey: ${this.alice}`);
        // build the transation outputs
        let outputs = toByteString('');

        outputs = Utils.buildPublicKeyHashOutput(hash160(this.alice), this.ctx.utxo.value);

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    //toBuyer == this.alice, for anyone can pay
    @method()
    public sellOrder(sig: Sig, seller: PubKey, sell: boolean, price: bigint, toBuyerP2PKHScript: ByteString, 
        outSats: ByteString, outOutScriptSize: ByteString, outP2pkHScript: ByteString, outData: ByteString) {    

        //(a || b) && !(a && b) = XOR
        //(this.sell || sell) && !(this.sell && sell)
        assert((this.sell || sell) && !(this.sell && sell) , `checkSig failed, For Sele state alredy set as: ${sell}`);
      
        // check signature `sig`
        if(sell)
        {
            this.alice = seller //o vendedor deve continuar usando sua chave publica
            assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        }
        else
        {
            assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        }
        

        // build the transation outputs
        let outputs = toByteString('');
        
        this.sell = sell
        if(sell)
        {
            this.price = price
            //Ordem preferencial
            this.toBuyerP2PKHScript = toBuyerP2PKHScript //sempre mudar - pois pode chegar de outro endereço

            this.tokenSats = outSats
            this.tokenScriptSize = outOutScriptSize
            this.tokenP2pkhScript = outP2pkHScript
            this.tokenData = outData
            outputs = this.buildStateOutput(this.ctx.utxo.value);
        }
        else
        {
            //this.data = toByteString('')
            //this.toBuyerADD = toByteString('');
            this.price = 0n
            outputs = this.tokenSats + this.tokenScriptSize + this.tokenP2pkhScript + this.tokenData //script do output

            //console.log('Token Sats: ', this.tokenSats)
            //console.log('Token SCsize: ', this.tokenScriptSize)
            //console.log('Token Data 100: ', this.tokenData.substring(0, 100))
            //console.log('Token Data Hash: ', hash256(this.tokenData))

            //console.log('Script 100: ', (outputs).substring(0, 100))
            //console.log('Script size: ', (outputs).length)
            //console.log('Hash Script: ', hash256(outputs))
        }


        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        //console.log('Outputs: ', outputs)

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    @method()
    //public buying(newOwner: PubKey, price: bigint) {    
    public buying(newOwnerAddScript: ByteString, price: bigint) {        

        //console.log('Price Token: ', this.price)
        //console.log('Price offer: ', price)

        assert(this.sell, `Order failed, Not Selling`);
        assert(price >= this.price, `checkSig failed, Ask not Met`);
        assert(newOwnerAddScript !== this.tokenP2pkhScript, `checkSig failed, The owner can cancel the order rather than buy it`);

        
        if(this.toBuyerP2PKHScript !== toByteString(''))
        {
            //assert(toByteString(newOwnerAddScript[0].substring(18, 68)) === this.toBuyerP2PKHScript, `checkSig failed, Ask not Met`);
            //assert(newOwnerAddScript === this.toBuyerP2PKHScript, `checkSig failed, Ask not Met`);
            //assert(this.toBuyer !== this.alice, `Mesmo dono`);    
            assert(newOwnerAddScript === this.toBuyerP2PKHScript, `checkSig failed, Not preferential buyer`);
        }
        
        // build the transation outputs
        let outputs = toByteString('');

        let lastAlice = this.alice
        //this.alice = newOwner
        this.sell = false
        this.price = 0n

        outputs = this.tokenSats + this.tokenScriptSize + newOwnerAddScript + this.tokenData         
        outputs += Utils.buildPublicKeyHashOutput(hash160(lastAlice), price);

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

}
