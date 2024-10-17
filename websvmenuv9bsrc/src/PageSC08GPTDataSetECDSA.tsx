// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, ByteString, hash256, hash160, buildPublicKeyHashScript, findSig, SignatureResponse, PubKeyHash, int2ByteString, MethodCallOptions, ContractTransaction, SmartContract, Sig, reverseByteString } from "scrypt-ts";
import './App.css';
import { pvtkey } from './globals';
//import * as request from 'request';
import { broadcast, listUnspent, getTransaction, oracleWoC } from './mProviders';
import { GeneralToken } from "./contracts/generaltoken";
import { GeneralTokenV3EcdsaOracle } from "./contracts/generaltokenV3ecdsaOracle";

import { RabinPubKey, RabinSig, RabinVerifier, SECP256K1 } from 'scrypt-ts-lib'

import { ContentType } from './OrdinalsContentType';

import {homepvtKey, homenetwork, compState, utxoFeeAdd1, feeService} from './Home';

import { dataFormatScryptSC, convertBinaryToHexString, stringToHex, scriptUxtoSize, hexToLittleEndian, utxoDataUpdata, hexToBytes } from "./myUtils";

//const provider = new DefaultProvider({network: homenetwork});
let signer: TestWallet;

interface props1 {
  passedData: string;
}

