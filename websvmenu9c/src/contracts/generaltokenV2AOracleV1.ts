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

export class GeneralTokenV2 extends SmartContract {
    // Stateful property to store counters value.
    @prop()
    readonly tokenType: ByteString; // data.

    //@prop(true)
    //prevUtxo: ByteString; // data.

    @prop()
    readonly oraclePKEC: PubKey; // oracles public Key
    //oraclePKEC: Point; // oracles public Key


    @prop()
    readonly totalSupply: bigint; // data.

    @prop()
    readonly idData: ByteString; // data.

    // Oracles Rabin public key.
//    @prop() readonly oraclePubKey: RabinPubKey

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

    //@prop(true)
    //branch: ByteString; // Branches in which token grew.

    //@prop(true)
    //nTxThisBranch: bigint; // number of TX in this branch.

    @prop(true)
    genesisTX: ByteString; // Branches in which token grew.

    //constructor(alice: PubKey, totalSupply: bigint, idData: ByteString) {    
    //constructor(alice: PubKeyHash, totalSupply: bigint, idData: ByteString, prevUtxo: ByteString) {        
    constructor(alice: PubKeyHash, totalSupply: bigint, idData: ByteString
        //, oraclePubKey: RabinPubKey 
        , oraclePKEC: PubKey//, tokenType: ByteString//oraclePoint: Point
        ) {            
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
        this.tokenType = toByteString('47656e6572616c20507572706f736520546f6b656e');
        //this.tokenType = tokenType;
  //      this.oraclePubKey = oraclePubKey
        //this.branch = toByteString('00');
        //this.nTxThisBranch = 0n;

        //Deverá ser Uncompressed
        //this.oraclePKEC = PubKey(toByteString('04c0e0bf0bbcdc53be9542359aeb1dde7c6289743b7b3460c12e2d57a478c6e489f2091bbc32eb56a430b759a400cddf53ba62ba936c7dda04e1f148088432a58b'))
        this.oraclePKEC = oraclePKEC
        //this.oraclePKEC = SECP256K1.pubKey2Point(PubKey(toByteString('04c0e0bf0bbcdc53be9542359aeb1dde7c6289743b7b3460c12e2d57a478c6e489f2091bbc32eb56a430b759a400cddf53ba62ba936c7dda04e1f148088432a58b')))
        //this.oraclePKEC = oraclePoint

    }
     
    //////////////////////////////////////////////////////////////////
    // Solução (Antiga) para evitar uso de UTXO criado sem um estado anterior do contrato: 
    //      informar part1(1) + **PrevOut(1) + part3(1) do UTXO que esta sendo usado 
    //      produzir com buildStateOutput UTXO(1)
    //      concatenar e recriar TX1 = part1(1) + **PrevOut(1) + UTXO(1) + part3(1)
    //   ***Verificar se this.prevUtxo === **PrevOut(1) 
    //          (não precisa informar PrevOut(1), pois o TXID da transação sendo gasta deve ser reconstruido)
    //          (Se não for possível reconstuir o TXID da transação que será gasta, então o UTXO é fraudulento)      
    //      criar TXID1
    //      encontrar TXID1 em this.prevouts
    //      se TXID1 está em this.prevouts
    //          então o UTXO é válido
    //////////////////////////////////////////////////////////////////



    //Estados do input que podem ser diferentes do output na TX a ser usada	

    //alice: PubKeyHash; //O token poderia ter vindo de outra pessoa        
    //data: ByteString; //O token poderia ter mudado de dado
        //Neste caso checar se houve mudança de dado da tx avó para a tx pai
        //se não houve mudança este campo deve permanecer vazio
        //Na pior das hipoteses, devemos reapresentar o dado uma vez a mais na entrada
        //Podemos ter Merge(2 entradas e 1 saida) + 1 apresentação + 3 no resto da transação, 
            //Split(1 entradas e 2 saida) + 1 apresentação + 3 no resto da transação,
        //Pior caso de todos  Split(2 entradas e 2 saida) + 1 apresentação + 3 no resto da transação, 
        //	isso significa que nosso dado não pode ter mais que 1.2MB; //Para ser aceito por um nó de 10 MB de tx
    //sell: boolean; // Token pode ter vindo de uma operação de venda.
    //price: bigint; // Token pode ter vindo de uma operação de venda.
    //thisSupply: bigint; // Token poder ter vindo de um Split ou Merge
    //toBuyer: PubKeyHash; // Token poder ter vindo de uma oferta diferente

