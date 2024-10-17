// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString } from "scrypt-ts";
import './App.css';
import { pvtkey } from './globals';
import { broadcast, listUnspent } from './mProviders';

import {homepvtKey, homenetwork, compState} from './Home';
import { littleEndian} from "./myUtils";
//import { Signature } from 'typescript';
//import {} from 'bsv/lib/transaction/sighash';
//var Signature = require('../crypto/signature')


//export let homepvtKey: string = "";
//export let homenetwork = bsv.Networks.testnet;
//export let compState = true;

//const provider = new DefaultProvider({network: homenetwork});
let signer: TestWallet;

//let abcd: Signature;
//abcd.sighash()

//Signature.sighash()

const Page06P2PK2P2PK: FC = () => {

  //const [pubkey, setPubkey] = useState("");
  const [address, setaddress] = useState("");
  const [balance, setbalance] = useState(0);
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const labelRef02 = useRef<HTMLLabelElement | null>(null);
  const labelRef03 = useRef<HTMLLabelElement | null>(null);

  //let txlink = useRef<HTMLLabelElement | null>(null);

  //const [linkUrl, setLinkUrl] = useState('https://whatsonchain.com/');
  const [linkUrl, setLinkUrl] = useState("");

  const [txid, setTXID] = useState("");
  const [waitAlert, setwaitAlert] = useState("Required Information to Start");

  const [txb, settxb] = useState(true);

  const [sendButton, setsendButton] = useState(true);

  /*
  const handleCopyClick = () => {
    if (labelRef.current) {
      navigator.clipboard.writeText(labelRef.current.innerText)
        .then(() => {
          alert('Copied to clipboard!');
        })
        .catch((error) => {
          console.error('Failed to copy to clipboard:', error);
        });
    }
  };

  */

  let addToSend = useRef<any>(null);
  let satsAmount = useRef<any>(null);
  let messageOpt = useRef<any>(null);
  let utxoList = useRef<any>(null);
  let changeAddEx = useRef<any>(null);
  let txlink2 = ""

  /*
  function littleEndian(hexString: string): string {
    // Split the hex string into pairs of two characters
    const hexPairs = hexString.match(/.{1,2}/g);
  
    // Reverse the array of hex pairs and join them back into a string
    const reversedHex = hexPairs ? hexPairs.reverse().join("") : "";
  
    return reversedHex;
  }
  */


  const setBalance = async (amount: any) => {

    //homepvtKey = localPvtKey.current.value;

    console.log("setBalance!!!")

    if(homepvtKey.length !== 64)
    {
      alert("Wrong PVT Key");
      setaddress("");
      setbalance(0);
    }
    else
    {
      setaddress("Wait!!!");

      //bsv.PrivateKey.fromHex
      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //let privateKey = bsv.PrivateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
      privateKey.compAdd(compState);

      privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //privateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
  
      let provider = new DefaultProvider({network: homenetwork});

      signer = new TestWallet(privateKey, provider)

      //Linha necessária nesta versão
      //O signee deve ser connectado
      await signer.connect(provider)

      console.log("PVT KEY: ", privateKey.compressed)

      let pubkey = bsv.PublicKey.fromPrivateKey(privateKey).toString()
      let scriptP2PK = pubkey + ' OP_CHECKSIG'
      let scriptSEC = bsv.Script.fromASM(scriptP2PK)
      console.log('SEC PBK: ', scriptSEC)
      console.log('SEC PBK: ', scriptSEC.toHex())
      //console.log('SEC HASH: ', scriptSEC.getPublicKeyHash())
      console.log('SEC Hash: ', sha256(scriptSEC.toHex()))
      console.log('SEC Hash LE: ', littleEndian(sha256(scriptSEC.toHex())))

      let scriptHash: any 
      scriptHash = littleEndian(sha256(scriptSEC.toHex()))

      

      try {

        //await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
        //pvtkey = "acb";
        //alert('PVT Key: ' + localPvtKey.current.value)
        //await signer.getBalance(bsv.Address.fromPrivateKey(privateKey)).then(balance => {


        //let UTXOs = await provider.listUnspent(scriptHash)

        /*
        await signer.getBalance(scriptHash).then(balance => {
  
          // UTXOs belonging to transactions in the mempool are unconfirmed
          setbalance(balance.confirmed + balance.unconfirmed)


          console.log("Bal: ", balance.confirmed + balance.unconfirmed)

        })

        */

        const UTXOs = await listUnspent(bsv.Address.fromPrivateKey(privateKey).toString(), homenetwork)
        console.log('Depois de unspent call', UTXOs.length)

        let balance = 0
        for(let i = 0; i < UTXOs.length; i++ )
        {
          balance = balance + UTXOs[i].satoshis
        }
        setbalance(balance)
        console.log('Total Satoshis', balance)

        console.log("Bal: ", bsv.Address.fromPrivateKey(privateKey).toString())

        //setaddress(bsv.Address.fromPrivateKey(privateKey).toString())
        setaddress(scriptHash) 

      } catch (e) {
        console.error('Failed', e)
        alert('Failed')
      }
    }
  };

  let cont = 0

  //Apresentar o Balance do Endereço
  useEffect(() => {
    console.log("Call useEffect")
    if(cont === 0)
    {    setBalance(0);
    }
    cont++
  }, []); 


  const handleSendButton = () => {
    if (sendButton) {
      setsendButton(false)
      sendSats(0)
    }
  };

  const sendSats = async (amount: any) => {

    //homepvtKey = localPvtKey.current.value;

    if(homepvtKey.length !== 64)
    {
      alert("Wrong PVT Key");
      setaddress("");
      setbalance(0);
      settxb(false);
      setTXID("")
      setsendButton(true)
    }
    else if(addToSend.current.value === "" || satsAmount.current.value === 0)
    {
      alert("Missing Data");
      setsendButton(true)
      setwaitAlert("Required Information to Start")
    }
    else
    {
      setLinkUrl('');
      setTXID('')
      setwaitAlert("Wait!!!");
      //setaddress("Wait!!!");

      //bsv.PrivateKey.fromHex
      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //let privateKey = bsv.PrivateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
      privateKey.compAdd(compState);

      let UTXOs: bsv.Transaction.IUnspentOutput[] = []

      
      let addstr = ""
      let msnOpt = ""
      let utxoListOpt = ""

      let addarray = (addToSend.current.value).split(' ')

      msnOpt = messageOpt.current.value;
      utxoListOpt = utxoList.current.value;      

      //let changeAddExt: bsv.Address
      let changeAddExt: any
      let changeADD : any;

      changeADD = bsv.Address.fromPrivateKey(privateKey);

      let pubkey = bsv.PublicKey.fromPrivateKey(privateKey).toString()
      let scriptP2PK = pubkey + ' OP_CHECKSIG'
      let scriptSEC = bsv.Script.fromASM(scriptP2PK)
      console.log('SEC PBK: ', scriptSEC)
      console.log('SEC PBK: ', scriptSEC.toHex())
      //console.log('SEC HASH: ', scriptSEC.getPublicKeyHash())
      console.log('SEC Hash: ', sha256(scriptSEC.toHex()))
      console.log('SEC Hash LE: ', littleEndian(sha256(scriptSEC.toHex())))

      let scriptHash: any 
      scriptHash = littleEndian(sha256(scriptSEC.toHex()))

      changeADD = scriptHash;

      console.log('Change Add: ', changeADD)
      
      if(changeAddEx.current.value.length > 10)
      {
        console.log('Change Add: ', changeAddEx.current.value)
        //changeAddExt = bsv.Address.fromString(changeAddEx.current.value);
        changeAddExt = bsv.Script.fromASM(changeAddEx.current.value + ' OP_CHECKSIG');
      }
      else
      {
        //changeAddExt = bsv.Address.fromPrivateKey(privateKey);
        changeAddExt = scriptSEC;
      }



      privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //privateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
  
      let provider = new DefaultProvider({network: homenetwork});

      await provider.connect()

      signer = new TestWallet(privateKey, provider)

      //Linha necessária nesta versão
      //O signee deve ser connectado
      await signer.connect(provider)

      let tx = new bsv.Transaction

      //let UTXOs;// = await provider.listUnspent(changeADD)
      //let UTXOs = await provider.listUnspent(toADD)

      //UTXOs[0].
      if(utxoListOpt.length === 0)
      {
        //UTXOs = await provider.listUnspent(changeADD)

        UTXOs = await listUnspent(changeADD, homenetwork)

        //UTXOs[0].txId
      }
      else
      {
        let strR = ""
        let w1 = 'height: '
        let w2 = 'tx_pos: '
        let w3 = 'tx_hash: '
        let w4 = 'value: '
        let w5 = 'script: '
        let indexOf = utxoListOpt.indexOf(w1);
        let nextIndexOf = indexOf

        while(indexOf !== -1)
        {
          let utxos: bsv.Transaction.IUnspentOutput = {                                                    
                                                        height: 10,
                                                        outputIndex: 0,
                                                        satoshis: 0,
                                                        script: '',
                                                        txId: ""
                                                        //script: scryptlib_1.bsv.Script.buildPublicKeyHashOut(address).toHex(),
                                                      };
          
          //strR = utxoListOpt.substring(indexOf+w1.length, utxoListOpt.indexOf(',', indexOf+w1.length))
          utxos.height = parseInt(utxoListOpt.substring(indexOf+w1.length, utxoListOpt.indexOf(',', indexOf+w1.length)))
          //console.log("Var 1: ", strR);
          
          indexOf = utxoListOpt.indexOf(w2, indexOf+w1.length);
          //strR = utxoListOpt.substring(indexOf+w2.length, utxoListOpt.indexOf(',', indexOf+w2.length))
          utxos.outputIndex = parseInt(utxoListOpt.substring(indexOf+w2.length, utxoListOpt.indexOf(',', indexOf+w2.length)))
          //console.log("Var 2: ", strR);

          indexOf = utxoListOpt.indexOf(w3, indexOf+w2.length);
          //strR = utxoListOpt.substring(indexOf+w3.length, utxoListOpt.indexOf(',', indexOf+w3.length))
          utxos.txId = utxoListOpt.substring(indexOf+w3.length, utxoListOpt.indexOf(',', indexOf+w3.length))
          //console.log("Var 3: ", strR);
          
          indexOf = utxoListOpt.indexOf(w4, indexOf+w3.length);
          //strR = utxoListOpt.substring(indexOf+w4.length, utxoListOpt.indexOf(',', indexOf+w4.length))
          utxos.satoshis = parseInt(utxoListOpt.substring(indexOf+w4.length, utxoListOpt.indexOf('}', indexOf+w4.length)))
          //console.log("Value: ", strR);

          indexOf = utxoListOpt.indexOf(w5, indexOf+w4.length);
          //strR = utxoListOpt.substring(indexOf+w5.length, utxoListOpt.indexOf('}', indexOf+w5.length))
          utxos.script = utxoListOpt.substring(indexOf+w5.length, utxoListOpt.indexOf('}', indexOf+w5.length))
          //console.log("Value: ", strR);

          //É necessário apresentar o script para podermos construir o unlocking script
          //utxos.script = "76a9148c51ed42f050b1bde974fb6649e25b782d168f4088ac"
          
          //indexOf = nextIndexOf
          indexOf = utxoListOpt.indexOf(w1, indexOf+w2.length);  
          //nextIndexOf = indexOf
          //utxos2 = utxos

          UTXOs.push(utxos)            
        }

        //UTXOs = [utxos, utxos]
        //UTXOs[0].
      }
  
      console.log("UTXOs N: ", UTXOs.length)
      console.log("UTXOs: ", UTXOs)

      //console.log("PVT KEY: ", privateKey.compressed)

      
      //let sendADD = addToSend.current.value // you can send it to any address you want



      console.log("Adds Number: ", addarray.length)

      //let sendADD: bsv.Address [] = [];
      let sendADD: any [] = [];
      

      for(let i =0; i< addarray.length; i++)
      {
        addstr = addarray[i];
        sendADD.push(bsv.Script.fromASM(addarray[i] + ' OP_CHECKSIG'))
        /*
        if(addstr.substring(0, 1) === '1' && homenetwork === bsv.Networks.mainnet )
        {
          
          sendADD.push(bsv.Address.fromString(addarray[i]))
        }
        else if ((addstr.substring(0, 1) === 'm' || addstr.substring(0, 1) === 'n') && homenetwork === bsv.Networks.testnet )
        {
          sendADD.push(bsv.Address.fromString(addarray[i]))
        }
        */
        console.log("Adds ",i, ": ", addarray[i])
      }
      
      console.log("Adds Number Built: ", sendADD.length)


      
      //let sendADD = bsv.Address.fromString(addToSend.current.value);

      

      //Your data here
      //let data = toByteString('Test PUSH DATA 2023', true)

      let data = toByteString(msnOpt, true)


      //console.log("Buffer: ", sendADD.hashBuffer)
      //console.log("Buffer: ", sendADD)
      //console.log("Buffer: ", sendADD.hashBuffer)


      //let scriptDROP = 'OP_DUP OP_HASH160 ' + toHex(sendADD[0].hashBuffer) + ' OP_EQUALVERIFY OP_CHECKSIG ' + data + ' OP_DROP'

      let scriptData = 'OP_FALSE OP_RETURN ' + data

      /*
      //Para assinatura de scripts não padrão
      let tx3 = await provider.getTransaction(UTXOs[0].txId);

      //UTXOs[0].script = 'OP_DUP OP_HASH160 ' + toHex(sendADD[0].hashBuffer) + ' OP_EQUALVERIFY OP_CHECKSIG ' + data + ' OP_DROP'      

      UTXOs[0].script = bsv.Script.fromASM(tx3.outputs[UTXOs[0].outputIndex].script.toASM() + ' ' + data + ' OP_DROP').toHex()
      
      UTXOs[0].script = UTXOs[0].script.substring(0, 50)

      console.log('Script Alt: ', UTXOs[0].script)

      */

     
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Jesus is the Lord
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      //Etapa para Calculo da Taxa de Rede
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
          
      let tx2 = new bsv.Transaction()
      let tSatoshis = 0

      for(let i = 0; i < UTXOs.length; i++)
      {
        //console.log('script: ', UTXOs[0].satoshis)
        //console.log('script: ', UTXOs[0].script)
        //console.log('script: ', toHex(bsv.Address.fromPrivateKey(privateKey).hashBuffer))

        //console.log('script: ', toHex(bsv.Address.fromPrivateKey(privateKey).hashBuffer))

        //'OP_DUP OP_HASH160 ' + toHex(sendADD[0].hashBuffer) + ' OP_EQUALVERIFY OP_CHECKSIG '
        //bsv.Address.fromPrivateKey(privateKey).hashBuffer

        //A preimagem usa o unlocking script da TX anterior:
        //let scriptP2PK = 'OP_DUP OP_HASH160 ' + toHex(bsv.Address.fromPrivateKey(privateKey).hashBuffer) + ' OP_EQUALVERIFY OP_CHECKSIG' + ' OP_FALSE OP_RETURN ' + '616161'
//        let scriptP2PK = addarray[i] + ' OP_CHECKSIG'

//        let scriptP2PK = addstr + ' OP_CHECKSIG'

//        console.log('scriptXXX: ', addstr)

        //bsv.Script.fromASM(addarray[i] + ' OP_CHECKSIG')
//        let scriptSEC = bsv.Script.fromASM(scriptP2PK)

        console.log('script: ', scriptSEC.toHex())

        UTXOs[i].script = scriptSEC.toHex()
        console.log('P2PKH script: ', UTXOs[i].script)
      }


      if(msnOpt != '')
      {
        tx2.addOutput(new bsv.Transaction.Output({
          script: bsv.Script.fromASM(scriptData),
          satoshis: 0,
        }))
      }
      /////////////////////////////////////////////////
      //A taxa vem somente da carteira
      /////////////////////////////////////////////////
      for(let i = 0; i < UTXOs.length; i++)
      {
          tx2.from(UTXOs[i])
          //console.log('TX2: ', tx2)
          tSatoshis = tSatoshis + UTXOs[i].satoshis
      }

      for(let i =0; i < sendADD.length; i ++)
      {
        tSatoshis = tSatoshis - satsAmount.current.value //take the satoshis that will be locked from the total ammount

        tx2.addOutput(new bsv.Transaction.Output({
            //script: bsv.Script.buildPublicKeyHashOut(sendADD[i]),
            script: sendADD[i],
            satoshis: satsAmount.current.value,
        }))
      }


      //TX do ADD
      tx2.addOutput(new bsv.Transaction.Output({
        //script: bsv.Script.buildPublicKeyHashOut(changeADD),
        //script: bsv.Script.buildPublicKeyHashOut(changeAddExt),
        script: changeAddExt,
        satoshis: tSatoshis,
      }))

      tx2 = tx2.seal()
      tx2 = tx2.sign(privateKey)

         // Para o Calcula da TAXA de rede

      let rawTX = toHex(tx2)
      let feeTX;
      
      {
          feeTX = Math.floor((toHex(tx2).length/2)*0.001) + 1
      }

      console.log("TX: ", rawTX)

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Jesus is the Lord
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Etapa de Construção Final da TX
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
      
      tx2 = new bsv.Transaction()

      for(let i = 0; i < UTXOs.length; i++)
      {
          tx2.from(UTXOs[i])
      }

      if(msnOpt != '')
      {
        tx2.addOutput(new bsv.Transaction.Output({
          script: bsv.Script.fromASM(scriptData),
          satoshis: 0,
        }))
      }

      for(let i =0; i < sendADD.length; i ++)
      {
        tx2.addOutput(new bsv.Transaction.Output({
            //script: bsv.Script.buildPublicKeyHashOut(sendADD[i]),
            script: sendADD[i],
            satoshis: satsAmount.current.value,
        }))
      }

      //TX do ADD
      if((tSatoshis - feeTX) > 0)
      {
        tx2.addOutput(new bsv.Transaction.Output({
            //script: bsv.Script.buildPublicKeyHashOut(changeADD),
            //script: bsv.Script.buildPublicKeyHashOut(changeAddExt),
            script: changeAddExt,
            satoshis: tSatoshis - feeTX,
        }))
      }

      tx2 = tx2.seal().sign(privateKey)
      
      rawTX = toHex(tx2)
      
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Jesus is the Lord
      /////////////////////////////////////////////////////////////////////////////////////////////////////////


  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

      console.log('\nRaw TX: ', rawTX)

      settxb(true);
/*
      let rawTXTailoring = rawTX;
      let newRawTX = rawTXTailoring.substring(0, 8 + 2 + 64 + 8);
      rawTXTailoring = rawTXTailoring.substring(8 + 2 + 64 + 8, rawTXTailoring.length);

      console.log("new: ", newRawTX)
      console.log("tail: ", rawTXTailoring)



      for(let i = 0; i< UTXOs.length; i++ )
      {

        let unlckSize = 2 * parseInt(rawTXTailoring.substring(0,2), 16)
        let unlock = rawTXTailoring.substring(2, unlckSize + 2)
        console.log("Unlock "+ i + ": ", unlock)
        let sigSize = 2 * parseInt(unlock.substring(0,2), 16)

        let sig = unlock.substring(2, sigSize + 2)
        console.log("Sig "+ i + ": ", sig)
        rawTXTailoring = rawTXTailoring.substring(unlckSize + 2, rawTXTailoring.length);

        let sizeHex = ((sigSize/2) + 1).toString(16)

        while (sizeHex.length % 2 !== 0)
          sizeHex = '0' + sizeHex;

        if(i + 1 < UTXOs.length)
        {
          
          newRawTX = newRawTX + sizeHex + unlock.substring(0, 2) + sig + rawTXTailoring.substring(0, 8 + 64 + 8);
          rawTXTailoring = rawTXTailoring.substring(8 + 64 + 8, rawTXTailoring.length);
        }
        else
        {
          newRawTX = newRawTX + sizeHex + unlock.substring(0, 2) + sig + rawTXTailoring;
        }

        console.log("new: "+ i + ": ", newRawTX)
        console.log("tail: "+ i + ": ", rawTXTailoring)

      }
      */

      //const txId = await provider.sendRawTransaction(newRawTX)
      //const txId = await provider.sendRawTransaction(rawTX)
      const txId = await broadcast(rawTX, homenetwork)

      
      if(txId.length === 64)
      {

        console.log('\nTXID: ', txId)

        //let txid = "bde9bf800372a80b5896653e7f9828b518516690f6a41f51c2b4552e4de4d26d";

        if(homenetwork === bsv.Networks.mainnet )
        {
          txlink2 = "https://whatsonchain.com/tx/" + txId;
        }
        else if (homenetwork === bsv.Networks.testnet )
        {
          txlink2 = "https://test.whatsonchain.com/tx/" + txId;
        }

        setwaitAlert('');
        //setbalance02(0)
        setLinkUrl(txlink2);

        setTXID(txId)

        setBalance(0)    
      }
      else
      
      {
        setwaitAlert('');
        setLinkUrl('');
        setTXID('')
        alert("Fail to Broadcast!!!");
      }
      setsendButton(true)
      

    }
  };

  return (

    <div className="App-header">
      <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          
        p2pk to p2pk
        
      </h2>

      <div className="label-container" style={{ textAlign: 'center', paddingBottom: '20px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'Script Hash: ' + address} 
                          </label>
                          <output id="output1"></output>


                        {/*  <label className="responsive-label" ref={labelRef02} style={{ fontSize: '16px', paddingBottom: '5px' }} 
                          >
                            {address}

                          </label>     */}              
        </div>

        <div style={{ textAlign: 'center' , paddingBottom: '20px'}}>
                          <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'Balance: '} 
                          </label>
                          <output id="output1"></output>

                          <label ref={labelRef03} style={{ fontSize: '12px', paddingBottom: '5px' }} 
                          >
                            {balance} satoshis

                          </label>                   
      </div>


      <div>

              <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                    > 
                      {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                      <input ref={addToSend} type="text" name="PVTKEY1" min="1" placeholder="Send 2 SEC PUB KEY" />
                    </label>     
                </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={satsAmount} type="number" name="PVTKEY1" min="1" placeholder="satoshis" />
              </label>     
          </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={messageOpt} type="text" name="PVTKEY1" min="1" placeholder="message (optional)" />
              </label>     
          </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={utxoList} type="text" name="PVTKEY1" min="1" placeholder="UTXO List (optional)" />
              </label>     
          </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={changeAddEx} type="text" name="PVTKEY1" min="1" placeholder="Chage PBK (optional)" />
              </label>     
          </div>
      </div>

      <div>
        {
          sendButton?
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
              <button className="insert" onClick={handleSendButton}
                  style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
              >send</button>

          </div>
          :
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
          <button className="insert" onClick={handleSendButton}
              style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
          >send</button>

          </div>
        }
      </div>

      {
          txb?
          waitAlert ===''?
              <div>
                <div className="label-container" style={{ fontSize: '14px', paddingBottom: '0px', paddingTop: '5px' }}>
                  <p className="responsive-label" style={{ fontSize: '12px' }}>TXID: {txid} </p>
                </div>
                <div className="label-container" style={{ fontSize: '14px', paddingBottom: '5px', paddingTop: '0px' }}>
                  <p className="responsive-label" style={{ fontSize: '12px' }}>TX link: {' '} 
                      <a href={linkUrl} target="_blank" style={{ fontSize: '12px'}}>
                      {linkUrl}</a></p>
                </div>
              </div>
              :
              <div className="label-container" style={{ fontSize: '14px', paddingBottom: '5px', paddingTop: '5px' }}>
              <p className="responsive-label" style={{ fontSize: '12px' }}>{waitAlert} </p>
              </div>  
          :
          ""
      }           

    </div>
  );
};

export default Page06P2PK2P2PK;