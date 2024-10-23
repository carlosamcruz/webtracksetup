////////////////////////////////////////////////////////////////////////////////
// JESUS is the LORD of ALL
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
//OddOrEvenContract
////////////////////////////////////////////////////////////

import {
    method,
    prop,
    SmartContract,
    hash256,
    assert,
    ByteString,
    SigHash, PubKey, FixedArray, fill, Sig, hash160, toByteString, Utils, sha256, toHex, Addr, PubKeyHash,
    int2ByteString
} from 'scrypt-ts'

export class OddOrEvenContract extends SmartContract {
    
    //https://xiaohuiliu.medium.com/cross-chain-atomic-swaps-f13e874fcaa7
    @prop() readonly timeout: bigint // Can be a timestamp or block height.
    @prop() readonly nLockTime: bigint // Can be a timestamp or block height.
    @prop() readonly player1Add: PubKeyHash; // Player 1
    @prop() readonly platFormAdd: PubKeyHash; // Player 1
    
    @prop() readonly isOddP1: boolean // Oddness chosen by Player 1.

    @prop(true)
    player2Add: PubKeyHash; // Address Player 2

    @prop(true)
    optionP2: bigint; // Player2 number option.

    @prop(true)
    timeOutP1: bigint; // Tempo de espera para alguém aceitar o jogo

    @prop(true)
    timeOutP2: bigint; // Tempo de espera para o jogador 1 responder

    @prop() readonly hashOptionP1: ByteString; // Hash aferidor da resposta do player 1

    /**
     * A criação do contrato também marca o inicio de uma partida; 
     * @param player1Add 
     * @param hashOptionP1 // Hash aferidor da resposta do player 1
     * @param isOdd // Paridade escolhida pelo jogador 1
     * @param platFormAdd 
     */
    constructor(player1Add: PubKeyHash, hashOptionP1: ByteString, 
        isOdd: boolean, platFormAdd: PubKeyHash, nLockTime: bigint) {    
        super(...arguments);
        
        this.player1Add = player1Add;
        this.player2Add = player1Add;
        this.platFormAdd = platFormAdd;
        
        this.optionP2 = -1n;

        this.isOddP1 = isOdd;
        this.hashOptionP1 = hashOptionP1;

        this.nLockTime = nLockTime;
                          
        this.timeout = (2n); // 20 minutos

        //this.timeOutP1 = this.ctx.locktime + this.timeout;
        this.timeOutP1 = this.nLockTime + this.timeout;
        
        this.timeOutP2 = this.timeOutP1;
    }

