import React, { useRef, FC, useState} from 'react';

import logo from './logo.svg';
import './App.css';

import { DefaultProvider, MethodCallOptions, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, hash160, buildPublicKeyHashScript, findSig, SignatureResponse, ContractTransaction, SmartContract, PubKeyHash, reverseByteString, int2ByteString, hash256 } from "scrypt-ts";

//import { Statefulsc } from "./contracts/stateful";
//import { GeneralToken } from "./contracts/generaltoken";
import { GeneralTokenV3EcdsaOracleMin } from "./contracts/generaltokenV3ecdsaOracleMin";

import {homepvtKey, homenetwork, compState, feeService, utxoFeeAdd1} from './Home';
import { broadcast, listUnspent, getTransaction, getSpentOutput, oracleWoC} from './mProviders';
import { dataFormatScryptSC, convertBinaryToHexString, stringToHex, sleep, scriptUxtoSize, hexToLittleEndian } from "./myUtils";
import { SECP256K1 } from 'scrypt-ts-lib';

//const provider = new DefaultProvider({network: bsv.Networks.testnet});
const provider = new DefaultProvider({network: homenetwork});
let Alice: TestWallet
let signerExt: TestWallet

let txlink2 = ""
//const privateKey = bsv.PrivateKey.fromHex("79342a4c317817a80a298fe116147a74e4e90912a4f321e588a4db67204e29b0", bsv.Networks.testnet)  
//let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork) 

