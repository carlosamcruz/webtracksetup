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
    SigHash, PubKey, FixedArray, fill, Sig, hash160, toByteString, Utils, sha256, PubKeyHash, int2ByteString, len, slice, reverseByteString
} from 'scrypt-ts'
import { Point, RabinPubKey, RabinSig, RabinVerifier, SECP256K1 } from 'scrypt-ts-lib'

export class GeneralTokenV3EcdsaOracleMin extends SmartContract {
    // Stateful property to store counters value.
    @prop()
    readonly tokenType: ByteString; // data.


    @prop()
    readonly oraclePKEC: PubKey; // oracles public Key
    //oraclePKEC: Point; // oracles public Key


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


    @prop(true)
    genesisTX: ByteString; // Branches in which token grew.

    constructor(alice: PubKeyHash, totalSupply: bigint, idData: ByteString
        , oraclePKEC: PubKey//, tokenType: ByteString//oraclePoint: Point
        ) {            
        super(...arguments);
        this.totalSupply = totalSupply
        this.idData = idData
        this.thisSupply = this.totalSupply

        this.alice = alice;
        this.data = toByteString('');
        this.sell = false
        this.price = 0n
        this.toBuyer = this.alice

        this.genesisTX = toByteString('');//Necessário comparar Genesis TX com ''

        //General Purpose Token ECDSA Oracle Min = 47656e6572616c20507572706f736520546f6b656e204543445341204f7261636c65204d696e
        this.tokenType = toByteString('47656e6572616c20507572706f736520546f6b656e204543445341204f7261636c65204d696e');

        this.oraclePKEC = oraclePKEC

    }
     