    /**
     * O jogador 1 pode cancelar o jogo a qualquer momento, enquanto o desafio não for aceito;
     * Depois de aceito, o jogo não pode mais ser cancelado;
     * @param sig 
     * @param pubkey 
     */
    @method()    
    public quitGame(sig: Sig, pubkey: PubKey) {    

        assert(this.optionP2 == -1n, "Cant quit game after other player accpetance")

        //Para sair do jogo não precisa verificar o LockTime minimo, pode cancelar o jogo antes
        //e somente o jogador 1 pode agir antes
        //outro usuário somente pode finalizar após o timeout
        //assert(this.ctx.locktime >= (this.nLockTime), "TX locktime cant be lower than base locktime")

        console.log("this.ctx.locktime: ", this.ctx.locktime);

        //Apenas o dono do contrato pode chamar este método;
        assert(hash160(pubkey) == this.player1Add, "Bad public key")
        assert(this.checkSig(sig, pubkey), "Bad signature")

        //1 % do contrato fica de taxa para plataforma
        let contractAmount = (this.ctx.utxo.value * 99n) / 100n;
        // build the transation outputs
        let outputs = toByteString('');

        //outputs += Utils.buildPublicKeyHashOutput(hash160(this.platFormAdd), 1n + (this.ctx.utxo.value - contractAmount));
        //outputs = Utils.buildPublicKeyHashOutput(hash160(this.player1Add), contractAmount);

        outputs = Utils.buildPublicKeyHashOutput(this.player1Add, contractAmount);
        outputs += Utils.buildPublicKeyHashOutput(this.platFormAdd, 1n + (this.ctx.utxo.value - contractAmount));

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
 
    /**
     * Qualquer usuário pode aceitar o desafio de durante o tempo de espera do jogador 1
     * Depois disso o desafio não pode mais ser aceito  
     * O valor da aposta será o mesmo valor oferecido pelo jogador 1
     * @param player2Add 
     * @param optionP2 
     */
    @method()    
    public acceptGame(sig: Sig, pubkey: PubKey, player2Add: PubKeyHash, optionP2: bigint) {
        
        //(72 * 60) / 10 => 432 blocos
        //Para testes 4 blocos

        assert(optionP2 > -1n, 'Cannot accept negative numbers' )
        //O jogo não pode ser aceito em um bloco menor que o nLockTime
        assert(this.ctx.locktime >= (this.nLockTime), "TX locktime cant be lower than base locktime")

        let outputs = toByteString('');
        //Se o tempo de espera do jogador 1 expirou. Então, nãe será mais permitido o aceite
        //assert(this.ctx.locktime <= this.timeOutP1, 'Cannot play after player 1 timeout' )

        if(this.ctx.locktime <= this.timeOutP1)
        {
            this.optionP2 = optionP2;
            this.player2Add = player2Add;

            //this.timeOutSetPrice = this.ctx.locktime + 432n
            this.timeOutP2 = this.ctx.locktime + this.timeout;

            //let contractAmount = ((2n * this.ctx.utxo.value) * 90n) / 100n;
            //A metade o contrato e taxa que deve ser devolvida ao player 1, ou ir para plataforma em caso de chamada de timeout
            //let contractAmount = (this.ctx.utxo.value / 2n) + ((this.ctx.utxo.value * 90n) / 100n);
            
            //10 % do contrato fica de taxa para plataforma
            let contractAmount = ((2n * this.ctx.utxo.value) * 90n) / 100n;
            
            //outputs = this.buildStateOutput(this.ctx.utxo.value);
            outputs = this.buildStateOutput(contractAmount);

            outputs += Utils.buildPublicKeyHashOutput(this.platFormAdd, 1n + ((2n * this.ctx.utxo.value) - contractAmount));
            //Event Alert UTXO - So that player 1 my get in his add the notification the player 2 has already accepted the game
            outputs += Utils.buildPublicKeyHashOutput(this.player1Add, 1n);

        }
        else{
            assert(hash160(pubkey) == this.platFormAdd, "Only platform can call after timeout")
            assert(this.checkSig(sig, pubkey), "Bad signature")

            //1 % do contrato fica de taxa para plataforma
            let contractAmount = (this.ctx.utxo.value * 99n) / 100n;
            // build the transation outputs
            //outputs += Utils.buildPublicKeyHashOutput(hash160(this.platFormAdd), 1n + (this.ctx.utxo.value - contractAmount));
            //outputs = Utils.buildPublicKeyHashOutput(hash160(this.player1Add), contractAmount);

            outputs = Utils.buildPublicKeyHashOutput(this.player1Add, contractAmount);
            outputs += Utils.buildPublicKeyHashOutput(this.platFormAdd, 1n + (this.ctx.utxo.value - contractAmount));
        }

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
    
    /**
     * Este metodo apresenta o resultado do desfio depois que o jogador 2 aceitou o jogo
     * Apenas jogador 1 pode chamar este metodo; 
     * @param sig 
     * @param pubkey 
     * @param keygame //Chave do jogo que foi utilizada para produzir o hashOptionP1 
     * @param optionP1 //Valor numerico do jogador 1 usado para produzir o hashOptionP1
     * @param player1AddResult //Novo endereço se o jogador 1 (opticional) 
     */
    @method()    
    public resultGame(sig: Sig, pubkey: PubKey, 
        keygame: ByteString, optionP1: bigint, player1AddResult: PubKeyHash, fee: bigint) 
    {    
        assert(this.optionP2 > -1n, "Cant verify result before player 2 accpetance")
        //somente o jogador 1 pode chamar este método
        assert(hash160(pubkey) == this.player1Add, "Bad public key")
        assert(this.checkSig(sig, pubkey), "Bad signature")

        let oddness: bigint = this.isOddP1? 1n: 0n;

        let outputs = toByteString('');

        //let plaformAmount = ((2n * (this.ctx.utxo.value / 3n)) * 10n) / 100n;
        //let player1Refund = this.ctx.utxo.value / 3n;

        if(sha256(keygame + int2ByteString(optionP1)) == this.hashOptionP1 
        && (optionP1 + this.optionP2) % 2n == oddness){
           
            outputs = Utils.buildPublicKeyHashOutput(player1AddResult, this.ctx.utxo.value - fee);        
            //outputs += Utils.buildPublicKeyHashOutput(this.platFormAdd, 1n + plaformAmount);
            //Event Alert UTXO - So that player 2 may know the game has finished
            outputs += Utils.buildPublicKeyHashOutput(this.player2Add, 1n);
        }
        else{
            outputs = Utils.buildPublicKeyHashOutput(this.player2Add, this.ctx.utxo.value - fee);
            //outputs += Utils.buildPublicKeyHashOutput(this.platFormAdd, 1n + plaformAmount);
            //Event Alert UTXO - So that player 2 may know the game has finished
            //outputs += Utils.buildPublicKeyHashOutput(player1AddResult, player1Refund);
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    /**
     * A plataforma deve esperar até o timeout do jogador 2
     * Se o jogador 1 não responder então pode acionar o claimGame
     */
    @method()    
    public claimGame(fee: bigint) {    

        assert(this.ctx.hashSequence == hash256(toByteString("00000000")), "nSequence cannot be higher than 00000000");
        assert(this.optionP2 > -1n, "Only accepted game can be claimed");

        //A vitória por abandono não pode ser solicitada antes do TimeOut do jogador 2
        //assert(this.ctx.locktime >= ((this.timeOutP2 - this.timeout) + 1n), "TX locktime cant be lower tha previous TX locktime")
        assert(this.ctx.locktime > this.timeOutP2, 'Game can only be claimed afther Player 2 timeout' );

        // build the transation outputs
        let outputs = toByteString('');

        //let plaformAmount = this.ctx.utxo.value / 3n;

        outputs = Utils.buildPublicKeyHashOutput(this.player2Add, this.ctx.utxo.value - fee);
        //outputs += Utils.buildPublicKeyHashOutput(this.platFormAdd, plaformAmount);

        //Event Alert UTXO - So that player 1 may the game has been claimed and is finished
        //  because he did not answered his choice during the player 2 timeout
        outputs += Utils.buildPublicKeyHashOutput(this.player1Add, 1n);

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
}
