// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, ByteString, hash256 } from "scrypt-ts";
import './App.css';
import { pvtkey } from './globals';
//import * as request from 'request';
import { broadcast, listUnspent, getTransaction } from './mProviders';

import {homepvtKey, homenetwork, compState} from './Home';
import { pushDataSize } from './myUtils';


//const provider = new DefaultProvider({network: homenetwork});
let signer: TestWallet;

interface props1 {
  passedData: string;
}

//const Page14TokenDTransfer: FC = () => {
  const Page14TokenDTransfer: FC<props1> = (props) => {

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


  const [waitAlert, setwaitAlert] = useState("Press to Transfer Token");



  const [txb, settxb] = useState(true);


  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<Uint8Array | null>(null);
  const [hexStrFileData, setHexString] = useState('');
  const [sendButton, setsendButton] = useState(true);

  let txtData = useRef<any>(null);
  let tokenTXID = useRef<any>(null);
  let txlink2 = ""
  let utxoList = useRef<any>(null);
  let changeAddEx = useRef<any>(null);

  let addToSend = useRef<any>(null);

  let satsAmount = useRef<any>(null);

  //let data = "";

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

      try {

        //await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
        //pvtkey = "acb";
        //alert('PVT Key: ' + localPvtKey.current.value)
        /*
        await signer.getBalance(bsv.Address.fromPrivateKey(privateKey)).then(balance => {
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


        setaddress(bsv.Address.fromPrivateKey(privateKey).toString()) 

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
      writeToChain(0)
    }
  };

  let txidBC = ''




  const writeToChain = async (amount: any) => {

    //homepvtKey = localPvtKey.current.value;

    //txtData.current.value = "none"

    if(homepvtKey.length !== 64)
    {
      alert("Wrong PVT Key");
      setaddress("");
      setbalance(0);
      settxb(false);
      setLinkUrl("");
      setTXID("")
      setsendButton(true)
      
    }
    
    else if(tokenTXID.current.value.length !== 64 
    || ( addToSend.current.value.length < 10 ) || Number(satsAmount.current.value) < 0)
    {
      alert("Missing Data");
      setsendButton(true)
      setwaitAlert("Press to Transfer Token")
    }

    else if(props.passedData === 'Stamps' 
      && ( addToSend.current.value.length !== 66 
        &&  (addToSend.current.value.substring(0, 2) !== '02' && addToSend.current.value.substring(0, 2) !== '03') )

      && ( addToSend.current.value.length !== 130 &&  addToSend.current.value.substring(0, 2) !== '04' )
       
      )
      {
        console.log('PBK Length: ', addToSend.current.value.length)
        console.log('PBK type: ', addToSend.current.value.substring(0, 2))
        alert("Public Key Incorrect");
        setsendButton(true)
        setwaitAlert("Press to Transfer Token")
      }
    
    else
    {
      setLinkUrl('');
      setTXID('')
      setwaitAlert("Wait!!!");

      //let addDestine = bsv.Address.fromString(addToSend.current.value);
      let addDestine// = bsv.Address.fromString(addToSend.current.value);

      console.log('ADD Destiny: ', addToSend.current.value)

      //let 
      if(props.passedData === 'Stamps')
      {
        let pbkdestiny = bsv.PublicKey.fromHex(addToSend.current.value); 
        addDestine = bsv.Address.fromPublicKey(pbkdestiny);
        console.log('ADD Destiny 01: ', addToSend.current.value)

      }
      else
      {
        addDestine = bsv.Address.fromString(addToSend.current.value);
      }

      console.log('ADD Destiny 01: ', addToSend.current.value)

      if(props.passedData !== 'Stamps' && addToSend.current.value.substring(0, 1) === '1' && homenetwork === bsv.Networks.mainnet )
      {
        addDestine = bsv.Address.fromString(addToSend.current.value)
      }
      else if (props.passedData !== 'Stamps' && (addToSend.current.value.substring(0, 1) === 'm' || addToSend.current.value.substring(0, 1) === 'n') && homenetwork === bsv.Networks.testnet )
      {
        addDestine = bsv.Address.fromString(addToSend.current.value)
      }

      console.log('ADD Destiny: ', addDestine)

      //bsv.PrivateKey.fromHex
      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //let privateKey = bsv.PrivateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
      privateKey.compAdd(compState);

      let changeAddExt: bsv.Address
      let changeADD = bsv.Address.fromPrivateKey(privateKey);

      let data = ''

      if(changeAddEx.current.value.length > 10)
      {
        console.log('Change Add: ', changeAddEx.current.value)
        //changeAddExt = bsv.Address.fromString(changeAddEx.current.value);
        data = toByteString(changeAddEx.current.value, true)
      }
      //else

      
      
  
      {
        //changeAddExt = bsv.Address.fromPrivateKey(privateKey);
        changeAddExt = bsv.Address.fromString(addToSend.current.value);
        //data = toByteString(addToSend.current.value, true)
      }


      privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //privateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
  
      let provider = new DefaultProvider({network: homenetwork});

      await provider.connect()

      signer = new TestWallet(privateKey, provider)

      //Linha necessária nesta versão
      //O signee deve ser connectado
      await signer.connect(provider)

      let UTXOs: bsv.Transaction.IUnspentOutput[] = []

      let utxoListOpt = ""

      //utxoListOpt = utxoList.current.value; 

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

      console.log("UTXOs: ", UTXOs)


      let txGet = new bsv.Transaction
      //tx = await provDf.getTransaction('109a98607224ed49820b4d5c89b722ff4eaf3e15b6b9ffe7ada77552c48eb461')
      //txGet = await provider.getTransaction(tokenTXID.current.value)
      txGet = new bsv.Transaction(await getTransaction(tokenTXID.current.value, homenetwork))

      //let pvScritp = false //Using no previous script 
      let pvScritp = true //Using previous script
      let satsToScript = 1000
      let changeScript = true //Using previous script
      let meltToken = false //Default

      let utxoIndex = 0

      let getData = txGet.outputs[utxoIndex].script.toHex()
      let getDataASM = txGet.outputs[utxoIndex].script.toASM()

      //let scriptData = 'OP_DUP OP_HASH160 ' + toHex(addDestine.hashBuffer) + ' OP_EQUALVERIFY OP_CHECKSIG ' + data + ' OP_DROP'

      //scriptData = getData

      let scriptData = ''
      //if(props.passedData !== 'Return')
      if(props.passedData === 'Drop')
      {
        //let data = toByteString(addToSend.current.value, true)

        //changeAddExt = bsv.Address.fromString(addToSend.current.value);

        let index: number = getDataASM.indexOf('OP_CHECKSIG');
        console.log('Data Get: ', getData)
  
        getData = getDataASM.substring(index + 12, getDataASM.length - 8)
        
        console.log('Data ASM Get: ', (getDataASM))
        console.log('Data HEX Get: ', getData)
        console.log('Data HEX Get length: ', getData.length)
  
        //scriptData = 'OP_DUP OP_HASH160 ' + toHex(addDestine.hashBuffer) + ' OP_EQUALVERIFY OP_CHECKSIG ' + getData + ' OP_DROP'

        if(data.length > 0)
        {
          scriptData = 'OP_DUP OP_HASH160 ' + toHex(bsv.Address.fromString(changeAddEx.current.value).hashBuffer) + ' OP_EQUALVERIFY OP_CHECKSIG ' + data + ' OP_DROP'
        }
        else
        {
          scriptData = 'OP_DUP OP_HASH160 ' + toHex((bsv.Address.fromPrivateKey(privateKey)).hashBuffer) + ' OP_EQUALVERIFY OP_CHECKSIG ' + getData + ' OP_DROP'
        }
      }
      else if(props.passedData === 'Return')
      {
        let index: number = getDataASM.indexOf('OP_RETURN');
        console.log('Data Get: ', getData)
  
        getData = getDataASM.substring(index + 10, getDataASM.length)
        
        console.log('Data ASM Get: ', (getDataASM))
        console.log('Data HEX Get: ', getData)
        console.log('Data HEX Get length: ', getData.length)
  
        scriptData = 'OP_DUP OP_HASH160 ' + toHex(addDestine.hashBuffer) + ' OP_EQUALVERIFY OP_CHECKSIG ' + 'OP_RETURN ' + getData 
      }
      //else //Ordinals
      else if(props.passedData === 'Ordinals')
      {
        //let index: number = getDataASM.indexOf('OP_FALSE OP_IF');
        let index: number = getDataASM.indexOf('0 OP_IF');
        console.log('Data Get: ', getData)
  
        //getData = getDataASM.substring(index + 10, getDataASM.length)


        console.log('index: ', index)

        getData = getDataASM.substring(index, getDataASM.length)

        console.log('GetData: ', getData.substring(0, 100))
        
        //console.log('Data ASM Get: ', (getDataASM))
        //console.log('Data HEX Get: ', getData)
        //console.log('Data HEX Get length: ', getData.length)
  
        scriptData = 'OP_DUP OP_HASH160 ' + toHex(addDestine.hashBuffer) + ' OP_EQUALVERIFY OP_CHECKSIG ' + getData
        
        //scriptData = 'OP_DUP OP_HASH160 ' + toHex(bsv.Address.fromPrivateKey(privateKey).hashBuffer) + ' OP_EQUALVERIFY OP_CHECKSIG ' + 
        //'OP_FALSE OP_IF ' + '6f7264'+ ' OP_TRUE ' + contentType + ' OP_FALSE '+ data1 + ' OP_ENDIF'

      }

      else if(props.passedData === 'Stamps')
      {

        //let index: number = getDataASM.indexOf('OP_FALSE OP_IF');
        console.log('Data Get: ', getDataASM)
        let index: number = getDataASM.indexOf('OP_1 0');
        
  
        //getData = getDataASM.substring(index + 10, getDataASM.length)


        console.log('index: ', index)

        getData = getDataASM.substring(index + 'OP_1 0'.length + 1, getDataASM.length)
        console.log('Data Get: ', getData)
        index = getData.indexOf(' 0');
        getData = getData.substring(0, index)
        console.log('Data Get: ', getData)

        console.log('GetData: ', getData.substring(0, 100))


        //let pubKeySend = bsv.PublicKey.fromPrivateKey(privateKey);
        let pubKeySend = bsv.PublicKey.fromHex(addToSend.current.value);
        
   
        //let compression = '21'
        let data = '51' + pushDataSize('05'+ getData) + '05' + getData 
        //+ '21' + toHex(pubKeySend)
        + pushDataSize(toHex(pubKeySend)) + toHex(pubKeySend)
        + '52' + 'ae'

        //console.log('Data size: ', pushDataSize('04c0e0bf0bbcdc53be9542359aeb1dde7c6289743b7b3460c12e2d57a478c6e489c0e0bf0bbcdc53be9542359aeb1dde7c6289743b7b3460c12e2d57a478c6e489c0e0bf0bbcdc53be9542359aeb1dde7c6289743b7b3460c12e2d57a478c6e489c0e0bf0bbcdc53be9542359aeb1dde7c6289743b7b3460c12e2d57a478c6e489') )

        let script = bsv.Script.fromHex(data)

        //scriptData = 'OP_1 ' + toHex(pubKeySend) + data2 + ' ' + m + ' OP_CHECKMULTISIG'

        scriptData = script.toASM()
      }



      console.log('New Scrip: ', (scriptData))

      //Se não houver troca de DADO
      if(!changeScript)
      {
          scriptData = txGet.outputs[utxoIndex].script.toASM()
      }
          
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Jesus is the Lord
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      //Etapa para Calculo da Taxa de Rede
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
          
      let tx2 = new bsv.Transaction()
      let tSatoshis = 0

      if(pvScritp)
      {
          //Using previous script
          tx2.addInputFromPrevTx(txGet, utxoIndex)
      }

      /////////////////////////////////////////////////
      //A taxa vem somente da carteira
      /////////////////////////////////////////////////
      /*
      for(let i = 0; i < UTXOs.length; i++)
      {
          tx2.from(UTXOs[i])
          tSatoshis = tSatoshis + UTXOs[i].satoshis
      }
      */

      tSatoshis = txGet.outputs[utxoIndex].satoshis

      //tSatoshis = tSatoshis - 0 //take the satoshis that will be locked from the total ammount


      //TX do Contrato
      if(pvScritp)
      {
          if(!meltToken && (txGet.outputs[utxoIndex].satoshis - Number(satsAmount.current.value)) > 0 ) //aqui não dá para saber a taxa
          {
              //Using previous script
              tx2.addOutput(new bsv.Transaction.Output({
              script: bsv.Script.fromASM(scriptData),
              satoshis: txGet.outputs[utxoIndex].satoshis - satsAmount.current.value,
              }))
          }
          else
          {
              //Token Melted
              //tSatoshis = tSatoshis + txGet.outputs[utxoIndex].satoshis
              tSatoshis = txGet.outputs[utxoIndex].satoshis

          }
      }
      else
      {
          //Using new script
          tSatoshis = tSatoshis - satsToScript //take the satoshis that will be locked from the total ammount

          tx2.addOutput(new bsv.Transaction.Output({
              script: bsv.Script.fromASM(scriptData),
              satoshis: satsToScript,
          }))
      }
      



      //TX do ADD

      if(Number(satsAmount.current.value) > 0)
      {
        tx2.addOutput(new bsv.Transaction.Output({
          //script: bsv.Script.buildPublicKeyHashOut(changeADD),
          script: bsv.Script.buildPublicKeyHashOut(changeAddExt),
          satoshis: satsAmount.current.value//tSatoshis,
        }))
  
        
      }

      tx2 = tx2.seal()
      tx2 = tx2.sign(privateKey)


      // Para o Calcula da TAXA de rede

      let rawTX = toHex(tx2)
      let feeTX;
      if(rawTX.substring(82, 84) === '00')
      {
          console.log('\nAJUSTE DE TAXA DE REDE \n')
          //rawTX = rawTX.substring(0, 82) + tx2.DERSEC()[0] + rawTX.substring(84, rawTX.length)
          feeTX = (Math.floor(((toHex(tx2).length/2) - ('00'.length/2) + (tx2.DERSEC()[0].length/2))*0.001) + 1)*100
      } 
      else
      {
          feeTX = (Math.floor((toHex(tx2).length/2)*0.001) + 1)*100
      }
      //console.log('\nRaw TX: ', rawTX)

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

      console.log("TX: ", rawTX)

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Jesus is the Lord
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Etapa de Construção Final da TX
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
      
      tx2 = new bsv.Transaction()

      if(pvScritp)
      {
          //Using previous script
          tx2.addInputFromPrevTx(txGet, utxoIndex)
      }
  

      /*
      for(let i = 0; i < UTXOs.length; i++)
      {
          tx2.from(UTXOs[i])
      }
      */
    
      //TX do Contrato
      if(pvScritp)
      {
          if(!meltToken && (txGet.outputs[utxoIndex].satoshis - Number(satsAmount.current.value) - feeTX) > 0)
          {
              //Using previous script
              tx2.addOutput(new bsv.Transaction.Output({
              script: bsv.Script.fromASM(scriptData),
              satoshis: txGet.outputs[utxoIndex].satoshis - satsAmount.current.value - feeTX,
              }))
          }
      }
      else
      {
          //Using new script
          tx2.addOutput(new bsv.Transaction.Output({
              script: bsv.Script.fromASM(scriptData),
              satoshis: satsToScript,
          }))
      }


      //TX do ADD
      //if((tSatoshis - feeTX) > 0)

      if(Number(satsAmount.current.value) > 0)
      {
        if((tSatoshis - feeTX) > Number(satsAmount.current.value))
        {
          
          tx2.addOutput(new bsv.Transaction.Output({
              //script: bsv.Script.buildPublicKeyHashOut(changeADD),
              script: bsv.Script.buildPublicKeyHashOut(changeAddExt),
              //satoshis: tSatoshis - feeTX,
              satoshis: satsAmount.current.value,
              
          }))
        }
        else
        {
          tx2.addOutput(new bsv.Transaction.Output({
            //script: bsv.Script.buildPublicKeyHashOut(changeADD),
            script: bsv.Script.buildPublicKeyHashOut(changeAddExt),
            //satoshis: tSatoshis - feeTX,
            satoshis: (tSatoshis - feeTX),
            
          }))
        }
      }


      tx2 = tx2.seal().sign(privateKey)
      
      //rawTX = toHex(tx2)


      //Não permite verificar uma assinatura não realizada
      //console.log('Fuly Signed',  tx2.isFullySigned())
      
      for(let i = 0; i < UTXOs.length + 1; i++)
      {
          console.log('DERSEC ', i, ': ',  tx2.DERSEC()[i])
      }

      rawTX = toHex(tx2)
      
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Jesus is the Lord
      /////////////////////////////////////////////////////////////////////////////////////////////////////////

      //Inserção da Assinatura do Script
      if(rawTX.substring(82, 84) === '00')
      {
          console.log('\nTest positon: ', rawTX.substring(82, 84))
          //rawTX = rawTX.substring(0, 82) + tx2.DERSEC()[0] + rawTX.substring(84, rawTX.length)
          if(props.passedData === 'Stamps')
          {

            let sigScript = ''
            sigScript = tx2.DERSEC()[0]

            sigScript = sigScript.substring(2)

            sigScript = sigScript.substring(0, 2 * parseInt(sigScript.substring(0,2), 16) + 2)

            sigScript = '00'+ sigScript
            sigScript = (sigScript.length / 2).toString(16) + sigScript

            rawTX = rawTX.substring(0, 82) + sigScript + rawTX.substring(84, rawTX.length)

          }
          else
          {
            rawTX = rawTX.substring(0, 82) + tx2.DERSEC()[0] + rawTX.substring(84, rawTX.length)
          }
      } 
      
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Jesus is the Lord
      /////////////////////////////////////////////////////////////////////////////////////////////////////////


  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

      console.log('\nRaw TX: ', rawTX)

      settxb(true);

      
      
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
        
        setHexString('')

      }
      else

      
      {
        setwaitAlert('');
        setHexString('')
        setLinkUrl('');
        setTXID('')
        alert("Fail to Broadcast!!!");
      }
      setsendButton(true)

    }

  };

  const labelStyle = {
    backgroundColor: 'black',
    color: 'white',
    padding: '5px 5px',
    cursor: 'pointer',
    borderRadius: '5px',
    fontSize: '14px', 
    paddingBottom: '5px'
  };

  return (

    <div className="App-header">
      <h2 style={{ fontSize: '34px', paddingBottom: '0px', paddingTop: '0px'}}>

        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          
        Send {props.passedData} Auto Token
        
      </h2>

      <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                          <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'Address: '} 
                          </label>
                          <output id="output1"></output>

                          <label ref={labelRef02} style={{ fontSize: '12px', paddingBottom: '5px' }} 
                          >
                            {address}

                          </label>                   
        </div>

        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
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


      {/*
      <div>

              <div style={{ display: 'inline-block', textAlign: 'center' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                    > 
                      
                      <input ref={txtData} type="text" name="PVTKEY1" min="1" placeholder="Send 2 Add" />
                    </label>     
                </div>
      </div>

      */}

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={tokenTXID} type="hex" name="PVTKEY1" min="1" placeholder="token txid" />
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

      <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
                > 
                  {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                  <input ref={addToSend} type="text" name="PVTKEY1" min="1" placeholder="address" />
                </label>     
      </div>

      {/*
      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
         
                 <input ref={utxoList} type="text" name="PVTKEY1" min="1" placeholder="UTXO List (optional)" />
              </label>     
          </div>
      </div>
      */}

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 
                 <input ref={changeAddEx} type="text" name="PVTKEY1" min="1" placeholder="Chage Add (optional)" />
              </label>     
          </div>
      </div>





      <div>
        {
          sendButton?
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
              <button className="insert" onClick={handleSendButton}
                  style={{ fontSize: '14px', paddingBottom: '0px', marginLeft: '0px'}}
              >Transfer</button>

          </div>
          :
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
          <button className="insert" onClick={handleSendButton}
              style={{ fontSize: '14px', paddingBottom: '0px', marginLeft: '0px'}}
          >Transfer</button>
          </div>
        }
      </div>

      {/*
      <div>
        <input type="file" onChange={handleFileChange} />
        {selectedFile && (
          <div>
            <p>Selected File: {"name"}</p>
            
          </div>
        )}
      </div>
      */}

      {
          txb?
          waitAlert ===''?
              <div>
                <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
                  <p className="responsive-label" style={{ fontSize: '12px' }}>TXID: {txid} </p>
                </div>
                <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
                  <p className="responsive-label" style={{ fontSize: '12px' }}>TX link: {' '} 
                      <a href={linkUrl} target="_blank" style={{ fontSize: '12px', color: 'cyan'}}>
                      {linkUrl}</a></p>
                </div>
              </div>
              :
              <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
              <p className="responsive-label" style={{ fontSize: '12px' }}>{waitAlert} </p>
              </div>  
          :
          ""
      }           

    </div>
  );
};

export default Page14TokenDTransfer;