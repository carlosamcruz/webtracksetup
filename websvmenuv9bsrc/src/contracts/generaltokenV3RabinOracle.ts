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
import { RabinPubKey, RabinSig, RabinVerifier } from 'scrypt-ts-lib'

export class GeneralTokenV3RabinOracle extends SmartContract {
    // Stateful property to store counters value.
    @prop()
    readonly tokenType: ByteString; // data.

    //@prop(true)
    //prevUtxo: ByteString; // data.

    @prop()
    readonly totalSupply: bigint; // data.

    @prop()
    readonly idData: ByteString; // data.

    // Oracles Rabin public key.
    @prop() readonly oraclePubKey: RabinPubKey

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

    constructor(alice: PubKeyHash, totalSupply: bigint, idData: ByteString, oraclePubKey: RabinPubKey) {            
        super(...arguments);
        this.totalSupply = totalSupply
        this.idData = idData
        //this.idData = slice(idData, 32n)  
        this.thisSupply = this.totalSupply

        this.alice = alice;
        //this.data = toByteString('00');
        this.data = toByteString('');
        this.sell = false
        this.price = 0n
        this.toBuyer = this.alice

        //this.genesisToken = sha256(this.prevouts)
        //this.prevUtxo = slice(idData, 0n, 32n)
        //this.prevUtxo = prevUtxo
        this.genesisTX = toByteString('');//Necessário comparar Genesis TX com ''

        //General Purpose Token = 47656e6572616c20507572706f736520546f6b656e
        //this.tokenType = toByteString('47656e6572616c20507572706f736520546f6b656e');

        //General Purpose Token Rabin Oracle = 47656e6572616c20507572706f736520546f6b656e20526162696e204f7261636c65
        this.tokenType = toByteString('47656e6572616c20507572706f736520546f6b656e20526162696e204f7261636c65');

        this.oraclePubKey = oraclePubKey
        //this.branch = toByteString('00');
        //this.nTxThisBranch = 0n;
    }
     

    @method()    
    //public setupToken(sig: Sig, pubkey: PubKey, finish: boolean, newData: ByteString, utxoReserved: ByteString) {    
    public setupToken( CertSig: RabinSig,
        sig: Sig, pubkey: PubKey, finish: boolean, newData: ByteString, 
        //utxoReserved: ByteString,
           
        ) {    

        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);
        // build the transation outputs

        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        // Also a L1 Back to Genesis Solution
        /////////////////////////////////////////////////////////


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

