import React, { useRef, FC, useState} from 'react';

import logo from './logo.svg';
import './App.css';

import { DefaultProvider, MethodCallOptions, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, hash160, buildPublicKeyHashScript, findSig, SignatureResponse, hash256 } from "scrypt-ts";

//import { Statefulsc } from "./contracts/stateful";
import { MarketPlaceToken } from "./contracts/mPlaceToken";

import {homepvtKey, homenetwork, compState} from './Home';
import { broadcast, listUnspent, getTransaction, getSpentOutput} from './mProviders';

import { hexToLittleEndian, sleep } from "./myUtils";
//const provider = new DefaultProvider({network: bsv.Networks.testnet});
const provider = new DefaultProvider({network: homenetwork});
let Alice: TestWallet
let signerExt: TestWallet

let txlink2 = ""
//const privateKey = bsv.PrivateKey.fromHex("79342a4c317817a80a298fe116147a74e4e90912a4f321e588a4db67204e29b0", bsv.Networks.testnet)  
//let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork) 

function Page18TokenLockCancel() {
//const  deployACT: FC = () => {  

  const [deployedtxid, setdeptxid] = useState("");
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [txid2, setTxid] = useState("");
  const txid = useRef<any>(null);
  const txidPrvStt = useRef<any>(null);
  const tokenIndex = useRef<any>(null);
  const orderValue = useRef<any>(null);
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

  function hexToLittleEndian(hexString: string): string {
    // Remove the '0x' prefix if present
    console.log('Hex str: ', hexString)


    let result = ""

    for(let i = (hexString.length/2) - 1; i >= 0; i --)
    {
        result += hexString.substring(2*i, 2*i + 2) 
    }

    return result;
  }

  */

  

  const interact = async (amount: any) => {
    setdeptxid("Wait!!!")

    if((txid.current.value.length === 64 || txidPrvStt.current.value.length === 64) 
      )
    {
      // Por algum motivo ele não aceita o provider externo
      let provider = new DefaultProvider({network: homenetwork}); 

      await provider.connect()

      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork) 

      Alice = new TestWallet(privateKey, provider)

      /////////////////////////////////////////////
      //O signer deve ser conectado antes do try
      /////////////////////////////////////////////

      const signer = Alice
      //const balance = 1000
      //Linha necessária nesta versão
      //O signee deve ser connectado
      await signer.connect(provider)

      //console.log('Até aqui 2!!')


  
      try {
          
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
  
        //const instance = Helloworld02.fromTx(tx, 0)

        let finish = false
        let newData = '';

        let posNew1 = 0 // Output Index of the Contract in the Current State TX

        /*
        if(tokenIndex.current.value === '1')
        {
          posNew1 = 1
        }
        */

        let instance2 = MarketPlaceToken.fromTx(tx, posNew1)
        //Inform to the system the right output index of the contract and its sequence
        tx.pvTxIdx(tx.id, posNew1, sha256(tx.outputs[posNew1].script.toHex()))

        let orderCancel = true
    
        let pbkey = bsv.PublicKey.fromPrivateKey(privateKey)

        //let numberOfSendTokens = BigInt(parseInt(orderValue.current.value, 10))
        //let numberOfSendTokens = 3n
        //let toNewOwner = PubKey(toHex(pbkeyBob))
        //let toNewOwner = PubKey(receiverPBK.current.value)


        const balance = instance2.balance
        const nextInstance = instance2.next()

        console.log("Balance: ", balance)

        let pbkeyUserX = PubKey(toHex(bsv.PublicKey.fromPrivateKey(privateKey)))

        if(!orderCancel)
        {

        }
        else
        {
            nextInstance.sell = false
            nextInstance.price = 0n
        }
       
        await instance2.connect(signer)


        instance2.bindTxBuilder('sellOrder', async function () {

          const changeAddress = bsv.Address.fromPrivateKey(privateKey)
     
          const unsignedTx: bsv.Transaction = new bsv.Transaction()
          .addInputFromPrevTx(tx, 0)

          if(orderCancel)
          {

              unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: bsv.Script.fromHex(nextInstance.tokenP2pkhScript + nextInstance.tokenData),
                  satoshis: parseInt(hexToLittleEndian(nextInstance.tokenSats), 16),
              }))
              .change(changeAddress)


              //console.log('Script 100 ext: ', ((unsignedTx.outputs[0].script.toHex())).substring(0, 100))
              //console.log('Script size ext: ', ((unsignedTx.outputs[0].script).toHex()).length)
              //console.log('Hash Script data: ', hash256((unsignedTx.outputs[0].script).toHex().substring(50)))
              //console.log('Hash Script ext: ', hash256((unsignedTx.outputs[0].script).toHex()))

          }
          else
          {

              unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: nextInstance.lockingScript,
                  satoshis: balance,
              }))
              .change(changeAddress)
          

          }

          //console.log('Unsig TX Out: ', toHex(unsignedTx.outputs[0].script))

      
          return Promise.resolve({
              tx: unsignedTx,
              atInputIndex: 0,
              nexts: [
              ]
          });              
        });


        const { tx: callTx } = await instance2.methods.sellOrder(

          // the first argument `sig` is replaced by a callback function which will return the needed signature
          (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkeyUserX)), 
          !orderCancel,
          nextInstance.price, nextInstance.toBuyerP2PKHScript, nextInstance.tokenSats, nextInstance.tokenScriptSize, nextInstance.tokenP2pkhScript, nextInstance.tokenData 
          //PubKey(toHex(pbkeyUserX))
        )
        
        console.log('TXID New State: ', callTx.id)     
        
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
        console.error('Cancel Order fails', e)
        alert('Cancel Order fails')
        setdeptxid("")
      }
    }
    else
    {
      alert('Wrong TXID Format / or price')
      setdeptxid("Try Again!!!")
    }
  };

  return (
    <div className="App">
        <header className="App-header">

        <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>   
          p2pkh Token Order Cancel
          
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

          <div style={{ textAlign: 'center' }}>     
                <button className="insert" onClick={interact}
                    style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
                >Cancel</button>
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

export default Page18TokenLockCancel;
