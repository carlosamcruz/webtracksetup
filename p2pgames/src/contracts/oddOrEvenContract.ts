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
    @prop() readonly scriptID: ByteString; // script identifier
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
     * @param hashOptionP1 
     * @param isOdd 
     * @param platFormAdd 
     * @param nLockTime 
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

        this.timeOutP1 = this.nLockTime + this.timeout;
        
        this.timeOutP2 = this.timeOutP1;

        //Odd or Even P2P Contract = 4f6464206f72204576656e2050325020436f6e7472616374
        this.scriptID = toByteString('4f6464206f72204576656e2050325020436f6e7472616374');

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

        //Apenas o Jogador 1 pode chamar este método;
        assert(hash160(pubkey) == this.player1Add, "Bad public key")
        assert(this.checkSig(sig, pubkey), "Bad signature")

        //1 % do contrato fica de taxa para plataforma
        let contractAmount = (this.ctx.utxo.value * 99n) / 100n;
        // build the transation outputs
        let outputs = toByteString('');

        outputs = Utils.buildPublicKeyHashOutput(this.player1Add, contractAmount);
        outputs += Utils.buildPublicKeyHashOutput(this.platFormAdd, 1n + (this.ctx.utxo.value - contractAmount));

        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
 
    /**
     * Qualquer usuário pode aceitar o desafio de durante o tempo de espera do jogador 1
     * Depois disso o desafio não pode mais ser aceito e pode ser encerrado pela plataforma
     * O valor da aposta será o mesmo valor oferecido pelo jogador 1
     * 
     * Problematica do método:
     * 
     *      O valor casado pelo jogador 2 deve vir de um UTXO controlado por quem aceitou a aposta
     *      desta forma a trasação terá necessáriamente 2 inputs, sendo o primeiro do contrato e o
     *      segunda da valor casado da aposta mais as taxas de rede. Isso inviabiliza o uso de
     *      nSequence non-final de "00000000" a "feffffff" já que outro usuário não poderá realizar
     *      update da transação devido a falta de controle sobre o segundo input.
     * 
     *      Por isso, se a plataforma se adiatar para finalizar o contrato antes do time-ou do jogador 1
     *      não existe a possibilidade de reversão da transação por update, assim é possível entre
     *      os métodos claimGame() e resultGame() onde estes não precisam de input extra para pagamentos de taxas.
     * 
     *      Por isso, não solicitamos uso de nSequence diferente de "ffffffff" neste método.
     * 
     *      Assim como a plataforma pode se adiantar, o jogador 2, com as ferramentas necessárias, pode após o time-out
     *      ainda conseguir executar o acceptGame(), indicando um nLockTime >= this.nLockTime e nLockTime <= this.timeOutP1.
     *      Isso é possível, se por qualquer motivo, depois do time-out o encerramento do contrato não tiver sido realizado
     *      pelo jogador 1 ou pela plataforma.
     *      
     *      Vale lembrar que tais interações, não padrões não serão disponibilizadas na plataforma regular. Mas podem ser 
     *      implementadas por desenvolvedores que tenham o conhecimento de como realizar tais configurações. Pois a blockchain
     *      aceita tais interações.
     * 
     * @param sig 
     * @param pubkey 
     * @param player2Add 
     * @param optionP2 
     */
    @method()    
    public acceptGame(sig: Sig, pubkey: PubKey, player2Add: PubKeyHash, optionP2: bigint) {
        
        assert(optionP2 > -1n, 'Cannot accept negative numbers' )
        //O jogo não pode ser aceito em um bloco menor que o nLockTime
        assert(this.ctx.locktime >= (this.nLockTime), "TX locktime cant be lower than base locktime")

        let outputs = toByteString('');

        //Na configuração de interação disponibilizada,se o tempo de espera do jogador 1 expirou. 
        //Então, o aceite não será mais permitido.
        //Com ferramentas especiais é possível burlar esta regra.
        if(this.ctx.locktime <= this.timeOutP1)
        {
            this.optionP2 = optionP2;
            this.player2Add = player2Add;

            this.timeOutP2 = this.ctx.locktime + this.timeout;
            
            //10 % do contrato fica de taxa para plataforma
            let contractAmount = ((2n * this.ctx.utxo.value) * 90n) / 100n;
            
            outputs = this.buildStateOutput(contractAmount);

            outputs += Utils.buildPublicKeyHashOutput(this.platFormAdd, 1n + ((2n * this.ctx.utxo.value) - contractAmount));
            //Event Alert UTXO - So that player 1 my get in his add the notification the player 2 has already accepted the game
            outputs += Utils.buildPublicKeyHashOutput(this.player1Add, 1n);

        }
        //A plataforma, também com ferramentas adequadas, além daquelas disponibilizadas neste sistema,
        //também pode adiantar o abandono do jogo. 
        //Entretanto, esta terá eventualmente deixado de ganhar 2000 % a mais com a operação, por exemplo:
        //Trocar 10 de 1000, por 200 de 2000.
        else{
            assert(hash160(pubkey) == this.platFormAdd, "Only platform can call after timeout")
            assert(this.checkSig(sig, pubkey), "Bad signature")

            //1 % do contrato fica de taxa para plataforma
            let contractAmount = (this.ctx.utxo.value * 99n) / 100n;

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
     * O contrato paga todas as taxas necessárias, por isso não precisamos usar um segundo input
     * o valor da taxa de rede é indicado como parametro no método; 
     * @param sig 
     * @param pubkey 
     * @param keygame //Chave do jogo que foi utilizada para produzir o hashOptionP1 
     * @param optionP1 //Valor numerico do jogador 1 usado para produzir o hashOptionP1
     * @param player1AddResult //Novo endereço se o jogador 1 (opticional) 
     * @param fee
     */
    @method()    
    public resultGame(keygame: ByteString, optionP1: bigint, sig: Sig, pubkey: PubKey, 
         player1AddResult: PubKeyHash, fee: bigint) 
    {    
        assert(this.optionP2 > -1n, "Cant verify result before player 2 accpetance")
        //somente o jogador 1 pode chamar este método
        assert(hash160(pubkey) == this.player1Add, "Bad public key")
        assert(this.checkSig(sig, pubkey), "Bad signature")

        let oddness: bigint = this.isOddP1? 1n: 0n;

        let outputs = toByteString('');

        if(sha256(keygame + int2ByteString(optionP1)) == this.hashOptionP1 
        && (optionP1 + this.optionP2) % 2n == oddness){
           
            outputs = Utils.buildPublicKeyHashOutput(player1AddResult, this.ctx.utxo.value - fee);        
            //Event Alert UTXO - So that player 2 may know the game has finished
            outputs += Utils.buildPublicKeyHashOutput(this.player2Add, 1n);
        }
        else{
            outputs = Utils.buildPublicKeyHashOutput(this.player2Add, this.ctx.utxo.value - fee);
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    /**
     * Se o jogador 1 não responder até o time-out do jogador 2, então o método pode ser acionado
     * 
     *      A priori, depois de que desafio é aceito, qualquer usuário pode chamar este método
     *      a qualquer momento. Entretanto, somente nSequence "00000000" é aceito pelo método. 
     *      
     *      Desta forma se o usuário se antecipar ao time-out do jogador 2 a transação não será 
     *      incluida em um bloco antes do bloco de time-out e ficará aguardando na MemPool, e pode, 
     *      desta forma, ser substituida até o bloco de time-out por uma chamada de resultGame() 
     *      feita pelo jogador 1.
     * @param fee 
     */
    @method()    
    public claimGame(fee: bigint) {    

        assert(this.ctx.hashSequence == hash256(toByteString("00000000")), "nSequence cannot be higher than 00000000");
        assert(this.optionP2 > -1n, "Only accepted game can be claimed");

        //A vitória por abandono não pode ser solicitada antes do TimeOut do jogador 2
        assert(this.ctx.locktime > this.timeOutP2, 'Game can only be claimed afther Player 2 timeout' );

        // build the transation outputs
        let outputs = toByteString('');

        outputs = Utils.buildPublicKeyHashOutput(this.player2Add, this.ctx.utxo.value - fee);
        //Event Alert UTXO - So that player 1 may the game has been claimed and is finished
        //  because he did not answered his choice during the player 2 timeout
        outputs += Utils.buildPublicKeyHashOutput(this.player1Add, 1n);

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
}
