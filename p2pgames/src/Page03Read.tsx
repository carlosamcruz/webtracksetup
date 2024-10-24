// src/components/Home.tsx
import React, {FC} from 'react';


import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, ByteString } from "scrypt-ts";
import './App.css';


import {homepvtKey, homenetwork, compState} from './Home';
import { broadcast, getSpentOutput, getTransaction, listUnspent, scriptHistory, exchangeRate } from './mProviders';

import { OddOrEvenContract } from "./contracts/oddOrEvenContract";

import { mPlaceTokenTemplate, erroSC, hexToLittleEndian, scriptUxtoSize, convertBinaryToHexString } from "./myUtils";

import { fileTypeFromData, hexToBytes} from "./myUtils";


interface props1 {
  passedData: string;
}


//const Page03Read: FC = () => {
const Page03Read: FC<props1> = (props) => {

  //const [linkUrl, setLinkUrl] = useState('https://whatsonchain.com/');
  const [linkUrl, setLinkUrl] = useState("");
  const [txid, setTXID] = useState("");
  const [currentTxid, setcurrentTxid] = useState("");

  const [txStamp, settxStamp] = useState("");

  const [downloadFile, setdownloadFile] = useState(false);

  const [waitAlert, setwaitAlert] = useState("Inform the TXID to Start");

  const [txb, settxb] = useState(true);

  const [tokenInfo, settokenInfo] = useState('');
  const [tokenInfo2, settokenInfo2] = useState('');
  const [tokenInfo3, settokenInfo3] = useState('');
  const [tokenInfo4, settokenInfo4] = useState('');
  const [tokenInfo5, settokenInfo5] = useState('');
  const [tokenInfo6, settokenInfo6] = useState('');
  const [tokenInfo7, settokenInfo7] = useState('');
  const [tokenInfo8, settokenInfo8] = useState('');

  const [tokenOwner, settokenOwner] = useState('');
  const [tokenDescription, settokendescription] = useState('');

  const [hexStrFileData, setHexString] = useState('');

  const [txidFlag, settxidFlag] = useState('');

  let txIdRet = useRef<any>(null);

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
  
      let tx3 = new bsv.Transaction

      let txPrev = new bsv.Transaction

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

      console.log('Test TX3: ', tx3.id)

      let dataTX = toHex(tx3.outputs[0].script.toHex())

      //Odd or Even P2P Contract = 4f6464206f72204576656e2050325020436f6e7472616374

      console.log("tx3.inputs[0].prevTxId: ", tx3.inputs[0].prevTxId.toString("hex"))
      console.log("tx3.inputs[0]._scriptBuffer: ", tx3.inputs[0]._scriptBuffer)
      console.log("tx3.inputs[0]._scriptBuffer: ", tx3.inputs[0]._scriptBuffer.toString('hex'))

      let unlockingScript = tx3.inputs[0]._scriptBuffer.toString('hex');

      settokenInfo6("");
      settokenInfo7("");
      settokenInfo8("")

      if(unlockingScript.indexOf("4f6464206f72204576656e2050325020436f6e7472616374") !== -1 && tx3.outputs[0].script.toHex().length === 50)
      {
        if(unlockingScript.substring(0,2) !== "20"){
          settokenInfo6("No result presented by player 1");
        }
        else{
          settokenInfo6("Game Key = "+ unlockingScript.substring(2,66));
          let choiceP1 = unlockingScript.substring(66,68)

          let p1Choice = 0;

          if(parseInt(choiceP1, 16) <= parseInt("4b", 16)){
            if(parseInt(choiceP1, 16) === 0)
              p1Choice = 0;
            else{
              let choiceP1Here = unlockingScript.substring(68, 68 + 2*parseInt(choiceP1, 16))
              p1Choice = parseInt(hexToLittleEndian(choiceP1Here), 16);
            }
          }
          else{
            p1Choice = parseInt(choiceP1, 16) - parseInt("50", 16);
          }
          settokenInfo7("Result Presented: Choice P1 = "+ p1Choice);
        }
        txPrev = new bsv.Transaction (await getTransaction(tx3.inputs[0].prevTxId.toString("hex"), homenetwork));
        console.log("Odd or Even P2P Contract = 4f6464206f72204576656e2050325020436f6e7472616374")
        settokenInfo8("Prized Add = "
          + bsv.Address.fromPublicKeyHash(hexToBytes(tx3.outputs[0].script.toHex().substring(6, 6 + 40)), homenetwork));

      }


      let getData = tx3.outputs[0].script.toHex()
      let getDataPrev = tx3.outputs[0].script.toHex()
      let getDataASM = tx3.outputs[0].script.toASM()

      console.log('Script Hash: ', hexToLittleEndian(sha256(getData)))

      console.log("tx3.outputs[0].satoshis: ", tx3.outputs[0].satoshis)

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


      ///////////////////////////////////////
      //Primeiro Verifica se é Odd Or Even Contract
      ///////////////////////////////////////
      if(props.passedData === 'OoE')
      //if(props.passedData === 'OoE' && getData.indexOf("4f6464206f72204576656e2050325020436f6e7472616374") !== -1)  
      {
        let posNew1 = 0 // Output Index of the Contract in the Current State TX

        let instance2 // = GeneralTokenV2.fromTx(tx3, posNew1)

        //Checa se o contrato é do tipo "Odd or Even P2P Contract = 4f6464206f72204576656e2050325020436f6e7472616374"
        if(getData.indexOf("4f6464206f72204576656e2050325020436f6e7472616374") !== -1){
          instance2 = OddOrEvenContract.fromTx(tx3, posNew1);
        }
        else{
          instance2 = OddOrEvenContract.fromTx(txPrev, posNew1);
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


        settokenInfo3(' Choice P2 = ' + instance2.optionP2  
          + '; state = ' + tokenStateSC 
          + '; STAMP = ' + timestamper);


        settokenInfo5('Contract Amount = ' + tx3.outputs[0].satoshis + " satoshis");
  
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
        else settokenInfo4('Check next state for update')

        //settokenOwner('Owner Add: ' + bsv.Address.fromPublicKey(bsv.PublicKey.fromHex(instance2.alice), homenetwork))
        settokenOwner('Player 1 Add: ' + bsv.Address.fromPublicKeyHash(hexToBytes(instance2.player1Add), homenetwork))
        settokendescription('Player 2 Add: ' + bsv.Address.fromPublicKeyHash(hexToBytes(instance2.player2Add), homenetwork))

        setwaitAlert("");
    
      }  
      else{
        setwaitAlert("Not Odd or Even P2P Contract");
      }

    }

  };


  return (

    <div className="App-header">
      <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '0px'}}>

        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          
        Odd or Even Contract
      </h2>
      
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
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenInfo5} </p>
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
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenInfo7} </p>
            </div>
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenInfo6} </p>
            </div>
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '0px' }}>
                <p className="responsive-label" style={{ fontSize: '12px' }}>{tokenInfo8} </p>
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