            if(this.genesisTX === toByteString(''))
            {           
                this.genesisTX = reverseByteString(slice(this.prevouts, 0n, 32n), 32n) + this.tokenType
                console.log('this.genesisTX: ', this.genesisTX )
            }
            //else  
            assert(
                //RabinVerifierWOC.verifySig(slice(msg, 0n, 29n), sig, this.oraclePubKey),
    
                //A assinatura faz parte do Unlocking Script
                //RabinVerifierWOC.verifySig(msg, sig, this.oraclePubKey), //Não Funciona fora da WOC
                RabinVerifier.verifySig(slice(this.prevouts, 0n, 36n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
               'Oracle sig verify failed.'
            )

            //this.genesisTXverify();
            console.log('this.genesisTX: ', this.genesisTX)
            //this.nTxThisBranch = this.nTxThisBranch + 1n;

            //Jesus is the Lord!!!
            //
            //A entrada desta tx pode ter 2 inputs, mas a saida somente 1

            //if(len(this.prevUtxo) > 72n)
            //    this.prevUtxo = slice(this.prevouts, 0n, 72n) //2 output de cada vez
            //else
            //    this.prevUtxo = slice(this.prevouts, 0n, 36n) //somente 1 output de cada vez

            //console.log('New this.prevUtxo: ', this.prevUtxo)

            this.data = newData;
            //this.dataInfo = newDataInfo
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

    //toBuyer == this.alice, for anyone can pay
    @method()
    //public sellOrder(sig: Sig, pubkey: PubKey, sell: boolean, price: bigint, toBuyer: PubKey) {    
    public sellOrder(CertSig: RabinSig, 
        sig: Sig, pubkey: PubKey, sell: boolean, price: bigint, toBuyer: PubKeyHash, 
        //utxoReserved: ByteString,        
        ) {        
        // check signature `sig`


        assert(hash160(pubkey) == this.alice, "Bad public key")
        //assert(this.checkSig(sig, this.alice), `checkSig failed, pubkey: ${this.alice}`);
        assert(this.checkSig(sig, pubkey), `checkSig failed, pubkey: ${this.alice}`);
       
        //(a || b) && !(a && b) = XOR
        //(this.sell || sell) && !(this.sell && sell)
        assert((this.sell || sell) && !(this.sell && sell) , `checkSig failed, For Sele state alredy set as: ${sell}`);

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
        //else  
        assert(
            //RabinVerifierWOC.verifySig(slice(msg, 0n, 29n), sig, this.oraclePubKey),

            //A assinatura faz parte do Unlocking Script
            //RabinVerifierWOC.verifySig(msg, sig, this.oraclePubKey), //Não Funciona fora da WOC
            RabinVerifier.verifySig(slice(this.prevouts, 0n, 36n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
           'Oracle sig verify failed.'
        )

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////
        
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
    //public buying(newOwner: PubKey, price: bigint) {    
    public buying(CertSig: RabinSig,
        newOwner: PubKeyHash, price: bigint, 
        //utxoReserved: ByteString,
        ) {        

        assert(this.sell, `Order failed, Not Selling`);
        assert(price >= this.price, `checkSig failed, Ask not Met`);

        if(this.toBuyer !== this.alice)
        {
            assert(this.toBuyer === newOwner, `Order failed, not the preferential buyer`);
        }

        assert(newOwner !== this.alice, `Current Owner Cannot Buy, Only Cancel Order`);

        /////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        //
        // Solução para quebrar UTXO replicado
        // Also a L1 Back to Genesis Solution
        /////////////////////////////////////////////////////////

        //Order buy não pode vir de uma genesis

        /*
        if(this.genesisTX === toByteString(''))
        {           
            this.genesisTX = reverseByteString(slice(this.prevouts, 0n, 32n), 32n) + this.tokenType
            console.log('this.genesisTX: ', this.genesisTX )
        }
        */
        //else  
        assert(
            //RabinVerifierWOC.verifySig(slice(msg, 0n, 29n), sig, this.oraclePubKey),

            //A assinatura faz parte do Unlocking Script
            //RabinVerifierWOC.verifySig(msg, sig, this.oraclePubKey), //Não Funciona fora da WOC
            RabinVerifier.verifySig(slice(this.prevouts, 0n, 36n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
           'Oracle sig verify failed.'
        )

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////

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

    //Esta operação de split é critica para manter a quantidade de tokens de genesis incorruptível
    //Se os outputs vierem de fora, o contrato perde o controle do numero de tokens
    //Se tivermos mais de 2 outputs, o script do contrato cresce de forma forma ineficiente
    //O split generico mais eficiente tem somente 2 outputs de contrato
    @method()
    public split(CertSig: RabinSig,
        sig: Sig, pubkey: PubKey, numberOfSendTokens: bigint, toNewOwner: PubKeyHash, 
        //utxoReserved: ByteString,
        ) {    
    //public split(sig: Sig, numberOfSendTokens: bigint, toNewOwner: PubKey) {    

        assert(numberOfSendTokens <= this.thisSupply, `insuficient supply fund!!`);
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
        
        if(this.genesisTX === toByteString(''))
        {           
            this.genesisTX = reverseByteString(slice(this.prevouts, 0n, 32n), 32n) + this.tokenType
            console.log('this.genesisTX: ', this.genesisTX )
        }
        //else  
        assert(
            //RabinVerifierWOC.verifySig(slice(msg, 0n, 29n), sig, this.oraclePubKey),

            //A assinatura faz parte do Unlocking Script
            //RabinVerifierWOC.verifySig(msg, sig, this.oraclePubKey), //Não Funciona fora da WOC
            RabinVerifier.verifySig(slice(this.prevouts, 0n, 36n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
           'Oracle sig verify failed.'
        )

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////


        // build the transation outputs
        let outputs1 = toByteString('');
        let outputs = toByteString('');


        if(this.thisSupply == numberOfSendTokens)
        {
            //this.nTxThisBranch = this.nTxThisBranch + 1n; //transferencia

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
            //this.branch = branch00 // muda o branch para primeiro output
            //outputs += this.buildStateOutput(this.ctx.utxo.value);
            outputs = this.buildStateOutput(this.ctx.utxo.value) + outputs1;
            //Alert Output
            //outputs += Utils.buildPublicKeyHashOutput(hash160(this.alice), 1n);
            outputs += Utils.buildPublicKeyHashOutput(this.alice, 1n);
        }

        //Reserved UTXO pode ser usado para implementar taxa de serviço
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

    public mergeTokens(CertSig: RabinSig,
        sig: Sig, pubkey: PubKey, 
        
        Supply1: bigint, Supply2: bigint, 

        //utxoReserved: ByteString,

    ) {        
    
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
        
        /*
        //Não é possível fazer merge com Genesis TX;
        //Os token não podem vir de cadeias diferentes, este não passaram pelo teste B2G
        if(this.genesisTX === toByteString(''))
        {           
            this.genesisTX = reverseByteString(slice(this.prevouts, 0n, 32n), 32n) + this.tokenType
            console.log('this.genesisTX: ', this.genesisTX )
        }
        */
        //else  
        assert(
            //RabinVerifierWOC.verifySig(slice(msg, 0n, 29n), sig, this.oraclePubKey),

            //A assinatura faz parte do Unlocking Script
            //RabinVerifierWOC.verifySig(msg, sig, this.oraclePubKey), //Não Funciona fora da WOC

            //RabinVerifier.verifySig(slice(this.prevouts, 0n, 36n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
            RabinVerifier.verifySig(slice(this.prevouts, 0n, 72n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
           'Oracle sig verify failed.'
        )

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////


        //this.ctx.hashPrevouts //verificar
        //this.prevouts //verificar mandar imprimir

        // build the transation outputs
        let outputs = toByteString('');
        this.thisSupply = Supply1 + Supply2
     

        outputs = this.buildStateOutput(this.ctx.utxo.value);
        //outputs += Utils.buildPublicKeyHashOutput(hash160(this.alice), this.ctx.utxo.value);
        //outputs += Utils.buildPublicKeyHashOutput(this.alice, (nMinus1Merge * this.ctx.utxo.value));
        outputs += Utils.buildPublicKeyHashOutput(this.alice, this.ctx.utxo.value);

        //Reserved UTXO pode ser usado para implementar taxa de serviço
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

}
