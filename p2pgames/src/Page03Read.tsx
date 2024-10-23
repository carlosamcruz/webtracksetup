// src/components/Home.tsx
import React, {FC} from 'react';


import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, ByteString } from "scrypt-ts";
import './App.css';


import {homepvtKey, homenetwork, compState} from './Home';
import { broadcast, getSpentOutput, getTransaction, listUnspent, scriptHistory, exchangeRate } from './mProviders';

import { ContentType, RetContentType } from './OrdinalsContentType';
//import { GeneralToken } from "./contracts/generaltoken";

//import { GeneralTokenV2 } from "./contracts/generaltokenV2";

import { OddOrEvenContract } from "./contracts/oddOrEvenContract";


import { mPlaceTokenTemplate, erroSC, hexToLittleEndian, scriptUxtoSize, convertBinaryToHexString } from "./myUtils";



import { fileTypeFromData, hexToBytes} from "./myUtils";


interface props1 {
  passedData: string;
}


//const Page03Read: FC = () => {
const Page03Read: FC<props1> = (props) => {

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
  const [tokenInfo2, settokenInfo2] = useState('');
  const [tokenInfo3, settokenInfo3] = useState('');
  const [tokenInfo4, settokenInfo4] = useState('');
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


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    settxidFlag(txIdRet.current.value)
    setwaitAlert("Press Read to Explore TX");
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

          console.log("Data hexString: ", hexString)

          setHexString(hexString);
        }
      };
      // Read the file as an ArrayBuffer
      //reader.readAsArrayBuffer(file);
      reader.readAsBinaryString(file);
    }
  };



  //let binaryData = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
  
  //let binaryData: Uint8Array

  const downloadBinaryFile = () => {
    // Create a Blob from the binary data
    const blob = new Blob([binaryData]);

    console.log("File Size: ", binaryData?.byteLength)

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fileS2P-' + currentTxid + '.' + fileType; // Specify the desired file name with the correct extension

    // Programmatically trigger a click event on the anchor element
    a.click();

    // Clean up the URL object and remove the anchor element
    URL.revokeObjectURL(url);
    a.remove();
  };
  

  const downloadTXFile = () => {
    // Create a Blob from the binary data
    const blob = new Blob([binaryDataTX]);

    console.log("File Size: ", binaryDataTX?.byteLength)

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stamp-' + txStamp+ '-' + currentTxid + '.bin'; // Specify the desired file name with the correct extension

    // Programmatically trigger a click event on the anchor element
    a.click();

    // Clean up the URL object and remove the anchor element
    URL.revokeObjectURL(url);
    a.remove();
  };

  interface exchagePRICE {
    rate: number,
    time: number,
    currecy: string,
  }


  const readFromChain = async (amount: any) => {

    //homepvtKey = localPvtKey.current.value;
    setdownloadFile(false)

    {
      setLinkUrl('');
      setTXID('');
      settokenInfo('');
      settokenInfo2('');
      settokenInfo3('');
      settokenInfo4('');
      settokenOwner('')
      setwaitAlert("Wait!!!");
  
      let provider = new DefaultProvider({network: homenetwork});
//      await provider.connect()

      let tx3 = new bsv.Transaction

      //Place here the TXID of the current state of the contract

      //tx3 = await provider.getTransaction(txIdRet.current.value);

      let currentTIXD = txIdRet.current.value
      

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
      //let price = await exchangeRate()
      //console.log('BSV price (100000000 sats): ', price[0].rate * 1 + ' $USD')
      //console.log('BSV price (100000000 sats): ', price[0].rate * 100 + ' $C')
      //console.log('BSV price (100000000 sats): ', price[0].rate * 100000 + ' 0.001 $C')
      //console.log('BSV price (100000000 sats): ', price[0].rate * 100000000 + ' 0.000001 $C')


      let dataTX = toHex(tx3.outputs[0].script.toHex())


      let getData = tx3.outputs[0].script.toHex()
      let getDataASM = tx3.outputs[0].script.toASM()

      console.log('Script Hash: ', hexToLittleEndian(sha256(getData)))

      let timestamper = 0;

      let scriptHistoty = await scriptHistory(hexToLittleEndian(sha256(getData)), homenetwork)

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


      //Primeira Busca no Formato ASM por OP_RETURN Token
      let index: number = getDataASM.indexOf('OP_RETURN');

      let fileType = ''

      let tokenType = false;
      let defaultData = false;

      ///////////////////////////////////////
      //Primeiro Verifica se é Odd Or Even Contract
      ///////////////////////////////////////
      if(props.passedData === 'OoE')
      {
        let posNew1 = 0 // Output Index of the Contract in the Current State TX

        //if(gptIndex.current.value === '1')
        {
          //posNew1 = 1
        }
        //let instance2 = GeneralToken.fromTx(tx3, posNew1)

        let instance2 // = GeneralTokenV2.fromTx(tx3, posNew1)

        {
          instance2 = OddOrEvenContract.fromTx(tx3, posNew1)
        }

        let stxos = await getSpentOutput(currentTIXD, posNew1, homenetwork)

        let tokenStateSC = 'Current'

        console.log('*********************************: ', tokenStateSC)
    
        if(stxos[0].inputIndex !== -1)
        {
          tokenStateSC = 'Past'
          console.log('*********************************: ', tokenStateSC)
        }

        settokenInfo('Hash P1 = '+ instance2.hashOptionP1);

        let oddnessP1: string = instance2.isOddP1? "Odd": "Even" 

        settokenInfo2(' Oddness P1 = ' + oddnessP1
        + '; nTimeLock Contract = ' + instance2.nLockTime  );


        settokenInfo3(' P2 = ' + instance2.optionP2  
          + '; state = ' + tokenStateSC 
          + '; STAMP = ' + timestamper
          + ' )');

        if(tokenStateSC === 'Current')
        {

          if(instance2.optionP2 === -1n)
          {
            settokenInfo4('Not Accepted Yet: ( Timout Player 1: ' + instance2.timeOutP1
            + ' )');

          }
          else
          {

            settokenInfo4('Accepted: ( Timout Player 2: ' + instance2.timeOutP2
            + ' )') 

          }


        }

        //settokenOwner('Owner Add: ' + bsv.Address.fromPublicKey(bsv.PublicKey.fromHex(instance2.alice), homenetwork))
        settokenOwner('Player 1 Add: ' + bsv.Address.fromPublicKeyHash(hexToBytes(instance2.player1Add), homenetwork))
        settokendescription('Player 2 Add: ' + bsv.Address.fromPublicKeyHash(hexToBytes(instance2.player2Add), homenetwork))
    
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
          setwaitAlert("Contract Details!!!");

          console.log("download file: ", downloadFile)
          console.log("File Type: ", fileType)

        }
        else if(bytes.length === 0) // Para GPToken Vazio
        {
          setdownloadFile(true)
          setwaitAlert("No Data in the Token!!!");

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

    <div className="App-header">
      <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '0px'}}>

        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          
        Odd or Even Contract
      </h2>
      
      {
        /*
        props.passedData === "GPToken" && tokenOwner === ''?

        <a href='https://medium.com/@cktcracker/retrieving-data-content-from-a-token-ab116024a94f' target="_blank" rel="noopener noreferrer"
        style={{ fontSize: '14px', paddingBottom: '20px', color: 'yellow' }}>
          Instructions of Use
        </a>
        
        :
        ''
        */
      }

      <div>
        <div className="label-container" style={{ fontSize: '14px', paddingBottom: '0px', paddingTop: '0px' }}>
                  <p className="responsive-label" style={{ fontSize: '12px' }}>TXID to Retrieve: {' '} </p>
        </div>

        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={txIdRet} type="hex" name="PVTKEY1" min="1" placeholder="txid (on chain)" />
              </label>     
          </div>

        <div>
        
      </div>

      </div>

      <div>
          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
              
              <button className="insert" onClick={readFromChain}
                  style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
              >Read</button>

          </div>
      </div>



      {
        props.passedData !== 'GPToken' && tokenOwner !== ''?
          <div>
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenInfo} </p>
            </div>
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenInfo2} </p>
            </div>            
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenInfo3} </p>
            </div>           
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenInfo4} </p>
            </div>            
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
          <div></div>
      }           



    </div>
  );
};

export default Page03Read;