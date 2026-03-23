import React, { useRef, FC, useState} from 'react';

import logo from './logo.svg';
import './App.css';

import { DefaultProvider, MethodCallOptions, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, hash160, buildPublicKeyHashScript, findSig, SignatureResponse, PubKeyHash, reverseByteString, int2ByteString, ContractTransaction, SmartContract, hash256 } from "scrypt-ts";

import { GeneralTokenV3EcdsaOracleMin } from "./contracts/generaltokenV3ecdsaOracleMin";

import {homepvtKey, homenetwork, compState, feeService, utxoFeeAdd1} from './Home';
import { broadcast, listUnspent, getTransaction, getSpentOutput, oracleWoC} from './mProviders';
import { dataFormatScryptSC, convertBinaryToHexString, stringToHex, sleep, scriptUxtoSize, hexToLittleEndian } from "./myUtils";
import { RabinSig } from 'scrypt-ts-lib/dist/rabinSignature';
import { SECP256K1 } from 'scrypt-ts-lib';

//const provider = new DefaultProvider({network: bsv.Networks.testnet});
const provider = new DefaultProvider({network: homenetwork});
let Alice: TestWallet
let signerExt: TestWallet

let txlink2 = ""
//const privateKey = bsv.PrivateKey.fromHex("79342a4c317817a80a298fe116147a74e4e90912a4f321e588a4db67204e29b0", bsv.Networks.testnet)  
//let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork) 

