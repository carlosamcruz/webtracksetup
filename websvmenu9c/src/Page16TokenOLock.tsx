// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, ByteString, hash256, MethodCallOptions, ContractTransaction, findSig, SignatureResponse } from "scrypt-ts";
import './App.css';
import { pvtkey } from './globals';
//import * as request from 'request';
import { broadcast, listUnspent, getTransaction } from './mProviders';

import {homepvtKey, homenetwork, compState} from './Home';

import { MarketPlaceToken } from "./contracts/mPlaceToken";
import { mPlaceTokenTemplate, hexToLittleEndian, scriptUxtoSize } from "./myUtils";

//const provider = new DefaultProvider({network: homenetwork});
let signer: TestWallet;

interface props1 {
  passedData: string;
}

//const Page15TokenDMelt: FC = () => {
  const Page16TokenOLock: FC<props1> = (props) => {

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


  const [waitAlert, setwaitAlert] = useState("Press to Melt Token");



  const [txb, settxb] = useState(true);

  const [sendButton, setsendButton] = useState(true);

  let tokenTXID = useRef<any>(null);
  let txlink2 = ""
  let utxoList = useRef<any>(null);
  let changeAddEx = useRef<any>(null);

  let addToSendNewOwner = useRef<any>(null);
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
    
    else if(tokenTXID.current.value.length !== 64 || satsAmount.current.value < 1)
    {
      alert("Missing Data");
      setsendButton(true)
      setwaitAlert("Press to Melt Token")
    }
    
    else
    {
      setLinkUrl('');
      setTXID('')
      setwaitAlert("Wait!!!");

      //bsv.PrivateKey.fromHex
      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //let privateKey = bsv.PrivateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
      privateKey.compAdd(compState);

      let changeAddExt: bsv.Address
      let changeADD = bsv.Address.fromPrivateKey(privateKey);

      if(changeAddEx.current.value.length > 10)
      {
        console.log('Change Add: ', changeAddEx.current.value)
        changeAddExt = bsv.Address.fromString(changeAddEx.current.value);
      }
      else
      {
        changeAddExt = bsv.Address.fromPrivateKey(privateKey);
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

      utxoListOpt = utxoList.current.value; 

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
      let meltToken = true //Default

      let utxoIndex = 0

      
      let getData = txGet.outputs[utxoIndex].script.toHex()
      let getDataASM = txGet.outputs[utxoIndex].script.toASM()
    
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Jesus is the Lord
      /////////////////////////////////////////////////////////////////////////////////////////////////////////

      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      //Sell Order Contract
      /////////////////////////////////////////////////////////////////////////////////////////////////////////

      let pbkeyUserX = bsv.PublicKey.fromPrivateKey(privateKey)
      let tx3 = new bsv.Transaction

      //TX precisa ser mudada
      //tx3 = await provider.getTransaction('56590408beb7f441371dc2ff41b764e358a74aa96a45d5d89435899d10f7c44b')

      //Essta transação precisa ser moficada, se o contrato mudar:
      //TXID da TestNet: 56590408beb7f441371dc2ff41b764e358a74aa96a45d5d89435899d10f7c44b
      //O contrato pode ser usado também na MainNet

      tx3.fromString(mPlaceTokenTemplate())

      let orderCancel = false
      //let orderCancel = true
  
      console.log('TXID Current State: ', tx3.id)
  
      let posNew1 = 0 // Output Index of the Contract in the Current State TX
      let instance2 = MarketPlaceToken.fromTx(tx3, posNew1)
      //Inform to the system the right output index of the contract and its sequence
      tx3.pvTxIdx(tx3.id, posNew1, sha256(tx3.outputs[posNew1].script.toHex()))
  
      let pvtkey = privateKey;
      let pbkey = bsv.PublicKey.fromPrivateKey(privateKey);


      const balance = instance2.balance
      const nextInstance = instance2.next()

      
      ////////////////////////////////////////////
      // Ajuste do tamanho do Script e indicação do byte de tamanho em bytes
      // Só pode ser indicado a partir desta posição para não dar conflito
      // se o script ultrapassar os bytes indicados para os dados
      ////////////////////////////////////////////

      //Tamanho do script formatado
      let out1size = scriptUxtoSize(txGet.outputs[utxoIndex].script.toHex())
   
      let tokenSats = (txGet.outputs[utxoIndex].satoshis).toString(16);
      console.log("Sat STR 0: ", tokenSats)
      while(tokenSats.length < 16)
      {
        tokenSats = '0' + tokenSats
      }

      //console.log("Sat STR 1: ", tokenSats)
      //console.log('Output Size: ', out1size)
  
      if(!orderCancel)
      {
          //Exemplo: a6be30f811b9dd4904695b7ab1dba094a8e975831b18423541ba884e55f1c107
          nextInstance.sell = true
          //nextInstance.tokenSats = '0200000000000000'

          nextInstance.tokenSats = hexToLittleEndian(tokenSats)
          //nextInstance.tokenScriptSize = '2b'
          nextInstance.tokenScriptSize = out1size
          //nextInstance.tokenP2pkhScript = '76a91466779ec5838d2e1aa9d3adb8200c595282c86ef588ac'

          nextInstance.tokenP2pkhScript = txGet.outputs[utxoIndex].script.toHex().substring(0, 50)

          //nextInstance.tokenData = '10546573746520706172612076656e646175'
          nextInstance.tokenData = txGet.outputs[utxoIndex].script.toHex().substring(50, txGet.outputs[utxoIndex].script.toHex().length)


          //nextInstance.toBuyer = PubKey(toHex(pbkeyUserX))
          //nextInstance.toBuyerADD = '76a91466779ec5838d2e1aa9d3adb8200c595282c86ef588ac'
          //nextInstance.toBuyerP2PKHScript = ''

          if(addToSendNewOwner.current.value.length > 10)
          {
            nextInstance.toBuyerP2PKHScript = bsv.Script.buildPublicKeyHashOut(addToSendNewOwner.current.value).toHex()
          }
          else
          {
            nextInstance.toBuyerP2PKHScript = ''
          }
         
          nextInstance.price = BigInt(satsAmount.current.value)
      }
      else
      {
          nextInstance.sell = false
          nextInstance.price = 0n
      }

      await instance2.connect(signer)

      //////////////////////////////////////////////////////////////////
      //Usuário não pode esquecer de mudar a chave publica do contrato
      //////////////////////////////////////////////////////////////////
      nextInstance.alice = PubKey(toHex(pbkey))
      //////////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////////

      const changeAddress = bsv.Address.fromPrivateKey(pvtkey)
         
      const unsignedTx: bsv.Transaction = new bsv.Transaction()
      .addInputFromPrevTx(tx3, 0)
  
      instance2.bindTxBuilder('sellOrder', (
        current: MarketPlaceToken,
        options: MethodCallOptions<MarketPlaceToken>,
        ...args: any
        ): Promise<ContractTransaction> => {

            //console.log('Added TX Out: ', nextInstance.tokenP2pkhScript + nextInstance.tokenData)
            //console.log("Satohis: ", parseInt(hexToLittleEndian(nextInstance.tokenSats), 16))
            //console.log("Satohis 16: ", (hexToLittleEndian(nextInstance.tokenSats)))

                if(orderCancel)
                {
                    unsignedTx.addOutput(new bsv.Transaction.Output({
                        script: bsv.Script.fromHex(nextInstance.tokenP2pkhScript + nextInstance.tokenData),
                        satoshis: parseInt(hexToLittleEndian(nextInstance.tokenSats), 16),
                    }))
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

                //console.log('Unsig TX Out: ', toHex(unsignedTx.outputs[0].script))
                return Promise.resolve({
                    tx: unsignedTx,
                    atInputIndex: 0,
                    nexts: [
                    ]
                });              
      });

      let partialTx = await instance2.methods.sellOrder(

        // the first argument `sig` is replaced by a callback function which will return the needed signature
        (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkeyUserX)), 
        !orderCancel,
        nextInstance.price, nextInstance.toBuyerP2PKHScript, nextInstance.tokenSats, 
        nextInstance.tokenScriptSize, nextInstance.tokenP2pkhScript, nextInstance.tokenData,
        { multiContractCall: true, } as MethodCallOptions<MarketPlaceToken>
        //PubKey(toHex(pbkeyUserX))
      )

      //console.log('Ouput Scritp: ', (partialTx.tx.outputs[0].script.toHex())) 

      /////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
          
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
      for(let i = 0; i < UTXOs.length; i++)
      {
          tx2.from(UTXOs[i])
          tSatoshis = tSatoshis + UTXOs[i].satoshis
      }

      //tSatoshis = tSatoshis - 0 //take the satoshis that will be locked from the total ammount

      //TX do Contrato
      if(pvScritp)
      {

        tx2.addOutput(new bsv.Transaction.Output({
          //script: bsv.Script.buildPublicKeyHashOut(changeADD),
          script: partialTx.tx.outputs[0].script,
          satoshis: txGet.outputs[utxoIndex].satoshis,
        }))
      }

      //TX do ADD
      tx2.addOutput(new bsv.Transaction.Output({
        //script: bsv.Script.buildPublicKeyHashOut(changeADD),
        script: bsv.Script.buildPublicKeyHashOut(changeAddExt),
        satoshis: tSatoshis,
      }))

      tx2 = tx2.seal()
      tx2 = tx2.sign(privateKey)

      // Para o Calcula da TAXA de rede

      let rawTX = toHex(tx2)
      let feeTX;
      if(rawTX.substring(82, 84) === '00' && props.passedData !== 'True')
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

          //console.log("TX: ", rawTX)

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
  

      for(let i = 0; i < UTXOs.length; i++)
      {
          tx2.from(UTXOs[i])
      }

    
      //TX do Contrato
      if(pvScritp)
      {
        tx2.addOutput(new bsv.Transaction.Output({
          //script: bsv.Script.buildPublicKeyHashOut(changeADD),
          script: partialTx.tx.outputs[0].script,
          satoshis: txGet.outputs[utxoIndex].satoshis,
        }))
      }

      //TX do ADD
      if((tSatoshis - feeTX) > 0)
      {
        tx2.addOutput(new bsv.Transaction.Output({
            //script: bsv.Script.buildPublicKeyHashOut(changeADD),
            script: bsv.Script.buildPublicKeyHashOut(changeAddExt),
            satoshis: tSatoshis - feeTX,
        }))
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
      if(rawTX.substring(82, 84) === '00' && props.passedData !== 'True')
      {
          console.log('\nTest positon: ', rawTX.substring(82, 84))
          rawTX = rawTX.substring(0, 82) + tx2.DERSEC()[0] + rawTX.substring(84, rawTX.length)
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

        {props.passedData} Token Order Lock

        {  
        //{props.passedData} Token - Order Lock
        }
        
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
              <input ref={addToSendNewOwner} type="text" name="PVTKEY1" min="1" placeholder="Send 2 Add (Optional)" />
            </label>     
        </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
          > 
            {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
            <input ref={satsAmount} type="number" name="PVTKEY1" min="1" placeholder="price (satoshis)" />
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
              >Create</button>

          </div>
          :
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
          <button className="insert" onClick={handleSendButton}
              style={{ fontSize: '14px', paddingBottom: '0px', marginLeft: '0px'}}
          >Create</button>
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

export default Page16TokenOLock;