    @method()    
    public setupToken(  
        sigOracle: ByteString, //pbkP2: PubKey,//sigOracle: Sig,
        sig: Sig, pubkey: PubKey, finish: boolean, newData: ByteString, 
        //utxoReserved: ByteString, //UTXO Reservado Pode ser vetor de atack

        ) {    

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
        //A unica operação permitida sem cerificação é a finalização do token
        //  nem mesmo interessa se a transação é genesis ou não
        //  ou se o token é falsificado, ou não
        {
            /////////////////////////////////////////////////////////
            //Jesus is the Lord!!!
            //
            // Solução para quebrar UTXO replicado
            // Cerificação ECDSA com Oraculo
            /////////////////////////////////////////////////////////
              
            /*
            let p1 = SECP256K1.pubKey2Point(this.oraclePKEC)
            let p2 = SECP256K1.pubKey2Point(pbkP2)
            let pbkOracle = SECP256K1.point2PubKey(SECP256K1.addPoints(p1, p2))
            //console.log('prevouts contrato: ', this.prevouts)

            assert(this.checkSig(Sig(sigOracle), pbkOracle), `checkSig failed oracle certificate`);

            */

            assert(this.checkSig(Sig(sigOracle), this.oraclePKEC), `checkSig failed oracle certificate`);

            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////


            if(this.genesisTX === toByteString(''))
            {           
                this.genesisTX = reverseByteString(slice(this.prevouts, 0n, 32n), 32n) + this.tokenType
                console.log('this.genesisTX: ', this.genesisTX )
            }

            console.log('this.genesisTX: ', this.genesisTX)

            this.data = newData;
            outputs = this.buildStateOutput(this.ctx.utxo.value);
            
            console.log('State Output 100: ', outputs.substring(0, 100))
            //0200000000000000fd1d880176018801a901ac2097dfd76851bf465e8f715593b217714858bbe9570ff3bd5e33840a34e20f
        }

        /*
        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }
        */

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    @method()
    public sellOrder(
        sigOracle: ByteString, //pbkP2: PubKey, 
        sig: Sig, pubkey: PubKey, sell: boolean, price: bigint, toBuyer: PubKeyHash,
        //utxoReserved: ByteString, //UTXO Reservado Pode ser vetor de atack        
        ) {        

        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        // Cerificação ECDSA com Oraculo
        /////////////////////////////////////////////////////////
          
        /*
        let p1 = SECP256K1.pubKey2Point(this.oraclePKEC)
        let p2 = SECP256K1.pubKey2Point(pbkP2)
        let pbkOracle = SECP256K1.point2PubKey(SECP256K1.addPoints(p1, p2))
        //console.log('prevouts contrato: ', this.prevouts)

        assert(this.checkSig(Sig(sigOracle), pbkOracle), `checkSig failed oracle certificate`);

        */
        assert(this.checkSig(Sig(sigOracle), this.oraclePKEC), `checkSig failed oracle certificate`);

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////


        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);
       
        //(a || b) && !(a && b) = XOR
        //(this.sell || sell) && !(this.sell && sell)
        assert((this.sell || sell) && !(this.sell && sell) , `checkSig failed, For Sele state alredy set as: ${sell}`);

        
        this.sell = sell

        if(sell)
        {
            /////////////////////////////////////////////////////////
            //Jesus is the Lord!!!
            //
            // Solução para quebrar UTXO replicado
            // Also a L1 Back to Genesis Solution
            /////////////////////////////////////////////////////////

            if(this.genesisTX === toByteString(''))
            {           
                this.genesisTX = reverseByteString(slice(this.prevouts, 0n, 32n), 32n) + this.tokenType
                console.log('this.genesisTX: ', this.genesisTX )
            }
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////

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

        /*
        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }
        */

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }


    //mesmo qualquer um podendo pagar, o comprador deve assinar para podemos 
    //  ter a preimage e o oraculo poder assinar também
    // Correção: como o contrato é statful a preimage será produzida de qualquer forma
    //  então, não precisa da assinatura do comprador;
    @method()
    public buying(
        sigOracle: ByteString, //pbkP2: PubKey, 
        //A assinatura dummy é necessária para aproveitamos as facilidades do metodo 
        //  getUnlockingScript do contracts.js
        //dummySig: Sig, //dummyPbk: PubKey,
        newOwner: PubKeyHash, 
        price: bigint, 
        //utxoReserved: ByteString, //UTXO Reservado Pode ser VETOR de ATACK B2G
        ) {        

        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        // Cerificação ECDSA com Oraculo
        /////////////////////////////////////////////////////////
          
        /*
        let p1 = SECP256K1.pubKey2Point(this.oraclePKEC)
        let p2 = SECP256K1.pubKey2Point(pbkP2)
        let pbkOracle = SECP256K1.point2PubKey(SECP256K1.addPoints(p1, p2))

        assert(this.checkSig(Sig(sigOracle), pbkOracle), `checkSig failed oracle certificate`);

        */

        assert(this.checkSig(Sig(sigOracle), this.oraclePKEC), `checkSig failed oracle certificate`);

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////            

        assert(this.sell, `Order failed, Not Selling`);
        assert(price >= this.price, `checkSig failed, Ask not Met`);

        if(this.toBuyer !== this.alice)
        {
            assert(this.toBuyer === newOwner, `Order failed, not the preferential buyer`);
            //assert(this.toBuyer === hash160(dummyPbk), `Order failed, not the preferential buyer`);
        }

        assert(newOwner !== this.alice, `Current Owner Cannot Buy, Only Cancel Order`);
        //assert(hash160(dummyPbk) !== this.alice, `Current Owner Cannot Buy, Only Cancel Order`);

        //assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sigNewOwner, newOwner), `checkSig failed, pubkey: ${hash160(newOwner)}`);


        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        /////////////////////////////////////////////////////////

        // Uma ordem de compra nunca poderá ser executada em uma genesis TX
        /*
        if(this.genesisTX === toByteString(''))
        {           
            this.genesisTX = reverseByteString(slice(this.prevouts, 0n, 32n), 32n) + this.tokenType
            console.log('this.genesisTX: ', this.genesisTX )
        }
        */
        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////

        // build the transation outputs
        let outputs = toByteString('');
    
        //if(this.sell)
        //{

        let lastAlice = this.alice
        //this.alice = hash160(dummyPbk)
        this.alice = newOwner
        this.sell = false
        this.price = 0n

        outputs = this.buildStateOutput(this.ctx.utxo.value);            
        //outputs += Utils.buildPublicKeyHashOutput(hash160(lastAlice), price);
        outputs += Utils.buildPublicKeyHashOutput(lastAlice, price);

        //Alert Output
        outputs += Utils.buildPublicKeyHashOutput(newOwner, 1n);

        //}

        /*
        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }
        

        if(this.toBuyer != this.alice)
        {
            outputs += Utils.buildPublicKeyHashOutput(this.toBuyer, 1n);
        }
        */


        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        console.log('This prevouts: ', this.prevouts)
        console.log('This Change Ammount: ', this.changeAmount)


        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    //Esta operação de split é critica para manter a quantidade de tokens de genesis incorruptível
    //Se os outputs vierem de fora, o contrato perde o controle do numero de tokens
    //Se tivermos mais de 2 outputs, o script do contrato cresce de forma forma ineficiente
    //O split generico mais eficiente tem somente 2 outputs de contrato
    @method()
    public split(
        sigOracle: ByteString,// pbkP2: PubKey,
        sig: Sig, pubkey: PubKey, numberOfSendTokens: bigint, toNewOwner: PubKeyHash,
        //utxoReserved: ByteString, //UTXO Reservado Pode ser vetor de atack
        ) {    

        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        // Cerificação ECDSA com Oraculo
        /////////////////////////////////////////////////////////
          
        /*
        let p1 = SECP256K1.pubKey2Point(this.oraclePKEC)
        let p2 = SECP256K1.pubKey2Point(pbkP2)
        let pbkOracle = SECP256K1.point2PubKey(SECP256K1.addPoints(p1, p2))

        assert(this.checkSig(Sig(sigOracle), pbkOracle), `checkSig failed oracle certificate`);
        */

        assert(this.checkSig(Sig(sigOracle), this.oraclePKEC), `checkSig failed oracle certificate`);

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////
            
        assert( (numberOfSendTokens > 0) && (numberOfSendTokens <= this.thisSupply), `insuficient supply fund!!`);
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);

        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        /////////////////////////////////////////////////////////
        
        if(this.genesisTX === toByteString(''))
        {           
            this.genesisTX = reverseByteString(slice(this.prevouts, 0n, 32n), 32n) + this.tokenType
            console.log('this.genesisTX: ', this.genesisTX )
        }
        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////

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

            console.log('CT Ouput 2: ', Utils.buildPublicKeyHashOutput(this.alice, 1n))
        }

        /*
        //Reserved UTXO pode ser usado para implementar taxa de serviço
        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }
        */

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
            console.log('CT Ouput 3: ', this.buildChangeOutput())
        }