//const PageSC07GPTokenCreate: FC = (props) => {
const PageSC08GPTDataSet: FC<props1> = (props) => {

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
  const [fileName, setFileName] = useState("");
  
  const [waitAlert, setwaitAlert] = useState("Inform Text of File then Press Set Data");


  const [txb, settxb] = useState(true);


  const [binaryData2, setbinaryData2] = useState<Uint8Array>(new Uint8Array());
  //sCriptType deve ser ajustado para identificar cada tipo de script
  //preferencialmente no momento que o script for arquivado
  const downloadBinaryFileData = () => {
    // Create a Blob from the binary data
    const blob = new Blob([binaryData2]);

    console.log("File Size: ", binaryData2?.byteLength)

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MyArchive'+ '.' + 'txt'; // Specify the desired file name with the correct extension

    // Programmatically trigger a click event on the anchor element
    a.click();

    // Clean up the URL object and remove the anchor element
    URL.revokeObjectURL(url);
    a.remove();
  };


  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<Uint8Array | null>(null);
  const [hexStrFileData, setHexString] = useState('');
  const [sendButton, setsendButton] = useState(true);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    setwaitAlert("Press Set Data");
    settxb(true)

    const file = event.target.files && event.target.files[0];
    //setSelectedFile(file);

    if (file) {
      setSelectedFile(file);
      // Create a FileReader
      const reader = new FileReader();

      // Define a callback function for when the file is loaded
      reader.onload = (e) => {
        if(e.target)
        {
          const binaryString = e.target.result; // The file data as a binary string
          const hexString = convertBinaryToHexString(binaryString);

          //console.log("Data hexString: ", hexString)

          setHexString(hexString);
        }
      };

      // Read the file as an ArrayBuffer
      //reader.readAsArrayBuffer(file);
      reader.readAsBinaryString(file);
    }
  };

  let txtData = useRef<any>(null);
  let cStateTxid = useRef<any>(null);
  let txlink2 = ""
  let utxoList = useRef<any>(null);
  let changeAddEx = useRef<any>(null);
  const tokenIndex = useRef<any>(null);

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
  
      //Para evitar o problema:  Should connect to a livenet provider
      //Bypassar o provider externo e const
      let provider = new DefaultProvider({network: homenetwork});

      signer = new TestWallet(privateKey, provider)

      //Linha necessária nesta versão
      //O signee deve ser connectado
      await signer.connect(provider)

      //console.log("PVT KEY: ", privateKey.compressed)

      try {

        const UTXOs = await listUnspent(bsv.Address.fromPrivateKey(privateKey).toString(), homenetwork)
        //console.log('Depois de unspent call', UTXOs.length)

        let balance = 0
        for(let i = 0; i < UTXOs.length; i++ )
        {
          balance = balance + UTXOs[i].satoshis
        }
        setbalance(balance)

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
    
    else if((txtData.current.value === "" && hexStrFileData === "" ) || cStateTxid.current.value.length !== 64)
    {
      alert("Missing Data");
      setsendButton(true)
      setwaitAlert("Inform Text of File then Press Set Data")
    }
    
    else
    {
      setLinkUrl('');
      setTXID('')
      setwaitAlert("Wait!!!");

      console.log('Current State: ', cStateTxid.current.value)

      //////////////////////////////////////////////////////////
      //Data Input
      //////////////////////////////////////////////////////////
      let dataToChain: ByteString = '00'

      let newData = dataToChain;

      newData = hexStrFileData;
      if(hexStrFileData === "")
      {
        newData = stringToHex(txtData.current.value);
      }

      let fileName2 = ''
      if(selectedFile !== null)
      {
        fileName2 = selectedFile.name
      }

      newData = dataFormatScryptSC(newData, fileName2)

      ////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////

      //newData = newData + newDataInfo

      console.log("Data Size: ", newData.length)
      console.log("Data: ", newData)

      let posNew1 = 0 // Output Index of the Contract in the Current State TX

      if(tokenIndex.current.value === '1' )
      {
        posNew1 = 1
      }

      ////////////////////////////////////////////////
      //
      //  Configuração da Parte 2 da Chave Publica do Oraculo
      //
      ////////////////////////////////////////////////

      let keyDerivation = reverseByteString(cStateTxid.current.value, 32n) + int2ByteString(BigInt(posNew1), 4n) 

      console.log('keyDerivation: ', keyDerivation)

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

      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      privateKey.compAdd(compState);

      privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
  
      let provider = new DefaultProvider({network: homenetwork});

      await provider.connect()

      signer = new TestWallet(privateKey, provider)

      //Linha necessária nesta versão
      //O signee deve ser connectado
      await signer.connect(provider)

      let tx3 = new bsv.Transaction
      
      tx3 = new bsv.Transaction (await getTransaction(cStateTxid.current.value, homenetwork))

      //let thisTxId = cStateTxid.current.value

      let finish = false

      console.log('TXID Current State: ', tx3.id)

      //let instance2 = GeneralToken.fromTx(tx3, posNew1)
      let instance2 = GeneralTokenV3EcdsaOracle.fromTx(tx3, posNew1)
      //Inform to the system the right output index of the contract and its sequence
      tx3.pvTxIdx(tx3.id, posNew1, sha256(tx3.outputs[posNew1].script.toHex()))
  
      let pbkey = bsv.PublicKey.fromPrivateKey(privateKey)
      let pvtkey = privateKey;
      
      //https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#method-with-signatures
  
      const balance = instance2.balance
      const nextInstance = instance2.next()
      //finish = true
  
      if(!finish)
      {
          nextInstance.data = newData;
      }

      //let toNewOwner = PubKeyHash(toHex(bsv.Address.fromString(receiverPBK.current.value).hashBuffer))

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

      //Esta amarrado a instancia Pai.
      instance2.bindTxBuilder(
        'setupToken',         
        (
          current: GeneralTokenV3EcdsaOracle,
          options: MethodCallOptions<GeneralTokenV3EcdsaOracle>,
          ...args: any
        ): Promise<ContractTransaction> => 
      {
        const changeAddress = bsv.Address.fromPrivateKey(pvtkey)
  
        const unsignedTx: bsv.Transaction = new bsv.Transaction()
        .addInputFromPrevTx(tx3, posNew1)

        if (finish) 
        {         
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
            nextInstance.genesisTX = tx3.id + instance2.tokenType
          }

          console.log('nextInstance.genesisTX: ', nextInstance.genesisTX)
          //console.log('nextInstance.prevUtxo: ', nextInstance.prevUtxo)
          /////////////////////////////////////////////////////////
          /////////////////////////////////////////////////////////

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

      let txid01 = cStateTxid.current.value
      let index01 = posNew1
      let networkOc = 'test'

      if(homenetwork !== bsv.Networks.testnet)
      {
        networkOc = 'main'
      }

      /////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////      

      console.log("*******************Até aqui. ")

      //Dummy Sig for FEE Calculations
      let sigOracle = toByteString('3047022300000026ecfbba3be4b8727e5eb7cfda955907bfe9788c5453847da76d84d6b41d50ae022071a713ba84465a30aaa51b2e0f2880b9f38d46e158fd6ef472f0c33fd57275e741')

      console.log('Pub Key: ', toHex(pbkey))
      console.log('Pub Key Oracle P2: ', toHex(pubKeyP2))

      const partialTx = await instance2.methods.setupToken(//rSig, 
        sigOracle, PubKey(toHex(pubKeyP2)),
        (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
        finish,
        newData,// utxo2Fee,      
        { multiContractCall: true, } as MethodCallOptions<GeneralTokenV3EcdsaOracle>
      )

      let primgHash =  ''

      //////////////////////////////////////////////////////////////////
      //  Contexto Dummy
      //    Para Criar a Preimage
      //////////////////////////////////////////////////////////////////
      SmartContract.dummyFlagOff() //Erros nos tests mostraram necessário
      { //const { tx: callTx, nexts } = await SmartContract.multiContractCall(
        const { tx: callTxDummy, nexts } = await SmartContract.multiContractCallDummy(
          partialTx,
          signer,
        )

        //Se não fizer o broadcast 

        primgHash =  (hash256(toHex(callTxDummy.inputs[0].getPreimage(callTxDummy,0))))

        console.log("***************************Unlocking Script Dummy hash256(Preimage): ", 
            hash256(toHex(callTxDummy.inputs[0].getPreimage(callTxDummy,0))))
        //console.log("(Preimage): ", (toHex(callTxDummy.inputs[0].getPreimage(callTxDummy,0))))
        console.log("(TX): ", (toHex(callTxDummy)))
        console.log("input 1: ", (toHex(callTxDummy.inputs[1].prevTxId)))
        //console.log("Unlocking Script Dummy: ", (toHex(callTxDummy.inputs[0].getPreimage(callTxDummy,0))))          
        //console.log("Sig: ", sha256(toHex(callTx.inputs[0].getSignatures(callTx, privateKey, 0))))
        console.log("hashvouts Dummy: ", callTxDummy.outputs)
        //console.log("hashvouts Dummy: ", toHex(callTxDummy.outputs))
        console.log("vouts 0 hash: ", sha256(toHex(callTxDummy.outputs[0].script.toHex())))
        console.log("vouts 1 sc: ", toHex(callTxDummy.outputs[1].script.toHex()))
        //console.log("vouts 2 sc: ", toHex(callTxDummy.outputs[2].script.toHex()))
      }

      const witnessServer = 'https://oracle01.vercel.app/v1'

      const responseECDSA = await oracleWoC(`${witnessServer}/certifyECDSA/${txid01}/${index01}/${primgHash}/${networkOc}`)
      
      console.log('Response Oracle: ', (responseECDSA[0].sigDER))

      //Assinatura do Oraculo

      sigOracle = toByteString(responseECDSA[0].sigDER)

      const partialTx2 = await instance2.methods.setupToken(//rSig, 
        sigOracle, PubKey(toHex(pubKeyP2)),
        (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
        finish,
        newData, //utxo2Fee,      
        { multiContractCall: true, } as MethodCallOptions<GeneralTokenV3EcdsaOracle>
      )
      
      /*
      const { tx: callTx, nexts } = await SmartContract.multiContractCall(
        partialTx2,
        signer,
      )    
      */

      ////////////////////////////////////////
      //Jesus is the Lord
      //Versão para Oraculo ECDSA
      ////////////////////////////////////////      
      const txRsult = await SmartContract.multiContractCallV2(  
        partialTx2,
        signer,
      )    
      //SmartContract.dummyFlagOff()
      let callTx = new bsv.Transaction(txRsult)

      /*
      console.log("***************************Unlocking Script hash256(Preimage): ", 
                    hash256(toHex(callTx.inputs[0].getPreimage(callTx,0))))
      console.log("input 1: ", (toHex(callTx.inputs[1].prevTxId)))

      //console.log("Sig: ", sha256(toHex(callTx.inputs[0].getSignatures(callTx, privateKey, 0))))
      console.log("hashvouts: ", callTx.outputs)
      console.log("vouts 0 hash: ", sha256(toHex(callTx.outputs[0].script.toHex())))
      console.log("vouts 1 sc: ", toHex(callTx.outputs[1].script.toHex()))
      //console.log("vouts 2 sc: ", toHex(callTx.outputs[2].script.toHex()))

      console.log('TXID New State: ', callTx.id)
      */

//////////////////////////////////////////////////////////////

      settxb(true);

      console.log('\nTX Flag 52: ', toHex(callTx))


      const txId = callTx.id

      console.log('\nTXID Length: ', txId.length)


      if(txId.length === 64)
      {
        console.log('\nTXID: ', txId)
 
        if(homenetwork === bsv.Networks.mainnet )
        {
          txlink2 = "https://whatsonchain.com/tx/" + txId;
        }
        else if (homenetwork === bsv.Networks.testnet )
        {
          txlink2 = "https://test.whatsonchain.com/tx/" + txId;
        }


        if(callTx.id.length === 64)
        {
         
          let finalUTXOs = await listUnspent(bsv.Address.fromPrivateKey(privateKey), homenetwork)

          //nunca usar serialize()
          //console.log('My Tx: ', callTx.serialize())

          //GPToken === 103
          let myJsonStrUTXOs2 = utxoDataUpdata(toHex(callTx), callTx.id, finalUTXOs, 103) 
          
          setbinaryData2(hexToBytes(toByteString(myJsonStrUTXOs2, true)))
        }

        setwaitAlert('');

        //setbalance02(0)
        setLinkUrl(txlink2);

        setTXID(txId)

        setBalance(0)
        
        setHexString('')

        setSelectedFile(null);

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

        GPToken ECDSA Oracle - Set Data
        {
         /*
        Create {props.passedData} Token
        */
        }
        
      </h2>

      <a href='https://medium.com/@cktcracker/insert-or-change-data-token-content-a71d6368bff6' target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '14px', paddingBottom: '20px', color: 'yellow' }}>
            Instructions of Use
        </a>


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



      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={cStateTxid} type="hex" name="PVTKEY1" min="1" placeholder="current state txid" />
              </label>     
          </div>
      </div>

      <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={tokenIndex} type="number" name="PVTKEY1" min="1" placeholder="0 or 1 (0 default)" />
                </label>     
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={txtData} type="text" name="PVTKEY1" min="1" placeholder="text (or file)" />
              </label>     
          </div>
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

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
              > 
       
                 <input ref={addToSend} type="text" name="PVTKEY1" min="1" placeholder="other owner add (optional)" />
              </label>     
          </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
       
                 <input ref={changeAddEx} type="text" name="PVTKEY1" min="1" placeholder="Chage Add (optional)" />
              </label>     
          </div>
      </div>

      */}


      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', justifyContent: 'right', paddingBottom: '20px'}}>
            <label  style={labelStyle}>
              Select File
              <input type="file" onChange={handleFileChange} />
            </label>
            {/*selectedFile && (
                    <div>
                        <p style={{ fontSize: '12px', paddingBottom: '0px' }} >
                          {selectedFile.name}</p>
                    </div>
            )
            */}
        </div>
      </div>
      <div>
        <div >
          
            {selectedFile && (
                    <div style={{ display: 'inline-block', textAlign: 'center', justifyContent: 'right', paddingBottom: '20px'}}>
                        <p style={{ fontSize: '12px', paddingBottom: '0px' }} >
                          {selectedFile.name}</p>
                    </div>
            )}
        </div>
      </div>


      <div>
        {
          sendButton?
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
              <button className="insert" onClick={handleSendButton}
                  style={{ fontSize: '14px', paddingBottom: '0px', marginLeft: '0px'}}
              >Set Data</button>

          </div>
          :
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
          <button className="insert" onClick={handleSendButton}
              style={{ fontSize: '14px', paddingBottom: '0px', marginLeft: '0px'}}
          >Set Data</button>
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
                <div style={{ display: 'inline-block', textAlign: 'center'}}>
                    
                    <button className="insert" onClick={downloadBinaryFileData}
                        style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
                    >Updata MyData</button>

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

export default PageSC08GPTDataSet;