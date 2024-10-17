// src/components/Home.tsx
import React, {FC} from 'react';


import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, ByteString } from "scrypt-ts";
import './App.css';
import { pvtkey } from './globals';

import {homepvtKey, homenetwork, compState} from './Home';

import {buyTXID} from './PageSC15MarketPlace';


import { broadcast, getSpentOutput, getTransaction, listUnspent, scriptHistory, exchangeRate } from './mProviders';

import { ContentType, RetContentType } from './OrdinalsContentType';
//import { GeneralToken } from "./contracts/generaltoken";
import { GeneralTokenV2 } from "./contracts/generaltokenV2";
import { MarketPlaceToken } from "./contracts/mPlaceToken";

import { mPlaceTokenTemplate, erroSC, hexToLittleEndian, scriptUxtoSize, convertBinaryToHexString } from "./myUtils";

import { fileTypeFromData, hexToBytes} from "./myUtils";

import PageSC15MarketPlaceBuy from './PageSC15MarketPlaceBuy';

export let payTXID: string = "";

let signer: TestWallet;

interface props1 {
  passedData: string;
}


//const Page03Read: FC = () => {
const Page03ReadMarketPlace: FC<props1> = (props) => {

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
  const [currentTxid, setcurrentTxid] = useState("");


  const [fileType, setfileType] = useState("bin");

  const [txStamp, settxStamp] = useState("");



  const [downloadFile, setdownloadFile] = useState(false);
  const [downloadTX, setdownloadTX] = useState(false);
  
  


  const [waitAlert, setwaitAlert] = useState("Inform the TXID to Start");



  const [txb, settxb] = useState(true);


  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [binaryData, setbinaryData] = useState<Uint8Array>(new Uint8Array());
  const [strData, setstrData] = useState('');
  const [tokenInfo, settokenInfo] = useState('');
  const [tokenOwner, settokenOwner] = useState('');
  const [tokenDescription, settokendescription] = useState('');
  const [tokenSale, settokenSale] = useState('');

  const [binaryDataTX, setbinaryDataTX] = useState<Uint8Array>(new Uint8Array());
  const [hexStrFileData, setHexString] = useState('');

  const [txidFlag, settxidFlag] = useState('');


  let imageBlob = new Blob([binaryData], { type: 'image/jpeg' }); // Adjust the type based on the image format
  let imageUrl = URL.createObjectURL(imageBlob);  
  let htmlDataP = new TextDecoder('utf-8').decode(binaryData);

  let videoBlob = new Blob([binaryData], { type: 'video/mp4' });
  //let videoBlob = new Blob([binaryData], { type: 'video/wmv' });
  let videoUrl = URL.createObjectURL(videoBlob);

  let txIdRet = useRef<any>(null);
  let satsAmount = useRef<any>(null);
  let txlink2 = ""
  let gptIndex = useRef<any>(null);

  const [currentPage, setCurrentPage] = useState<string>('home00WeBSVmenu');
  const [showReadDropdown, setShowReadDropdown] = useState<boolean>(false);

  const handlePageChange = (page: string, txidBuy: string) => {

    //buyTXID = txidBuy

    setCurrentPage(page);
    setShowReadDropdown(false);

    //window.open('/page-sc15-marketplace', '_blank');

  };

  let cont = 0
 
  //Apresentar o Balance do Endereço
  
  useEffect(() => {
    console.log("Call useEffect")

    //txIdRet.current = buyTXID;
    if(cont === 0)
    {    readFromChain(0);
    }
    cont++
  }, []); 


  const readFromChain = async (amount: any) => {

    //homepvtKey = localPvtKey.current.value;
    setdownloadFile(false)

    {
      setLinkUrl('');
      setTXID('');
      settokenInfo('');
      settokenOwner('')
      setwaitAlert("Wait!!!");
  
      let provider = new DefaultProvider({network: homenetwork});
//      await provider.connect()

      let tx3 = new bsv.Transaction

      //Place here the TXID of the current state of the contract

      //tx3 = await provider.getTransaction(txIdRet.current.value);

      //let currentTIXD = txIdRet.current.value
      let currentTIXD = buyTXID
      payTXID = buyTXID
      

      console.log('File Length: ', hexStrFileData.length)

      if(currentTIXD.length === 64)
      {
        tx3 = new bsv.Transaction (await getTransaction(currentTIXD, homenetwork));
        settxidFlag(currentTIXD)
        //setSelectedFile(null)
      }
      else
      {
        tx3.fromString(hexStrFileData)
        currentTIXD = tx3.id
        settxidFlag('')
      }

      setcurrentTxid(currentTIXD)

      //console.log('TX new: ', tx4)



      console.log('Test TX3: ', tx3.id)

      //let price: exchagePRICE
      let price = await exchangeRate()
      console.log('BSV price (100000000 sats): ', price[0].rate * 1 + ' $USD')
      console.log('BSV price (100000000 sats): ', price[0].rate * 100 + ' $C')
      console.log('BSV price (100000000 sats): ', price[0].rate * 100000 + ' 0.001 $C')
      console.log('BSV price (100000000 sats): ', price[0].rate * 100000000 + ' 0.000001 $C')


      let dataTX = toHex(tx3.outputs[0].script.toHex())


      let getData = tx3.outputs[0].script.toHex()
      let getDataASM = tx3.outputs[0].script.toASM()

      let scriptHistoty = await scriptHistory(hexToLittleEndian(sha256(getData)), homenetwork)

      let timestamper = 0;

      console.log("Token Script Hash: ", hexToLittleEndian(sha256(getData)))

      for(let i = 0; i < scriptHistoty.length; i ++)
      {
        console.log("Script Hash TXs: ", scriptHistoty[i].txId)
        console.log("Script Hash Block: ", scriptHistoty[i].height)
        //console.log("Script Hash Time: ", scriptHistoty[i].time)
        if(scriptHistoty[i].txId === tx3.id)
        {
           timestamper = scriptHistoty[i].height
           break;

        }
      }

      if(homenetwork === bsv.Networks.testnet)
      {
        settxStamp(timestamper.toString(10) + '-TestNet')
      }
      else
      {
        settxStamp(timestamper.toString(10) + '-MainNet')

      }

      //////////////////////////////////////////////////////////////
      //Jesus is the Lord
      //////////////////////////////////////////////////////////////

      //////////////////////////////////////////////////////////////
      //Usado para Ler Order Lock de P2PKH Tokens 
      //////////////////////////////////////////////////////////////
      
      if(props.passedData === 'OLock')
      {
        let posNew1 = 0 // Output Index of the Contract in the Current State TX

        if(gptIndex.current.value === '1')
        {
          posNew1 = 1
        }


        //let tx4 = new bsv.Transaction
        //tx4.fromString(erroSC())
        //let instance1 = ErrorSC.fromTx(tx4, posNew1)

        let instance2 = MarketPlaceToken.fromTx(tx3, posNew1)
        let scriptHex = bsv.Script.fromHex(instance2.tokenP2pkhScript + instance2.tokenData)

        getData = scriptHex.toHex()
        getDataASM = scriptHex.toASM()

       let indexHahs1 = instance2.toBuyerP2PKHScript.indexOf('76a914');
       let indexHahs2 = instance2.toBuyerP2PKHScript.indexOf('88ac');

       console.log('Script Buyer: ', instance2.toBuyerP2PKHScript)

       //if(tokenStateSC === 'Current' && instance2.sell )
       if(instance2.sell )
       {

          //if(instance2.toBuyerP2PKHScript === instance2.tokenP2pkhScript)
          if(instance2.toBuyerP2PKHScript === '')
          {
            settokenSale('For Sale: ( PRICE: ' + instance2.price + ' sats' + '; ANYONE CAN PAY' + ' )');
          }
          else
          {
            settokenSale('For Sale: ( PRICE: ' + instance2.price + ' sats' + '; ONLY BUYER: ' 
            + bsv.Address.fromPublicKeyHash(Buffer.from(instance2.toBuyerP2PKHScript.substring(indexHahs1 + 6, indexHahs2), 'hex'), homenetwork)
            + ' )');

          }

        }    
      }
      //////////////////////////////////////////////////////////////      
      //////////////////////////////////////////////////////////////

      //Primeira Busca no Formato ASM por OP_RETURN Token
      let index: number = getDataASM.indexOf('OP_RETURN');

      let fileType = ''

      let tokenType = false;
      let defaultData = false;

      ///////////////////////////////////////
      //Primeiro Verifica se é GPToken
      ///////////////////////////////////////
      gptIndex.current = '0'
      if(props.passedData === 'GPToken')
      {
        let posNew1 = 0 // Output Index of the Contract in the Current State TX

        if(gptIndex.current.value === '1')
        {
          posNew1 = 1
        }
        //let instance2 = GeneralToken.fromTx(tx3, posNew1)
        let instance2 = GeneralTokenV2.fromTx(tx3, posNew1)

        //GeneralToken.
    
        console.log('Data Size: ', instance2.data.length)
        console.log('Data Details: ', instance2.data.substring(instance2.data.length - 16, instance2.data.length))
        console.log('Data Size Final: ', (instance2.data.length - 16 )/2)
    
        //Convert from hex to bytes
        //const bytes = hexToBytes(instance2.data.substring(0, instance2.data.length - 16));

        if(instance2.data.length >= 16)
        {
          //Dado do Token com Dado
          getData = instance2.data.substring(0, instance2.data.length - 16);
          //Tipo de arquivo
          fileType = instance2.data.substring(instance2.data.length - 16, instance2.data.length - 10) 
        }
        //Para o caso de token sem dado
        else
        {
          //Dado do Token com Dado
          getData = instance2.data.substring(0, instance2.data.length);
          //Tipo de arquivo
          fileType = '000000' 
        }



        let stxos = await getSpentOutput(currentTIXD, posNew1, homenetwork)

        let tokenStateSC = 'Current'

        console.log('*********************************: ', tokenStateSC)
    
        if(stxos[0].inputIndex !== -1)
        {
          tokenStateSC = 'Past'
          console.log('*********************************: ', tokenStateSC)
        }

        settokenInfo('GPToken: ( UNITS = '+ instance2.thisSupply + ' / ' + instance2.totalSupply 
        + '; INDEX = ' + posNew1  
        + '; STATE = ' + tokenStateSC 
        + '; STAMP = ' + timestamper
        + ' )');

        if(tokenStateSC === 'Current' && instance2.sell )
        {

          if(instance2.toBuyer === instance2.alice)
          {
            settokenSale('For Sale: ( PRICE: ' + instance2.price + ' sats'
            + '; ANYONE CAN PAY' + ' )');

          }
          else
          {

            settokenSale('For Sale: ( PRICE: ' + instance2.price + ' sats' 
            //+ '; ONLY BUYER: ' + bsv.Address.fromPublicKey(bsv.PublicKey.fromHex(instance2.toBuyer), homenetwork) + ' )');
            + '; ONLY BUYER: ' + bsv.Address.fromPublicKeyHash(hexToBytes(instance2.toBuyer), homenetwork) + ' )');

          }


        }

        //settokenOwner('Owner Add: ' + bsv.Address.fromPublicKey(bsv.PublicKey.fromHex(instance2.alice), homenetwork))
        settokenOwner('Owner Add: ' + bsv.Address.fromPublicKeyHash(hexToBytes(instance2.alice), homenetwork))
        settokendescription('Description: ' + 
          new TextDecoder('utf-8').decode(hexToBytes(instance2.idData.substring(0, instance2.idData.length - 16))))
    
      }

      ///////////////////////////////////////
      //Não sendo GPToken
      //Busca por P2PKH Tokens or Stamps
      ///////////////////////////////////////
      else //if(props.passedData !== 'Stamps')
      {

        let index0: number = getDataASM.indexOf('OP_1 0');

        if((index0 !== -1)) // Stamps
        {
          let index: number = getDataASM.indexOf('OP_1 0');

          getData = getDataASM.substring(index + 'OP_1 0'.length + 1, getDataASM.length)
          console.log('Data Get: ', getData)
          index = getData.indexOf(' 0');
  
          let ownerpubKey = getData.substring(index + ' '.length)
          console.log('Pub Key: ', ownerpubKey)
          ownerpubKey = ownerpubKey.substring(0, getData.indexOf(' ')) 
  
          getData = getData.substring(0, index)
  
          //console.log('Data Get: ', getData)
  
          //console.log('GetData: ', getData.substring(0, 100))
  
  
          //let pubKeySend = bsv.PublicKey.fromPrivateKey(privateKey);
          console.log('Pub Key: ', ownerpubKey)
          let pubKeySend = bsv.PublicKey.fromHex(ownerpubKey);
  
  
          //let indexHahs1 = getData.indexOf('76a914');
          //let indexHahs1 = getData.indexOf('76a914');
          //let indexHahs2 = getData.indexOf('88ac');
   
    
          let ownerAdd
  
          //if((indexHahs1 !== -1) && (indexHahs2 !== -1))
          if( ownerpubKey.length >= 66)
          {
            //ownerAdd = bsv.Address.fromPublicKeyHash(Buffer.from(getData.substring(indexHahs1 + 6, indexHahs2), 'hex'), homenetwork)
            ownerAdd = bsv.Address.fromPublicKey(pubKeySend, homenetwork)
          }
          else
          {
            ownerAdd = 'none'
          }
  
          settokenOwner('Owner Add: ' + ownerAdd)
  
          let stxos = await getSpentOutput(currentTIXD, 0, homenetwork)
  
          let tokenStateSC = 'Current'
      
          //Verifica se o estado do token é atual
          if(stxos[0].inputIndex !== -1)
          {
            tokenStateSC = 'Past'
            settokenSale('');
          }
  
          {
            index = getDataASM.indexOf('OP_1 04');
  
            {
              //index = getDataASM.indexOf('OP_CHECKSIG');
              
              //getData = getDataASM.substring(index + 12, getDataASM.length - 8)
              tokenType = true;
              settokenInfo('Opt Stamps Token: ( BALANCE = ' + tx3.outputs[0].satoshis + ' satoshi'
              + '; STATE = ' + tokenStateSC 
              + '; STAMP = ' + timestamper
              + ' )');
  
            }
            
          }

        }
        else // Non Stamps
        {
            
            let indexHahs1 = getData.indexOf('76a914');
            let indexHahs2 = getData.indexOf('88ac');
    
      
            let ownerAdd

            if((indexHahs1 !== -1) && (indexHahs2 !== -1))
            {
              ownerAdd = bsv.Address.fromPublicKeyHash(Buffer.from(getData.substring(indexHahs1 + 6, indexHahs2), 'hex'), homenetwork)
            }
            else
            {
              ownerAdd = 'none'
            }

            settokenOwner('Owner Add: ' + ownerAdd)

            let stxos = await getSpentOutput(currentTIXD, 0, homenetwork)

            let tokenStateSC = 'Current'
        
            //Verifica se o estado do token é atual
            if(stxos[0].inputIndex !== -1)
            {
              tokenStateSC = 'Past'
              settokenSale('');
            }

            //OP_RETURN Token
            //No formato ASM fica mais fácil encontrar o dado:
            //Vai do indice de 'OP_RETURN '.length até getDataASM.length
            if(index !== -1)
            {
              //fileType = '000001';
              tokenType = true;
              getData = getDataASM.substring(index + 10, getDataASM.length)
              settokenInfo('p2pkh Return Data Token: ( BALANCE = ' + tx3.outputs[0].satoshis + ' sats' 
              + '; STATE = ' + tokenStateSC 
              + '; STAMP = ' + timestamper
              + ' )');
            }
            /////////////////////////////
            // nSatOrdinals ou OP_DROP token
            /////////////////////////////
            else
            {
              index = getDataASM.indexOf('0 OP_IF');

              //nSatOrdinals Token
              //No formato ASM fica mais fácil encontrar o dado:
              //Vai do indice de ('0 OP_IF ' + '6f7264'+ ' OP_1 ').length até getDataASM.length
              if(index !== -1) // Ordinals Token
              {

                if(tx3.outputs[0].satoshis === 1)
                {
                  settokenInfo('1satOrdinals Token: ( BALANCE = ' + tx3.outputs[0].satoshis + ' sat' 
                  + '; STATE = ' + tokenStateSC 
                  + '; STAMP = ' + timestamper
                  + ' )');
                }
                else
                {
                  settokenInfo('nSatOrdinals Token: ( BALANCE = ' + tx3.outputs[0].satoshis + ' sats'
                  + '; STATE = ' + tokenStateSC 
                  + '; STAMP = ' + timestamper
                  + ' )');
                }
              
                //0 OP_IF 6f7264 OP_1 746578742f706c61696e3b636861727365743d7574662d38 0 717765727479 OP_ENDIF
      
                getData = getDataASM.substring(index + ('0 OP_IF ' + '6f7264'+ ' OP_1 ').length, getDataASM.length)
      
                index = getData.indexOf(' 0 ');//É possível no formato ASM
      
                let dataType = getData.substring(0, index) //O formato do Arquivo do 1satOrdinal
                //let dataType = getData.substring(index + 3, getData.length - ' OP_ENDIF'.length )
      
                for(let i = 0; i < RetContentType.length; i ++)
                {
                  if((Buffer.from(dataType, 'hex')).toString('utf-8') === RetContentType[i])
                  {
                    fileType = RetContentType[i+1];
                    break;
                  }
                }

                //Dado do Token
                getData = getData.substring(index + 3, getData.length - ' OP_ENDIF'.length )
      
                console.log('File Type: ', fileType)
                console.log('Data Ord: ', getData)
      
              }
              //OP_DROP Token
              //No formato ASM fica mais fácil encontrar o dado:
              //Vai do indice de 'OP_CHECKSIG '.length até getDataASM.length - ' OP_DROP'.length
              else 
              {
                index = getDataASM.indexOf('OP_CHECKSIG');
                
                getData = getDataASM.substring(index + 12, getDataASM.length - 8)
                tokenType = true;
                settokenInfo('p2pkh Data Drop Token: ( BALANCE = ' + tx3.outputs[0].satoshis + ' satoshi'
                + '; STATE = ' + tokenStateSC 
                + '; STAMP = ' + timestamper
                + ' )');

              }
              
            }
        }

      }


      dataTX = getData;

     if(fileType.length === 0)
     {
          fileType = dataTX.substring(dataTX.length - 16, dataTX.length - 10)
     }

      console.log('File Type: ', fileType )
      //switch(dataTX.substring(dataTX.length - 16, dataTX.length - 10))

      let fTypeData = fileTypeFromData(fileType)
      setfileType(fTypeData[0])
      defaultData = fTypeData[1]


      console.log('Data Size Final: ', (dataTX.length - 16 )/2)

        const encoder = new TextEncoder();
        //const data = encoder.encode(dataTX.substring(0, dataTX.length - 16));
    
        //const hexString = "48656c6c6f20576f726c64"; // Example hex string
        //let bytes = hexToBytes(dataTX.substring(0, dataTX.length - 16));
        let bytes = hexToBytes(dataTX.substring(0, dataTX.length));

        if(tokenType && !defaultData)
        {
          bytes = hexToBytes(dataTX.substring(0, dataTX.length - 16));
        }

        //console.log(bytes); // Outputs: Uint8Array [ 72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100 ]
        //console.log('TXID New State: ', callTx.id)   

        // Replace this with your binary data

        console.log("Size before: ", binaryData.length)

        setbinaryData(bytes)
        let bytesTX = hexToBytes(toHex(tx3));
        //console.log("TX HEX: ", toHex(tx3))
        setbinaryDataTX(bytesTX)


        setstrData(new TextDecoder('utf-8').decode(bytes))

        imageBlob = new Blob([bytes], { type: 'image/jpeg' }); // Adjust the type based on the image format
        imageUrl = URL.createObjectURL(imageBlob);  

        htmlDataP = new TextDecoder('utf-8').decode(bytes);

        videoBlob = new Blob([bytes], { type: 'video/mp4' });
        //videoBlob = new Blob([bytes], { type: 'video/wmv' });
        videoUrl = URL.createObjectURL(videoBlob);
      

        //binaryData = new Uint8Array(bytes);
        console.log("Size after: ", binaryData.length)

        //if(bytes.length > 0)
        if(bytes.length > 0)
        {
          setdownloadFile(true)
          //setwaitAlert("Comprar Token!!!");
          setwaitAlert("");

          handlePageChange('BuyToken', '')

          console.log("download file: ", downloadFile)
          console.log("File Type: ", fileType)

        }
        else if(bytes.length === 0) // Para GPToken Vazio
        {
          setdownloadFile(true)
          setwaitAlert("No Data in the Token!!!");

          handlePageChange('BuyToken', '')

          //console.log("download file: ", downloadFile)
          //console.log("File Type: ", fileType)

        }

        else
        {
          setwaitAlert("Try Again!!!");
          settokenInfo('');
          settokenOwner('')
        }      

        //setHexString('')
        //setSelectedFile(null)
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

  const iframeStyle = {
    width: '60%', // Use 100% of the parent container's width
    height: 'auto', // Automatically adjust height based on content
  };

  const contentStyle = {
    background: 'gray',
    color: 'black',
    fontSize: '12px',
    width: '80%',
    

  };

  const containerStyle = {
    //width: '300px', // Set the width of the container
    //height: '200px', // Set the height of the container
    width: '80%',
    height: 'auto',
    overflow: 'hidden', // Hide any overflow outside the container
    //display: 'flex',
    //alignItems: 'center',
    //justifyContent: 'center',
  };

  const imageStyle = {
    //width: '80%', // Make the image fit the container width
    maxWidth: '80%',
    height: 'auto', // Automatically adjust the height while maintaining aspect ratio
  };


  const containerStyleV = {
    //width: '300px', // Set the width of the container
    //height: '200px', // Set the height of the container
    width: '80%',
    //maxWidth: '400px !important', // Set a maximum width to constrain the player's size
    height: 'auto',
    overflow: 'hidden', // Hide any overflow outside the container
    //display: 'flex',
    //alignItems: 'center',
    //justifyContent: 'center',
  };

  const videoStyle = {

    width: '80%', // Set the width of the container
    height: 'auto', // Set the height of the container

    //width: '80%', // Make the image fit the container width
    //maxWidth: '80%',
    //height: '20%', // Automatically adjust the height while maintaining aspect ratio
  };


  return (

    <div className="App-header3">

      {
        props.passedData === 'GPToken' && tokenOwner !== ''?
          <div>
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenInfo} </p>
            </div>


            {tokenSale !== ''?
                  <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px',
                  color: 'orange' }}>
                        <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenSale} </p>
                    </div>
                    :
                    ''
            }
            
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenOwner} </p>
            </div>
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenDescription} </p>
            </div>
          </div>
            
        :
        ''
        //<div></div>
      }

      {
        props.passedData !== 'GPToken' && tokenOwner !== ''?
          <div>
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenInfo} </p>
            </div>
            {tokenSale !== ''?
                  <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                        <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenSale} </p>
                    </div>
                    :
                    ''
            }
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenOwner} </p>
            </div>
          </div>
            
        :
        ''
        //<div></div>
      }

      {
        downloadFile?
        
        fileType == 'txt'?
        <div>
          <h1 style={{ fontSize: '14px', paddingBottom: '5px', paddingTop: '0px'}}>Data Content</h1>
            
            {/* Create an iframe to embed the file with responsive dimensions */}
          
            <iframe
              //src= {binaryData} //"path-to-your-file.pdf"
              srcDoc= {strData}
              //style={iframeStyle}
              style={{ fontSize: '12px', color: 'white !important', background: 'white', width: '80%'}}
              title="File Presentation"
              allowFullScreen // Allows full-screen mode
            ></iframe>

        </div>
        : fileType == 'png' || fileType == 'jfif'|| fileType == 'jpg'|| fileType == 'jpeg'|| fileType == 'webp'|| fileType == 'bmp'?
        <div style={containerStyle}>
          <h1 style={{ fontSize: '14px', paddingBottom: '5px', paddingTop: '0px'}}>Data Content</h1>
            
            <img src={imageUrl} alt="Image" style={imageStyle} />
            
        </div>
        : fileType == 'html' || fileType == 'webp'?
        <div style={containerStyle}>
          <h1 style={{ fontSize: '14px', paddingBottom: '5px', paddingTop: '0px'}}>Data Content</h1>
          
          <iframe srcDoc={htmlDataP} title="HTML File" style={imageStyle}></iframe>
        </div>
        :fileType == 'mp4'?

        <div style={containerStyleV}>
          <h1 style={{ fontSize: '14px', paddingBottom: '5px', paddingTop: '0px'}}>Data Content</h1>
                                
              <video controls style={videoStyle}>
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
        </div>
        :fileType == 'wmv'?

        <div style={containerStyleV}>
          <h1 style={{ fontSize: '14px', paddingBottom: '5px', paddingTop: '0px'}}>Data Content</h1>
           {/* 
              { videoUrl && (
                <Player 
                  //playsInline
                  //poster="/path/to/poster.jpg" // Optional: Add a poster image
                  src={videoUrl}
                />
              ) }
          */}   
        </div>
        :
        <div>
        <h1 style={{ fontSize: '14px', paddingBottom: '5px', paddingTop: '0px'}}>Data Content</h1>
          
          {/* Create an iframe to embed the file with responsive dimensions */}
        
          <iframe
            //src= {binaryData} //"path-to-your-file.pdf"
            srcDoc= {'Content of this file cannot be displayed here. Download to see content!!!'}
            //style={iframeStyle}
            style={{ fontSize: '12px', color: 'white !important', background: 'white', width: '80%'}}
            //title="File Presentation"
            allowFullScreen // Allows full-screen mode
          ></iframe>

        </div>

        
        :
        //<div>          {/* Divisão final de downloadFile?*/}        </div>
        ''
        
        
      }

      {/*
        downloadFile?

        
        <div>
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '15px', paddingTop: '20px'}}>
              
              <button className="insert" onClick={() => handlePageChange('BuyToken', '')}
                  style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
              >Comprar</button>

          </div>

          
          {currentPage === 'BuyToken' && <PageSC15MarketPlaceBuy/>}
        </div>
        :
        //<div></div>
        ''
      */}

      {currentPage === 'BuyToken' && <PageSC15MarketPlaceBuy/>}
      {
          txb?
          waitAlert ===''?
              ''
              :
              <div className="label-container" style={{ fontSize: '14px', paddingBottom: '5px', paddingTop: '5px' }}>
              <p className="responsive-label" style={{ fontSize: '12px' }}>{waitAlert} </p>
              </div>  
          :
          <div></div>
      }           



    </div>
  );
};

export default Page03ReadMarketPlace;