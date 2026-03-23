import React, { useRef, FC, useState} from 'react';

import logo from './logo.svg';
import './App.css';

import { DefaultProvider, MethodCallOptions, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, hash160, buildPublicKeyHashScript, findSig, SignatureResponse, ContractTransaction, SmartContract, PubKeyHash } from "scrypt-ts";

//import { Statefulsc } from "./contracts/stateful";
//import { GeneralToken } from "./contracts/generaltoken";
import { GeneralTokenV2 } from "./contracts/generaltokenV2";

import {homepvtKey, homenetwork, compState, feeService, utxoFeeAdd1} from './Home';
import { broadcast, listUnspent, getTransaction, getSpentOutput} from './mProviders';
import { dataFormatScryptSC, convertBinaryToHexString, stringToHex, sleep, scriptUxtoSize, hexToLittleEndian } from "./myUtils";

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
      //Para evitar o problema:  Should connect to a livenet provider
      //Bypassar o provider externo e const
      let provider = new DefaultProvider({network: homenetwork});

      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork) 

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

        let instance2 = GeneralTokenV2.fromTx(tx, posNew1)
        //Inform to the system the right output index of the contract and its sequence
        tx.pvTxIdx(tx.id, posNew1, sha256(tx.outputs[posNew1].script.toHex()))


        let instance3 = GeneralTokenV2.fromTx(tx2, posNew2)
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
              current: GeneralTokenV2,
              options: MethodCallOptions<GeneralTokenV2>,
              ...args: any
          ): Promise<ContractTransaction> => {
              // create the next instance from the current
  
              const unsignedTx: bsv.Transaction = new bsv.Transaction()
              .addInputFromPrevTx(tx, posNew1)
  
              nextInstance.thisSupply = nextInstance.thisSupply + nextInstance3.thisSupply 
  
              unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: nextInstance.lockingScript,
                  satoshis: balance,
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
              current: GeneralTokenV2,
              options: MethodCallOptions<GeneralTokenV2>,
              ...args: any
          ): Promise<ContractTransaction> => {
              if (options.partialContractTx) {
  
                  const changeAddress = bsv.Address.fromPrivateKey(pvtkey)
         
                  const unsignedTx = options.partialContractTx.tx
  
                  unsignedTx.addInputFromPrevTx(tx2, posNew2)

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
    
        console.log('Number of Units in Tokens 2', instance2.thisSupply)
        console.log('Number of Units in Tokens 1', instance3.thisSupply)

        const partialTx = await instance2.methods.mergeTokens(
          (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
          instance2.thisSupply,
          instance3.thisSupply, utxo2Fee,
          { multiContractCall: true, } as MethodCallOptions<GeneralTokenV2>
        )
    
        const finalTx = await instance3.methods.mergeTokens(
            (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
            instance2.thisSupply,
            instance3.thisSupply, utxo2Fee,
            {
                multiContractCall: true,
                partialContractTx: partialTx,
            } as MethodCallOptions<GeneralTokenV2>,
        )
    
        const { tx: callTx, nexts } = await SmartContract.multiContractCall(
            finalTx,
            Alice,
        )
  
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
          General Purpose Token - Merge
          
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