        console.log('This prevouts: ', this.prevouts)
        console.log('This Change Ammount: ', this.changeAmount)


        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    @method()
    public mergeTokens(
        sigOracle: ByteString, //pbkP2: PubKey,
        sig: Sig, pubkey: PubKey, 
        Supply1: bigint, Supply2: bigint, 
        //utxoReserved: ByteString,

    ) { 
       
        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        // Cerificação ECDSA com Oraculo
        /////////////////////////////////////////////////////////
          
        /*
        let p1 = SECP256K1.pubKey2Point(this.oraclePKEC)
        let p2 = SECP256K1.pubKey2Point(pbkP2)
        let pbkOracle = SECP256K1.point2PubKey(SECP256K1.addPoints(p1, p2))

        console.log('this.changeAmount: ', this.changeAmount)
        console.log('this.buildChangeOutput(): ', this.buildChangeOutput())
        
        assert(this.checkSig(Sig(sigOracle), pbkOracle), `checkSig failed oracle certificate`);
        */

        assert(this.checkSig(Sig(sigOracle), this.oraclePKEC), `checkSig failed oracle certificate`);

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////
    
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);

        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        // Also a L1 Back to Genesis Solution
        /////////////////////////////////////////////////////////
                
        //Não é possível fazer merge com Genesis TX;
        //Os token não podem vir de cadeias diferentes, este não passaram pelo teste B2G

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////

        // build the transation outputs
        let outputs = toByteString('');
        this.thisSupply = Supply1 + Supply2
     
        outputs = this.buildStateOutput(this.ctx.utxo.value);
        //outputs += Utils.buildPublicKeyHashOutput(hash160(this.alice), this.ctx.utxo.value);
        //outputs += Utils.buildPublicKeyHashOutput(this.alice, (nMinus1Merge * this.ctx.utxo.value));
        outputs += Utils.buildPublicKeyHashOutput(this.alice, this.ctx.utxo.value);

        /*
        //Reserved UTXO pode ser usado para implementar taxa de serviço
        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }
        */

        

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
}