function PageSC14GPTokenMelt() {
//const  deployACT: FC = () => {  

  const [deployedtxid, setdeptxid] = useState("");
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [txid2, setTxid] = useState("");
  const txid = useRef<any>(null);
  const txidPrvStt = useRef<any>(null);
  const tokenIndex = useRef<any>(null);

  const interact = async (amount: any) => {
    setdeptxid("Wait!!!")

    if(txid.current.value.length === 64 || txidPrvStt.current.value.length === 64)
    {

      //Para evitar o problema:  Should connect to a livenet provider
      //Bypassar o provider externo e const
      let provider = new DefaultProvider({network: homenetwork});

      let posNew1 = 0 // Output Index of the Contract in the Current State TX

      if(tokenIndex.current.value === '1' )
      {
        posNew1 = 1
      }

      ////////////////////////////////////////////////
      //
      //  Configuração da Parte 2 da Chave Publica do Oraculo
      //    Revisar para o estado anterior
      ////////////////////////////////////////////////

      let keyDerivation = reverseByteString(txid.current.value, 32n) + int2ByteString(BigInt(posNew1), 4n) 
      let pvtkeyPart2 = BigInt('0x' + sha256(keyDerivation))//bsv.crypto.BN.fromString(sha256(signatures[0]))       
      let pvtkeyTotal = ((pvtkeyPart2) % SECP256K1.n).toString(16)
        
      while(pvtkeyTotal.length < 64)
      {
        pvtkeyTotal = '0' + pvtkeyTotal
      }
        
      let privateKeyP2 = bsv.PrivateKey.fromHex(pvtkeyTotal, homenetwork); 
      privateKeyP2.compAdd(false);
      privateKeyP2 = bsv.PrivateKey.fromHex(pvtkeyTotal, homenetwork);
              
      let pubKeyP2 = bsv.PublicKey.fromPrivateKey(privateKeyP2) // Parte 2 da Chave Publica do Oraculo
      
      ////////////////////////////////////////////////
      ////////////////////////////////////////////////

      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork) 
      privateKey.compAdd(compState);

      privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork)

      Alice = new TestWallet(privateKey, provider)
  
      try {
  
        const signer = Alice
        //const balance = 1000
    
        //Linha necessária nesta versão
        //O signee deve ser connectado
        await signer.connect(provider)
        
        //const message = toByteString('hello world', true)
        let tx = new bsv.Transaction

        //////////////////////////////////////////////////////
        //Jesus is the Lord
        //////////////////////////////////////////////////////
          
        if(txid.current.value.length === 64)
        {
            tx = await provider.getTransaction(txid.current.value)
        }
        else if(txidPrvStt.current.value.length === 64)
        {
            let currentStateTXID = txidPrvStt.current.value
            let stxos = await getSpentOutput(currentStateTXID, 0, homenetwork)
      
            while(stxos[0].inputIndex !== -1)
            {
              currentStateTXID = stxos[0].txId;
      
              await sleep(500);
      
              stxos = await getSpentOutput(currentStateTXID, 0, homenetwork)
              //console.log("TX Output ", i, " spent on:", stxos[0].txId)
              console.log("Input:", stxos[0].inputIndex)
            }
      
            tx = await provider.getTransaction(currentStateTXID)    
        }
    
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
  
        console.log('Current State TXID: ', tx.id)
  
        let finish = true
        let newData = '';

        let instance2 = GeneralTokenV3EcdsaOracleMin.fromTx(tx, posNew1)
        //Inform to the system the right output index of the contract and its sequence
        tx.pvTxIdx(tx.id, posNew1, sha256(tx.outputs[posNew1].script.toHex()))
    
        let pbkey = bsv.PublicKey.fromPrivateKey(privateKey)

        const balance = instance2.balance
        const nextInstance = instance2.next()
    
        ////////////////////////////////////////////////////////
        //Para o calculo da Taxa de Serviço
        ////////////////////////////////////////////////////////
        let utxoFeeFlag = false;

        //if(feeService > 0)
        //  utxoFeeFlag = true

        let utxoFee =  new bsv.Transaction().addOutput(new bsv.Transaction.Output({
          //script: buildPublicKeyHashScript(hash160(instance2.alice)),
          //script: buildPublicKeyHashScript(instance2.alice),
          script: buildPublicKeyHashScript(PubKeyHash(toHex(bsv.Address.fromString(utxoFeeAdd1).hashBuffer))),
          satoshis: feeService
        }))

        //Tamanho do script formatado
        let out1size = scriptUxtoSize(utxoFee.outputs[0].script.toHex()) 
        let tokenSats = (utxoFee.outputs[0].satoshis).toString(16);
        //console.log("Sat STR 0: ", tokenSats)
        while(tokenSats.length < 16)
        {
          tokenSats = '0' + tokenSats
        }

        //console.log("Token Sat: ", hexToLittleEndian(tokenSats))

        let utxo2Fee = hexToLittleEndian(tokenSats) + out1size + utxoFee.outputs[0].script.toHex()

        if(!utxoFeeFlag)
        {
          utxo2Fee = '';
        }

        //console.log("UTXO Fee: ", utxo2Fee)
        
        ////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////

        await instance2.connect(signer)   

        instance2.bindTxBuilder(
          'setupToken',         
          (
            current: GeneralTokenV3EcdsaOracleMin,
            options: MethodCallOptions<GeneralTokenV3EcdsaOracleMin>,
            ...args: any
          ): Promise<ContractTransaction> => 
        {
          const changeAddress = bsv.Address.fromPrivateKey(privateKey)
    
          const unsignedTx: bsv.Transaction = new bsv.Transaction()
          .addInputFromPrevTx(tx, posNew1)
  
          if (finish) 
          {         
            unsignedTx.addOutput(new bsv.Transaction.Output({
              //script: buildPublicKeyHashScript(hash160(instance2.alice)),
              script: buildPublicKeyHashScript(instance2.alice),
              satoshis: balance
            }))
            .change(changeAddress)

            /*
            if(utxoFeeFlag)
            {
              unsignedTx.addOutput(new bsv.Transaction.Output({
                //script: buildPublicKeyHashScript(hash160(instance2.alice)),
                script: buildPublicKeyHashScript(instance2.alice),
                satoshis: balance
              }))
  
              unsignedTx.addOutput(utxoFee.outputs[0])
  
              .change(changeAddress)
            }
            else
            {
              unsignedTx.addOutput(new bsv.Transaction.Output({
                //script: buildPublicKeyHashScript(hash160(instance2.alice)),
                script: buildPublicKeyHashScript(instance2.alice),
                satoshis: balance
              }))
              .change(changeAddress)
            }
            */
  
          }
          else
          {
            /////////////////////////////////////////////////////////
            //Jesus is the Lord!!!
            //
            // solução para quebrar UTXO replicado
            /////////////////////////////////////////////////////////
            if(instance2.genesisTX === '')
            {
              nextInstance.genesisTX = tx.id + instance2.tokenType
            }
  
            console.log('nextInstance.genesisTX: ', nextInstance.genesisTX)
            //console.log('nextInstance.prevUtxo: ', nextInstance.prevUtxo)
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////

            unsignedTx.addOutput(new bsv.Transaction.Output({
              script: nextInstance.lockingScript,
              satoshis: balance,
            }))
            .change(changeAddress)            
  

            /*
            if(utxoFeeFlag)
            {
              unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: nextInstance.lockingScript,
                  satoshis: balance,
              }))
  
              unsignedTx.addOutput(utxoFee.outputs[0])
              .change(changeAddress)
            }
            else
            {
              unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: nextInstance.lockingScript,
                  satoshis: balance,
              }))
              .change(changeAddress)
            }
            */
          }            
  
          //console.log('Unsig TX Out: ', toHex(unsignedTx.outputs[0].script))
          return Promise.resolve({
              tx: unsignedTx,
              atInputIndex: 0,
              nexts: [
              ]
          });              
        });


        console.log("Alice PKHASH: ", instance2.alice)
        console.log("Alice PK: ", toHex(pbkey))
  
        let txid01 = tx.id
        let index01 = posNew1
        let networkOc = 'test'
  
        if(homenetwork !== bsv.Networks.testnet)
        {
          networkOc = 'main'
        }
  
        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////      
  
        //Dummy Sig for FEE Calculations
        //let sigOracle = toByteString('3047022300000026ecfbba3be4b8727e5eb7cfda955907bfe9788c5453847da76d84d6b41d50ae022071a713ba84465a30aaa51b2e0f2880b9f38d46e158fd6ef472f0c33fd57275e741')

        //Para finalizar o contrato, não precisa da assinatura do oraculo
        let sigOracle = toByteString('00')
   
        //Para finalizar o contrato, não precisa da assinatura do oraculo
        const partialTx = await instance2.methods.setupToken(//rSig, 
          sigOracle, //PubKey(toHex('00')),
          (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
          finish,
          newData, //utxo2Fee,      
          { multiContractCall: true, } as MethodCallOptions<GeneralTokenV3EcdsaOracleMin>
        )

        //Para finalizar o contrato, não precisa da assinatura do oraculo
        /*
        const { tx: callTx, nexts } = await SmartContract.multiContractCall(
          partialTx,//partialTx2,
          signer,
        )    
        */
        SmartContract.dummyFlagOff() //Erros nos tests mostraram necessário

        ////////////////////////////////////////
        //Jesus is the Lord
        //Versão para Oraculo ECDSA
        ////////////////////////////////////////
        const txRsult = await SmartContract.multiContractCallV2(  
          partialTx,
          signer,
        )    
        //SmartContract.dummyFlagOff()
        let callTx = new bsv.Transaction(txRsult)
  
  
  
        console.log( 'TXID: ', callTx.id)
  
        //alert('unlock: ' + callTx.id)
               
        if(homenetwork === bsv.Networks.mainnet )
        {
          txlink2 = "https://whatsonchain.com/tx/" + callTx.id;
        }
        else if (homenetwork === bsv.Networks.testnet )
        {
          txlink2 = "https://test.whatsonchain.com/tx/" + callTx.id;
        }
        setLinkUrl(txlink2);
  
        setdeptxid(callTx.id)
    
      } catch (e) {

        console.error('Finish fails', e)
        alert('Finish fails')
        setdeptxid("")
      }
    }
    else
    {
      alert('Wrong TXID Format!!!')
      setdeptxid("Try Again!!!")
    }
  };

  return (
    <div className="App">
        <header className="App-header">

        <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>   
          GPToken ECDSA-Soft Oracle - Extinguish
          
        </h2>

       
        <div>

          <div style={{ textAlign: 'center' , paddingBottom: '20px' }}>
                
                <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                  >Inform Current or Previous State TXID:  
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={txid} type="hex" name="PVTKEY1" min="1" placeholder="current state" />
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={txidPrvStt} type="hex" name="PVTKEY1" min="1" placeholder="pevious state (optional)" />
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={tokenIndex} type="number" name="PVTKEY1" min="1" placeholder="0 or 1 (0 default)" />
                </label>     
          </div>


          <div style={{ textAlign: 'center' }}>     
                <button className="insert" onClick={interact}
                    style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
                >Extinguish</button>
          </div>

        </div>


        {
          deployedtxid.length === 64?
          
         /* <button onClick={handleCopyClick}>Copy to ClipBoard</button> */

          <div>
          <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '20px' }}>
            <p className="responsive-label" style={{ fontSize: '12px' }}>TXID: {deployedtxid} </p>
          </div>
          <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
            <p className="responsive-label" style={{ fontSize: '12px' }}>TX link: {' '} 
                <a href={linkUrl} target="_blank" style={{ fontSize: '12px', color: 'cyan'}}>
                {linkUrl}</a></p>
          </div>
        </div>
          
          
          :

          <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '20px' }}>
          <p className="responsive-label" style={{ fontSize: '12px' }}>{deployedtxid} </p>
        </div>
          
        }                  

      </header>
    </div>
  );
}

export default PageSC14GPTokenMelt;