    //solução otimizada, enviar o token com o estado do avo, e informar o estado do pai
    //para não ter que executar troca de estado;
    //Pega o estado da transação Avo, programa o etado Filho com a transação Pai

    @method()    
    //public setupToken(sig: Sig, pubkey: PubKey, finish: boolean, newData: ByteString, utxoReserved: ByteString) {    
    public setupToken( 
        //CertSig: RabinSig, 
        sigOracle: ByteString, pbkP2: PubKey,//sigOracle: Sig,
        sig: Sig, pubkey: PubKey, finish: boolean, newData: ByteString, utxoReserved: ByteString,

        ) {    

        //let sigABC: Sig

        //let sigABC = Sig(sigOracle) 

        //console.log('Oracle Sig: ', sigOracle)
        //console.log('Sig Sig: ', sig)
        //console.log('Sig SigABC: ', sigABC)
        //console.log('Sig Sig22222222222: ', sig)      
        
        let p1 = SECP256K1.pubKey2Point(this.oraclePKEC)

        //let p2 = SECP256K1.G
        let p2 = SECP256K1.pubKey2Point(pbkP2)

        let pbkOracle = SECP256K1.point2PubKey(SECP256K1.addPoints(p1, p2))

        //console.log('prevouts contrato: ', this.prevouts)

        assert(this.checkSig(Sig(sigOracle), pbkOracle), `checkSig failed oracle certificate`);

        

        //let p1 = SECP256K1.pubKey2Point(this.oraclePKEC)

        //let p2 = SECP256K1.G
        

        //let pbkOracle = SECP256K1.point2PubKey(SECP256K1.addPoints(this.oraclePKEC, SECP256K1.G))


        //console.log('Orac PBK: ', this.oraclePKEC)
        //console.log('New PBK: ', pbkOracle)

        //console.log('this.alice: ', this.alice)
        //console.log('hash160(pubkey)', hash160(pubkey))
        //console.log('(pubkey)', (pubkey.toString()))

    

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

               
        /////////////////////////////////////////////////////////
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
            /*  
            assert(
                //RabinVerifierWOC.verifySig(slice(msg, 0n, 29n), sig, this.oraclePubKey),
    
                //A assinatura faz parte do Unlocking Script
                //RabinVerifierWOC.verifySig(msg, sig, this.oraclePubKey), //Não Funciona fora da WOC
                RabinVerifier.verifySig(slice(this.prevouts, 0n, 36n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
               'Oracle sig verify failed.'
            )
            */

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
    public sellOrder(CertSig: RabinSig, 
        sig: Sig, pubkey: PubKey, sell: boolean, price: bigint, toBuyer: PubKeyHash, utxoReserved: ByteString,
        //tx1P1: ByteString, tx1P2: ByteString, tx1P3: ByteString,
        //tx1P4: ByteString, tx1P5: ByteString
        
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
        /*  
        assert(
            //RabinVerifierWOC.verifySig(slice(msg, 0n, 29n), sig, this.oraclePubKey),

            //A assinatura faz parte do Unlocking Script
            //RabinVerifierWOC.verifySig(msg, sig, this.oraclePubKey), //Não Funciona fora da WOC
            RabinVerifier.verifySig(slice(this.prevouts, 0n, 36n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
           'Oracle sig verify failed.'
        )
        */

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

        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }


    //mesmo qualquer um podendo pagar, o comprador deve assinar para podemos 
    //  ter a preimage e o oraculo poder assinar também
    @method()
    //public buying(newOwner: PubKey, price: bigint) {    
    public buying(CertSig: RabinSig,
        sigNewOwner: Sig, newOwner: PubKey,
        //newOwner: PubKeyHash, 
        price: bigint, utxoReserved: ByteString,
        ) {        

        assert(this.sell, `Order failed, Not Selling`);
        assert(price >= this.price, `checkSig failed, Ask not Met`);

        if(this.toBuyer !== this.alice)
        {
            //assert(this.toBuyer === newOwner, `Order failed, not the preferential buyer`);
            assert(this.toBuyer === hash160(newOwner), `Order failed, not the preferential buyer`);
        }

        //assert(newOwner !== this.alice, `Current Owner Cannot Buy, Only Cancel Order`);
        assert(hash160(newOwner) !== this.alice, `Current Owner Cannot Buy, Only Cancel Order`);


        //assert(hash160(pubkey) == this.alice, "Bad public key")
        
        assert(this.checkSig(sigNewOwner, newOwner), `checkSig failed, pubkey: ${hash160(newOwner)}`);




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
        /*  
        assert(
            //RabinVerifierWOC.verifySig(slice(msg, 0n, 29n), sig, this.oraclePubKey),

            //A assinatura faz parte do Unlocking Script
            //RabinVerifierWOC.verifySig(msg, sig, this.oraclePubKey), //Não Funciona fora da WOC
            RabinVerifier.verifySig(slice(this.prevouts, 0n, 36n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
           'Oracle sig verify failed.'
        )
        */

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////

        // build the transation outputs
        let outputs = toByteString('');
    
        if(this.sell)
        {
            let lastAlice = this.alice
            this.alice = hash160(newOwner)
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

    //Esta operação de split é critica para manter a quantidade de tokens de genesis incorruptível
    //Se os outputs vierem de fora, o contrato perde o controle do numero de tokens
    //Se tivermos mais de 2 outputs, o script do contrato cresce de forma forma ineficiente
    //O split generico mais eficiente tem somente 2 outputs de contrato
    @method()
    public split(CertSig: RabinSig,
        sig: Sig, pubkey: PubKey, numberOfSendTokens: bigint, toNewOwner: PubKeyHash, utxoReserved: ByteString,
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
        /*  
        assert(
            //RabinVerifierWOC.verifySig(slice(msg, 0n, 29n), sig, this.oraclePubKey),

            //A assinatura faz parte do Unlocking Script
            //RabinVerifierWOC.verifySig(msg, sig, this.oraclePubKey), //Não Funciona fora da WOC
            RabinVerifier.verifySig(slice(this.prevouts, 0n, 36n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
           'Oracle sig verify failed.'
        )
        */

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
            /*
            //O branch será comum para os dois outputs
            //https://docs.scrypt.io/how-to-write-a-contract/built-ins/#bytestring-operations

            let branch00 = this.branch  +  toByteString('01') // para o primeiro output 00
            //+ toByteString(int2ByteString(len(this.branch), 1n))
            + int2ByteString(len(int2ByteString(this.nTxThisBranch)), 1n) 
            + int2ByteString(this.nTxThisBranch);

            this.branch = this.branch +  toByteString('02') // para o segundo output 01
            //+ toByteString(int2ByteString(len(this.branch), 1n))
            + int2ByteString(len(int2ByteString(this.nTxThisBranch)), 1n) 
            + int2ByteString(this.nTxThisBranch);

            this.nTxThisBranch = 0n; //split () será igual para os dois branches

            */
         
            //Segurança e Eficiência do Metodo Split
            //
            //A segurança e eficiencia do Split depende do contrato ter o controle da quantidade de tokens que estão sendo
            // divididas.
            //Se a quantidade de divisões aumentar, o contrato deverá comportar esta informação on chain, aumentando assim
            // o tamanho do script do contrato.
            //Se os scripts foram enviadod de fora do contrato, este perde o controle on chain do número de tokens;
            //Manter apenas 2 branches de split, diminui a eficiência, mas mantem a eficiencia. O menor split possível
            // de 2 ramos, permite termos também o menor script possível on chain;
            //Novos splits podem ser executados em Transações consecutivas;
         
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
    //public mergeTokens(sig: Sig, pubkey: PubKey, Supply1: bigint, Supply2: bigint, utxoReserved: ByteString) {    
    //public mergeTokens(sig: Sig, pubkey: PubKey, Supply1: bigint, Supply2: bigint, nTxThisBranch2: bigint, utxoReserved: ByteString) {        

    //nTxThisBranch2 - indica a quantidade de iterações do braço que será absorvido
    //nMinus1Merge - quantidade de elementos, menos 1, que serão integrados
    //Supply1 = this supply
    //Supply2 = soma de todos os supplys dos UTXOs que serão desfeitos
    //nMinus1Merge = numero de UTXOs que serao desfeitos
    public mergeTokens(CertSig: RabinSig,
        sig: Sig, pubkey: PubKey, 
        
        //////////////////////////////////////////////////////////////////
        //Jesus is the Lord!!!
        // A apresentação dos dados abaixo são obrigatórias
        // Se um deles for fake, ainda assim o contrato executa
        // A transação original deverá ser consultada para derterminar se não houve fraude
        // O contrato não consegue se auto-gerir em uma operação de merge
        // A apresentação das transações originais seriam necessárias para checar o txid
        // e a existencia do supply
        // Para verificar UTXO
        // ter as duas transações TX1 e TX2 => part1 + UTXO + part3
        // construir um state output e tirar o hash e comparar com HASH do UTXO
        // hash do UTXO1 e hash de UTXO2 devem ser passiveis de serem reconstruidos no contrato;
        // Os TXIDs das transações 1 e 2 devem ser encontrados em this.prevouts
        //
        // Solução: 
        //      informar part1(1) + part3(1) e part1(2) + part3(2)
        //      produzir com buildStateOutput UTXO(1) e UTXO(2)
        //      concatenar e recriar TX1 = part1(1) + UTXO(1) + part3(1) e TX2 = part1(2) + UTXO(2) + part3(2)
        //      criar TXID1 e TXID2
        //      encontrar TXID1 e TXID2 em this.prevouts
        //      se part1(1) === part1(2) e part3(1) === part3(2) -> ou
        //      se TXID1 === TXID2 em this.prevouts
        //          TX1 = TX2 = part1(1) + UTXO(1) + UTXO(2) + part3(1)
        //          criar TXID1 = TXID2
        //          encontrar TXID1 = TXID2 em this.prevouts      
        //////////////////////////////////////////////////////////////////
        Supply1: bigint, Supply2: bigint, 

//        nTxThisBranch1: bigint, nTxThisBranch2: bigint, 

//        branch1: ByteString, branch2: ByteString, 

        //////////////////////////////////////////////////////////////////
        
        //nMinus1Merge: bigint, 
        utxoReserved: ByteString,

//        tx1P1: ByteString, tx1P2: ByteString, tx1P3: ByteString,
//        tx1P4: ByteString, tx1P5: ByteString
    ) {        
    
    //public mergeTokens(sig: Sig, Supply1: bigint, Supply2: bigint) {    


        /*
        assert( 
            (Supply1 == this.thisSupply && nTxThisBranch1 == this.nTxThisBranch && branch1 == this.branch) 
            || 
            (Supply2 == this.thisSupply && nTxThisBranch2 == this.nTxThisBranch && branch2 == this.branch)
            , `supply dont match`);
        //assert( Supply1 == this.thisSupply || Supply2 == this.thisSupply, `supply dont match`);
        //assert( nTxThisBranch1 == this.nTxThisBranch || nTxThisBranch2 == this.nTxThisBranch, `supply dont match`);
        //assert( branch1 == this.branch || branch2 == this.branch, `supply dont match`);

        
        */


        //Without B2G issue, we don´t need to care about this verification
        //  Apenas tokens com as mesmas caracteristicas serão unidos;
        //  estes devem vir do mesmo genesis, somente o Supply pode ser Diferente; 
        //assert((Supply1 + Supply2) <= this.totalSupply, `to many tokens`);


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
        /*  
        assert(
            //RabinVerifierWOC.verifySig(slice(msg, 0n, 29n), sig, this.oraclePubKey),

            //A assinatura faz parte do Unlocking Script
            //RabinVerifierWOC.verifySig(msg, sig, this.oraclePubKey), //Não Funciona fora da WOC

            //RabinVerifier.verifySig(slice(this.prevouts, 0n, 36n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
            RabinVerifier.verifySig(slice(this.prevouts, 0n, 72n), CertSig, this.oraclePubKey), //Não Funciona fora da WOC
           'Oracle sig verify failed.'
        )
        */

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////


        //this.ctx.hashPrevouts //verificar
        //this.prevouts //verificar mandar imprimir

        // build the transation outputs
        let outputs = toByteString('');
        this.thisSupply = Supply1 + Supply2
     

        /*
        if(len(branch1) < len(branch2))
        {
            this.branch = branch1
            this.nTxThisBranch = nTxThisBranch1 //o primeiro a ser registrado será sempre o do menor;
        }
        else
        {
            this.branch = branch2
            this.nTxThisBranch = nTxThisBranch2 //o primeiro a ser registrado será sempre o do menor;
            nTxThisBranch2 = nTxThisBranch1
        }

        //https://docs.scrypt.io/how-to-write-a-contract/built-ins/#bytestring-operations
        this.branch = this.branch +  toByteString('03') 
            //+ toByteString(int2ByteString(len(this.branch), 1n))
            + int2ByteString(len(int2ByteString(this.nTxThisBranch)), 1n) //o primeiro a ser registrado será sempre o do menor;
            + int2ByteString(this.nTxThisBranch) // o mais longo permanece
            + int2ByteString(len(int2ByteString(nTxThisBranch2)), 1n) 
            + int2ByteString(nTxThisBranch2);

        this.nTxThisBranch = 0n; //split ()

        */

        outputs = this.buildStateOutput(this.ctx.utxo.value);
        //outputs += Utils.buildPublicKeyHashOutput(hash160(this.alice), this.ctx.utxo.value);
        //outputs += Utils.buildPublicKeyHashOutput(this.alice, (nMinus1Merge * this.ctx.utxo.value));
        outputs += Utils.buildPublicKeyHashOutput(this.alice, this.ctx.utxo.value);

        //Reserved UTXO pode ser usado para implementar taxa de serviço
        if(utxoReserved !== toByteString(''))
        {
            outputs += utxoReserved;
        }

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    /*
    @method()
    prevOutVerify(Supply1: bigint, Supply2: bigint, 
        nTxThisBranch1: bigint, nTxThisBranch2: bigint, 
        branch1: ByteString, branch2: ByteString,
        tx1P1: ByteString, tx1P3: ByteString,
        tx2P1: ByteString, tx2P3: ByteString,
        
        ): ByteString {

        //BackUp do estado atual do token    
        let Supply0 = this.thisSupply
        let nTxThisBranch0 = this.nTxThisBranch
        let branch0 = this.branch

        //Setup do Estado Anterior    
        this.thisSupply = Supply1
        this.nTxThisBranch = nTxThisBranch1
        this.branch = branch1

        let UTXO1 = this.buildStateOutput(this.ctx.utxo.value);

        //Restornando o estado atual do token
        this.thisSupply = Supply1
        this.nTxThisBranch = nTxThisBranch1
        this.branch = branch1

        let tx1 = tx1P1 + UTXO1 + tx1P3
        
        let txid1 = hash256(tx1)

        //this.count++
        return toByteString('')
    }
    */

    /*
    @method()
    //Poderia também verificar se a transação genesis é válida.
    //Mas esta pode ser exclusivamente uma verificação externa;
    //De qualqer forma a tx anterior já será verificada antes deste procedimento
    genesisTXverify(): void {
        //this.count++
        //return toByteString('')
        if(this.genesisTX === toByteString(''))
        {
            //this.genesisTX = slice(this.prevouts, 0n, 32n)
            //this.genesisTX = slice(this.prevUtxo, 0n, 32n)
            this.genesisTX = reverseByteString(slice(this.prevouts, 0n, 32n), 32n)

        }
    }

    */
   /*
    @method()
    //Poderia também verificar se a transação genesis é válida.
    //Mas esta pode ser exclusivamente uma verificação externa;
    //De qualqer forma a tx anterior já será verificada antes deste procedimento
    stxoScript(): ByteString {

        return slice(this.buildStateOutput(this.ctx.utxo.value), 8n)
    }
    */
}