function PageSC10GPTokenMerge() {
//const  deployACT: FC = () => {  

  const [deployedtxid, setdeptxid] = useState("");
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  //const [txid2, setTxid] = useState("");
  const txid = useRef<any>(null);
  const txid2 = useRef<any>(null);
  const tokenIndex = useRef<any>(null);
  const tokenIndex2 = useRef<any>(null);
  const receiverPBK = useRef<any>(null);



  /*
  const sleep = async (miliSeconds: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({})
            console.log("Waited for: ", miliSeconds, " ms")
        }, miliSeconds)
    })
  }
  */

  const interact = async (amount: any) => {
    setdeptxid("Wait!!!")

    if((txid.current.value.length === 64 && txid2.current.value.length === 64) 
      )
    {


      let posNew1 = 0 // Output Index of the Contract in the Current State TX
      let posNew2 = 0 // Output Index of the Contract in the Current State TX


      if(tokenIndex.current.value === '1')
      {
        posNew1 = 1
      }

      if(tokenIndex2.current.value === '1')
      {
        posNew2 = 1
      }

      ////////////////////////////////////////////////
      //
      //  Configuração da Parte 2 da Chave Publica do Oraculo
      //    Revisar para o estado anterior
      ////////////////////////////////////////////////

      let keyDerivation = reverseByteString(txid.current.value, 32n) + int2ByteString(BigInt(posNew1), 4n)
      let keyDerivation2 = reverseByteString(txid2.current.value, 32n) + int2ByteString(BigInt(posNew2), 4n) 

      
      let pvtkeyPart2 = BigInt('0x' + sha256(keyDerivation))//bsv.crypto.BN.fromString(sha256(signatures[0]))       
      let pvtkeyPart2b = BigInt('0x' + sha256(keyDerivation2))//bsv.crypto.BN.fromString(sha256(signatures[0]))       


      let pvtkeyTotal = ((pvtkeyPart2) % SECP256K1.n).toString(16)
      let pvtkeyTotalb = ((pvtkeyPart2b) % SECP256K1.n).toString(16)

        
      while(pvtkeyTotal.length < 64)
      {
        pvtkeyTotal = '0' + pvtkeyTotal
      }

      while(pvtkeyTotalb.length < 64)
      {
        pvtkeyTotalb = '0' + pvtkeyTotalb
      }
        
      let privateKeyP2 = bsv.PrivateKey.fromHex(pvtkeyTotal, homenetwork); 
      privateKeyP2.compAdd(false);
      privateKeyP2 = bsv.PrivateKey.fromHex(pvtkeyTotal, homenetwork);

      let privateKeyP2b = bsv.PrivateKey.fromHex(pvtkeyTotalb, homenetwork); 
      privateKeyP2b.compAdd(false);
      privateKeyP2b = bsv.PrivateKey.fromHex(pvtkeyTotalb, homenetwork);

              
      let pubKeyP2 = bsv.PublicKey.fromPrivateKey(privateKeyP2) // Parte 2 da Chave Publica do Oraculo
      let pubKeyP2b = bsv.PublicKey.fromPrivateKey(privateKeyP2b) // Parte 2 da Chave Publica do Oraculo

      
      ////////////////////////////////////////////////
      ////////////////////////////////////////////////

      //Para evitar o problema:  Should connect to a livenet provider
      //Bypassar o provider externo e const
      let provider = new DefaultProvider({network: homenetwork});

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
        let tx2 = new bsv.Transaction

        //////////////////////////////////////////////////////
        //Jesus is the Lord
        //////////////////////////////////////////////////////

        tx = await provider.getTransaction(txid.current.value)
        tx2 = await provider.getTransaction(txid2.current.value)
    
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
  
    
        console.log('Current State TXID: ', tx.id)
  
        //const instance = Helloworld02.fromTx(tx, 0)

        let finish = false
        let newData = '';

        /*
        let posNew1 = 0 // Output Index of the Contract in the Current State TX
        let posNew2 = 0 // Output Index of the Contract in the Current State TX


        if(tokenIndex.current.value === '1')
        {
          posNew1 = 1
        }

        if(tokenIndex2.current.value === '1')
        {
          posNew2 = 1
        }
        */

        let instance2 = GeneralTokenV3EcdsaOracleMin.fromTx(tx, posNew1)
        //Inform to the system the right output index of the contract and its sequence
        tx.pvTxIdx(tx.id, posNew1, sha256(tx.outputs[posNew1].script.toHex()))


        let instance3 = GeneralTokenV3EcdsaOracleMin.fromTx(tx2, posNew2)
        //Inform to the system the right output index of the contract and its sequence
        tx.pvTxIdx(tx2.id, posNew2, sha256(tx2.outputs[posNew2].script.toHex()))
    


        let pbkey = bsv.PublicKey.fromPrivateKey(privateKey)

        let pvtkey = privateKey;
        


        //https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#method-with-signatures

        const balance = instance2.balance
        const nextInstance = instance2.next()

        ////////////////////////////////////////////////////////
        //Para o calculo da Taxa de Serviço
        ////////////////////////////////////////////////////////
        let utxoFeeFlag = false;

        if(feeService > 0)
          utxoFeeFlag = true

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

        await instance3.connect(signer)
        const nextInstance3 = instance3.next()
    
        //Theory: https://docs.scrypt.io/advanced/how-to-call-multiple-contracts/

        instance2.bindTxBuilder(
          'mergeTokens',
          (
              current: GeneralTokenV3EcdsaOracleMin,
              options: MethodCallOptions<GeneralTokenV3EcdsaOracleMin>,
              ...args: any
          ): Promise<ContractTransaction> => {
              // create the next instance from the current
  
              const unsignedTx: bsv.Transaction = new bsv.Transaction()
              .addInputFromPrevTx(tx, posNew1)


              //adicionar o numero de txs da instancia 3
  
              nextInstance.thisSupply = nextInstance.thisSupply + nextInstance3.thisSupply 
  
              unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: nextInstance.lockingScript,
                  satoshis: balance, //balance é igual para as duas instancias
              }))
          
              return Promise.resolve({
                  tx: unsignedTx,
                  atInputIndex: 0,
                  nexts: [
                  ]
              })       
          }
        )

        instance3.bindTxBuilder(
          'mergeTokens',
          (
              current: GeneralTokenV3EcdsaOracleMin,
              options: MethodCallOptions<GeneralTokenV3EcdsaOracleMin>,
              ...args: any
          ): Promise<ContractTransaction> => {
              if (options.partialContractTx) {
  
                  const changeAddress = bsv.Address.fromPrivateKey(pvtkey)
         
                  const unsignedTx = options.partialContractTx.tx
  
                  unsignedTx.addInputFromPrevTx(tx2, posNew2)

                  unsignedTx.addOutput(new bsv.Transaction.Output({
                    //script: buildPublicKeyHashScript(hash160(instance2.alice)),
                    script: buildPublicKeyHashScript(instance2.alice),
                    satoshis: balance //balance é igual para as duas instancias
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
                      satoshis: balance //balance é igual para as duas instancias
                    }))
                    .change(changeAddress)
                  }
                  */
        
           
                  return Promise.resolve({
                      tx: unsignedTx,
                      atInputIndex: 1,
                      nexts: [
                      ]
                  })   
              }
  
              throw new Error('no partialContractTx found')
          }
        )
    

        /////////////////////////////////////////////////////////////////
        // Jesus is the Lord
        //  Oracle
        /////////////////////////////////////////////////////////////////

        let txid01 = txid.current.value
        // 2 TXIDs e Duas PubKeys, e Dois acessos ao Oraculo
        let index01 = posNew1
        let txid02 = txid2.current.value
        let index02 = posNew2
        let networkOc = 'test'
  
        if(homenetwork !== bsv.Networks.testnet)
        {
          networkOc = 'main'
        }
  

        //Dummy Sig for FEE Calculations
        let sigOracle = toByteString('3047022300000026ecfbba3be4b8727e5eb7cfda955907bfe9788c5453847da76d84d6b41d50ae022071a713ba84465a30aaa51b2e0f2880b9f38d46e158fd6ef472f0c33fd57275e741')
        let sigOracle2 = toByteString('3047022300000026ecfbba3be4b8727e5eb7cfda955907bfe9788c5453847da76d84d6b41d50ae022071a713ba84465a30aaa51b2e0f2880b9f38d46e158fd6ef472f0c33fd57275e741')

        console.log('Pub Key: ', toHex(pbkey))
        console.log('Pub Key Oracle P2: ', toHex(pubKeyP2))
        console.log('Pub Key Oracle P2b: ', toHex(pubKeyP2b))


        console.log('Number of Units in Tokens 2', instance2.thisSupply)
        console.log('Number of Units in Tokens 1', instance3.thisSupply)

        const partialTx = await instance2.methods.mergeTokens(
          sigOracle, //PubKey(toHex(pubKeyP2)),
          (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
          instance2.thisSupply,
          instance3.thisSupply, //utxo2Fee,
          { multiContractCall: true, } as MethodCallOptions<GeneralTokenV3EcdsaOracleMin>
        )
    
        const finalTx = await instance3.methods.mergeTokens(
            sigOracle2, //PubKey(toHex(pubKeyP2b)),
            (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
            instance2.thisSupply,
            instance3.thisSupply, //utxo2Fee,
            {
                multiContractCall: true,
                partialContractTx: partialTx,
            } as MethodCallOptions<GeneralTokenV3EcdsaOracleMin>,
        )
    
        /*
        const { tx: callTx, nexts } = await SmartContract.multiContractCall(
            finalTx,
            Alice,
        )

        */

        let primgHash =  ''
        let primgHash2 =  ''


        //////////////////////////////////////////////////////////////////
        //  Contexto Dummy
        //    Para Criar a Preimage
        //////////////////////////////////////////////////////////////////
        SmartContract.dummyFlagOff() //Erros nos tests mostraram necessário
        { //const { tx: callTx, nexts } = await SmartContract.multiContractCall(
          const { tx: callTxDummy, nexts } = await SmartContract.multiContractCallDummy(
            finalTx,
            Alice,
          )
  
          //Se não fizer o broadcast 
  
          primgHash =  (hash256(toHex(callTxDummy.inputs[0].getPreimage(callTxDummy,0))))
          primgHash2 =  (hash256(toHex(callTxDummy.inputs[1].getPreimage(callTxDummy,1))))

          console.log('preimage Hash: ', hash256(toHex(callTxDummy.inputs[0].getPreimage(callTxDummy,0))))
          //console.log('preimage: ', (toHex(callTxDummy.inputs[0].getPreimage(callTxDummy,0))))
          console.log('preimage2 Hash: ', hash256(toHex(callTxDummy.inputs[1].getPreimage(callTxDummy,1))))
          //console.log('preimage2: ', (toHex(callTxDummy.inputs[1].getPreimage(callTxDummy,1))))
   
          console.log("hashvouts Dummy: ", callTxDummy.outputs)
          //console.log("TX Dummy: ", toHex(callTxDummy).substring(toHex(callTxDummy).length - 200))
          console.log("TX Dummy: ", toHex(callTxDummy))
          //console.log("vouts 0 hash: ", sha256(toHex(callTxDummy.outputs[0].script.toHex())))
          //console.log("vouts 1 sc: ", toHex(callTxDummy.outputs[1].script.toHex()))
          //console.log("vouts 1 sc: ", toHex(callTxDummy.outputs[1].script.toHex()))
  
          for(let i = 2; i < callTxDummy.outputs.length; i++ )
          {
            console.log("vouts "+ i + " sc: ", toHex(callTxDummy.outputs[i].script.toHex()))
  
          }
  
        }
 
        const witnessServer = 'https://oracle01.vercel.app/v1'

        const responseECDSA = await oracleWoC(`${witnessServer}/certifyECDSAmin/${txid01}/${index01}/${primgHash}/${networkOc}`)
        const responseECDSA2 = await oracleWoC(`${witnessServer}/certifyECDSAmin/${txid02}/${index02}/${primgHash2}/${networkOc}`)

        
        console.log('Response Oracle: ', (responseECDSA[0].sigDER))
        console.log('Response Oracle2: ', (responseECDSA2[0].sigDER))
  
        //Assinatura do Oraculo
  
        sigOracle = toByteString(responseECDSA[0].sigDER)
        sigOracle2 = toByteString(responseECDSA2[0].sigDER)
  
        const partialTx2 = await instance2.methods.mergeTokens(
          sigOracle, //PubKey(toHex(pubKeyP2)),
          (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
          instance2.thisSupply,
          instance3.thisSupply, //utxo2Fee,
          { multiContractCall: true, } as MethodCallOptions<GeneralTokenV3EcdsaOracleMin>
        )
    
        const finalTx2 = await instance3.methods.mergeTokens(
            sigOracle2, //PubKey(toHex(pubKeyP2b)),
            (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
            instance2.thisSupply,
            instance3.thisSupply, //utxo2Fee,
            {
                multiContractCall: true,
                partialContractTx: partialTx2,
            } as MethodCallOptions<GeneralTokenV3EcdsaOracleMin>,
        )
   
        ////////////////////////////////////////
        //Jesus is the Lord
        //Versão para Oraculo ECDSA
        ////////////////////////////////////////      

        //const { tx: callTx, nexts, raw } = await SmartContract.multiContractCallV2(
        const txRsult = await SmartContract.multiContractCallV2(  
          finalTx2,
          Alice,
        )    

        //SmartContract.dummyFlagOff()

        let callTx = new bsv.Transaction(txRsult)

        //tx.setInputScript

  
        //console.log( 'Counter: ', currentInstance.count + 1n)
        //console.log( 'Counter: ', counter.count)
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
        console.error('Merge fails', e)
        alert('Merge fails')
        setdeptxid("")
      }
    }
    else
    {
      alert('Wrong TXID Format')
      setdeptxid("Try Again!!!")
    }
  };

  return (
    <div className="App">
        <header className="App-header">

        <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>   
          GPToken ECDSA-Soft Oracle - Merge
          
        </h2>

       
        <div>

          <div style={{ textAlign: 'center' , paddingBottom: '20px' }}>
                
                <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                  >Inform Both Current State TXIDs:  
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={txid} type="hex" name="PVTKEY1" min="1" placeholder="current state Tk1" />
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={tokenIndex} type="number" name="PVTKEY1" min="1" placeholder="idxT1: 0 or 1 (0 default)" />
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={txid2} type="hex" name="PVTKEY1" min="1" placeholder="current state Tk2" />
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={tokenIndex2} type="number" name="PVTKEY1" min="1" placeholder="idxT2: 0 or 1 (0 default)" />
                </label>     
          </div>

          <div style={{ textAlign: 'center' }}>     
                <button className="insert" onClick={interact}
                    style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
                >Merge</button>
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

export default PageSC10GPTokenMerge;
