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
    SigHash, PubKey, FixedArray, fill, Sig, hash160, toByteString, Utils, sha256, toHex, Addr, PubKeyHash
} from 'scrypt-ts'

//import { exchangeRate } from '../mProviders';
//import { RabinPubKey, RabinSig, RabinVerifierWoc } from '/scrypt-ts-lib'
//import { RabinPubKey } from 'scrypt-ts-lib'

type ExchangeRate = {
    timestamp: bigint
    price: bigint
    symbol: ByteString
}

export class MarketTimeBuyCovenant extends SmartContract {
    // Stateful property to store counters value.

    //https://xiaohuiliu.medium.com/cross-chain-atomic-swaps-f13e874fcaa7
    @prop() readonly timeout: bigint // Can be a timestamp or block height.
    @prop() readonly sizeOrder: ByteString // Can be a timestamp or block height.
    //0200000000000000fd1d880176018801a901ac2097dfd76851bf465e8f715593b217714858bbe9570ff3bd5e33840a34e20f
    @prop() readonly priceOrder: bigint // Can be a timestamp or block height.
    @prop()
    oderMakerAdd: PubKeyHash; // order Maker PUB Key
    //readonly pubKeyHashes: FixedArray<PubKeyHash, 2>

    @prop(true)
    oderTaker: PubKey; // order Maker PUB Key
    @prop(true)
    oderTakerAdd: PubKeyHash; // order Maker PUB Key
    //readonly pubKeyHashes: FixedArray<PubKeyHash, 2>

    @prop(true)
    excangeRate: ExchangeRate; // order Maker PUB Key
    //readonly pubKeyHashes: FixedArray<PubKeyHash, 2>

    /*
    @prop(true)
    exchangeRateTimestamp: bigint;
    @prop(true)
    exchangeRatePrice: bigint;
    @prop(true)
    exchangeRateSymbol: ByteString;

    */

    @prop(true)
    timeOutSetPrice: bigint; // order Maker PUB Key
    //readonly pubKeyHashes: FixedArray<PubKeyHash, 2>
    @prop(true)
    setPriceAgent: bigint; // 0 = not locktime; 1 = maker; 2 = taker


    @prop(true)
    tokenSats: ByteString; // data.

    @prop(true)
    tokenScriptSize: ByteString; // data.

    @prop(true)
    tokenP2pkhScript: ByteString; // data.

    @prop(true)
    tokenData: ByteString; // data.

    @prop(true)
    sold: boolean; // data.

    @prop(true)
    price: bigint; // data.

    @prop(true)
    //toBuyer: PubKey; // alice's public Key

    toBuyerP2PKHScript: ByteString; // alice's public Key


    constructor(oderTakerAdd: PubKeyHash, oderMakerAdd: PubKeyHash, oderTaker: PubKey, timeout: bigint, priceOrder: bigint, sizeOrder: ByteString, sold: boolean) {    
        super(...arguments);

        this.tokenSats = toByteString('');
        this.tokenScriptSize = toByteString('');
        this.tokenP2pkhScript = toByteString('');
        this.tokenData = toByteString('');
        
        this.price = 0n

        this.oderTaker = oderTaker;
        this.oderTakerAdd = oderTakerAdd;
        this.oderMakerAdd = oderMakerAdd;
        this.sold = sold
        this.timeout = timeout //default 0
        this.priceOrder = priceOrder // Valor que o usuário que comprar
        this.sizeOrder = sizeOrder // Satoshis a serem comprado em Little Endian para colocar no state output
        this.setPriceAgent = 0n

        //this.exchangeRateTimestamp = 0n
        //this.exchangeRatePrice = 0n
        //this.exchangeRateSymbol = toByteString('')
/*
        this.excangeRateTimestamp = 0n
        this.ex

*/
        this.excangeRate = {
                                timestamp: 0n,
                                price: 0n,
                                symbol: toByteString(''), // Initializing with an empty string
                            };
                            
        this.timeOutSetPrice = 1000000000000n 

        this.toBuyerP2PKHScript = toByteString('');
    }

    //Finaliza uma ordem que ainda não foi aceita para lock
    @method()    
    public finish(sig: Sig, pubkey: PubKey) {    

        assert(this.sold === false, `Cant finish a sold order, pubkey: ${this.oderTaker}`);
        //assert((hash160(pubkey) == this.oderMakerAdd) && (this.checkSig(sig, pubkey)), "Bad sig or Hash 1")
        assert(hash160(pubkey) == this.oderMakerAdd, "Bad public key")
        assert(this.checkSig(sig, pubkey), "Bad signature")

        // build the transation outputs
        let outputs = toByteString('');

        outputs = Utils.buildPublicKeyHashOutput(hash160(this.oderMakerAdd), this.ctx.utxo.value);

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
 
    //Vendedor ou comprador tem 72 horas para protestar ou concordar com o preço
    //Se perder o tempo, o preço final é estabelecido:     
    
    
    @method()    
    public priceAtSetTime(sig: Sig, pubkey: PubKey, rate: ExchangeRate) {
        
        //(72 * 60) / 10 => 432 blocos
        //Para testes 4 blocos

        assert(this.sold === false, 'can set price no taken order');
        assert(this.ctx.locktime >= this.timeout, 'Cannot set price before timeout' )

        //assert((hash160(pubkey) == this.oderMakerAdd) && (this.checkSig(sig, pubkey)), "Bad sig or Hash 1")
        assert((hash160(pubkey) === this.oderMakerAdd) || (hash160(pubkey) === this.oderTakerAdd), "Bad public key")
        if((hash160(pubkey) === this.oderMakerAdd))
        {
            assert(this.setPriceAgent === 0n || this.setPriceAgent === 2n, "Cannot set price again")
            this.setPriceAgent = 1n // 0 = not locktime; 1 = maker; 2 = taker
            assert(this.checkSig(sig, pubkey), "Bad signature")
        }
        else
        {
            assert(this.setPriceAgent === 0n || this.setPriceAgent === 1n, "Cannot set price again")
            this.setPriceAgent = 2n // 0 = not locktime; 1 = maker; 2 = taker
            assert(this.checkSig(sig, pubkey), "Bad signature")
        }

        //this.timeOutSetPrice = this.ctx.locktime + 432n
        this.timeOutSetPrice = this.ctx.locktime + 4n // Just for test

        //this.exchangeRateTimestamp = rate.timestamp
        //this.exchangeRatePrice = rate.price
        //this.exchangeRateSymbol = rate.symbol

        this.excangeRate = rate

        let outputs = toByteString('');
        outputs = this.buildStateOutput(this.ctx.utxo.value);

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
    
    

     
    //72 horas para protesto ou concordancia acerca do preco estabelecido;
    @method()    
    public execute(sig: Sig, pubkey: PubKey) 
    {    
        //Oracle
        //https://docs.scrypt.io/tutorials/oracle/#overview

        //assert(this.checkSig(sig, this.oderMaker), `checkSig failed, pubkey: ${this.oderMaker}`);
        assert(this.sold === false, 'can set price no taken order');
        assert(this.ctx.locktime >= this.timeout, 'Cannot set price before timeout' )

        if(this.ctx.locktime < this.timeOutSetPrice)
        {
            if((hash160(pubkey) === this.oderMakerAdd))
            {
                //setPriceAgent 0 = not locktime; 1 = maker; 2 = taker
                assert(this.setPriceAgent === 2n, "Agent not allowed to execute before Set Price Timeout")       
            }
            else
            {
                //setPriceAgent 0 = not locktime; 1 = maker; 2 = taker
                assert(this.setPriceAgent === 1n, "Agent not allowed to execute before Set Price Timeout")
            }
            assert(this.checkSig(sig, pubkey), "Bad signature")
        }

        let outputs = toByteString('');

        //let a = BigInt(this.balance)
        let amountMaker = 0n
        let amountTaker = this.ctx.utxo.value

        outputs = Utils.buildPublicKeyHashOutput(this.oderTakerAdd, amountTaker);
        
        if(this.excangeRate.price > this.priceOrder)
        {
            amountMaker = (this.ctx.utxo.value * (this.excangeRate.price - this.priceOrder)) / this.excangeRate.price
            amountTaker = (this.ctx.utxo.value - amountTaker)
            outputs = Utils.buildPublicKeyHashOutput(this.oderMakerAdd, amountMaker);
            outputs += Utils.buildPublicKeyHashOutput(this.oderTakerAdd, amountTaker);

        }

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
        assert((this.sold || sell) && !(this.sold && sell) , `checkSig failed, For Sele state alredy set as: ${sell}`);
      
        // check signature `sig`
        if(sell)
        {
            this.oderTaker = seller //o vendedor deve continuar usando sua chave publica
            assert(this.checkSig(sig, this.oderTaker), `checkSig failed, pubkey: ${this.oderTaker}`);
        }
        else
        {
            assert(this.checkSig(sig, this.oderTaker), `checkSig failed, pubkey: ${this.oderTaker}`);
        }
        

        // build the transation outputs
        let outputs = toByteString('');
        
        this.sold = sell
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

        assert(this.sold, `Order failed, Not Selling`);
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

        let lastAlice = this.oderTaker
        //this.alice = newOwner
        this.sold = false
        this.price = 0n

        outputs = this.tokenSats + this.tokenScriptSize + newOwnerAddScript + this.tokenData         
        outputs += Utils.buildPublicKeyHashOutput(hash160(lastAlice), price);

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

}
