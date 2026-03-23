// src/components/Home.tsx
import React, {FC, JSX} from 'react';
import ReactDOMServer from 'react-dom/server';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, PubKeyHash } from "scrypt-ts";
import './App.css';
import { pvtkey } from './globals';

import { broadcast, getSpentOutput, listUnspent, scriptHistory, scriptHistoryUnc } from './mProviders';
import { hexToBytes, hexToLittleEndian } from './myUtils';

import Page03ReadMarketPlace from './Page03ReadMarketPlace';
import { homepvtKey, homenetwork, compState, utxoFeeAdd0 } from './Home';
//import ThisPage from './PageSC15MarketPlace';


//export let homepvtKey: string = "";
//export let homenetwork = bsv.Networks.testnet;
//export let compState = true;
export let buyTXID: string = "";

let labelElements: JSX.Element[] = [];
let cont1 = 0


//const provider = new DefaultProvider({network: homenetwork});
let signer: TestWallet;

let labels = ['Label 1', 'Label 2', 'Label 3', '', '', '', '', '', '', '', '', '', ''];
let pageNum = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];


const PageSC15MarketPlace: FC = () => {

  const [waitAlert, setwaitAlert] = useState("Loading Orders ... Wait!!!");

//  const [hexpvtkey, sethexpvtkey] = useState("");
//  const [pvtkeyAlert, setpvtkeyAlert] = useState("");
//  const [pvtkeyAlert02, setpvtkeyAlert02] = useState("");
//  const [pvtkeyAlert03, setpvtkeyAlert03] = useState("");

//  const [txidLabel, settxidLabel] = useState("");


//  let localPvtKey = useRef<any>(null);

  const [currentPage, setCurrentPage] = useState<string>('home00WeBSVmenu');
  const [showReadDropdown, setShowReadDropdown] = useState<boolean>(false);

  labelElements = [];


  //<div style={{ textAlign: 'center', paddingBottom: '20px' }}>
  //<label htmlFor="checkbox" onClick={() => handlePageChange(pageNum[i], labels[i])} 
  //for (let i = 0; i < labels.length; i++) {
  for (let i = (labels.length - 1); i >= 0 ; i--) {  
    const labelElement = (
      
      <div key={i}>
        
        <div className="label-container" style={{display: 'flex', flexDirection: 'row', textAlign: 'center', paddingBottom: '20px' }}>
              
              <label className="responsive-label" htmlFor="checkbox" onClick={() => handlePageChange(pageNum[i], labels[i])} 
                    style={{ fontSize: '14px', paddingBottom: '2px', color: 'yellow' }}
                >{labels[i]}  
              </label>     
        </div>
        {currentPage === pageNum[i] && <Page03ReadMarketPlace passedData={'GPToken'}/>}

      </div>
        
    );
    if(labels[i] !== '')
    {
      labelElements.push(labelElement);
    }
    
    //console.log('Page 444: ', pageNum[i])
  }
  //console.log('Label Elements 444: ', labelElements)
  const labelElementsHtml = ReactDOMServer.renderToStaticMarkup(<div>{labelElements}</div>);

  //console.log('labelElements HTML:', labelElementsHtml);


  //console.log('Label Elements 111: ', labelElements)



  cont1 ++;
  //console.log('Cont 1::::::::::::::::: ', cont1)



  let cont = 0


  //Apresentar o Balance do Endereço
  
  useEffect(() => {
    //console.log("Call useEffect")

    //txIdRet.current = 'daa4c76b7385242529ae0c11735e914f25e466e8ec880b2b5750cb6e50a70aa6';
    if(cont === 0)
    {    //readFromChain(0);

      //console.log('Entrou aqui.....')
      //settxidLabel('daa4c76b7385242529ae0c11735e914f25e466e8ec880b2b5750cb6e50a70aa6');
      handleInit();
    }
    cont++
    
  }, []); 


  const handleInit = async () => {

    setwaitAlert("Loading Orders ... Wait!!!")
   
    //console.log("Add : ", utxoFeeAdd1)
    //console.log(PubKeyHash(toHex(bsv.Address.fromString(utxoFeeAdd1).hashBuffer)))
    //console.log((toHex(bsv.Address.fromString(utxoFeeAdd1).hashBuffer)))
    let addScritpHash = '76a914'+ (toHex(bsv.Address.fromString(utxoFeeAdd0).hashBuffer)) + '88ac'
    //console.log("Add Script: ", addScritpHash)
    //console.log("Add SHA256: ", sha256(addScritpHash))
    addScritpHash = hexToLittleEndian(sha256(addScritpHash))
    //console.log("Add SH: ", addScritpHash)

    //1ba61b4066d116c9ba37e069a230653ef24791ea7085ce3e305376411a0b84ef

    let txsConf = await scriptHistory(addScritpHash, homenetwork)
    let txsUnConf = await scriptHistoryUnc(addScritpHash, homenetwork)

    //console.log("History Conf: ", await scriptHistory(addScritpHash, homenetwork))
    //console.log("History: UnConf", await scriptHistoryUnc(addScritpHash, homenetwork))

    console.log("History Conf: ", txsConf)
    console.log("History: UnConf", txsUnConf)

    /*
    for(let i = 0; i < txsConf.length; i ++)
    {
      console.log("Tx History: ", txsConf[i].txId)
    }

    for(let i = 0; i < txsUnConf.length; i ++)
    {
      console.log("Tx History: ", txsUnConf[i].txId)
    }
    */

    //console.log("History Conf: ", await scriptHistory('1ba61b4066d116c9ba37e069a230653ef24791ea7085ce3e305376411a0b84ef', homenetwork))
    //console.log("History: UnConf", await scriptHistoryUnc('1ba61b4066d116c9ba37e069a230653ef24791ea7085ce3e305376411a0b84ef', homenetwork))


    //labels = ['daa4c76b7385242529ae0c11735e914f25e466e8ec880b2b5750cb6e50a70aa6', 
    //'daa4c76b7385242529ae0c11735e914f25e466e8ec880b2b5750cb6e50a70aa6', 
    //'daa4c76b7385242529ae0c11735e914f25e466e8ec880b2b5750cb6e50a70aa6'];

    let i = 0

    for(let j = 0; j < txsConf.length; j ++)
    {
      let stxos = await getSpentOutput(txsConf[j].txId, 0, homenetwork)
  
      if((stxos[0].inputIndex === -1) && (i < labels.length))
      {
        labels[i] = txsConf[j].txId
        i++
      }
      setwaitAlert("Loading Orders ... verifying: " + i + ' / ' + (txsConf.length + txsUnConf.length))
    }

    for(let j = 0; j < txsUnConf.length; j ++)
    {
      console.log("Tx History: ", txsUnConf[j].txId)

      let stxos = await getSpentOutput(txsUnConf[j].txId, 0, homenetwork)
  
      if((stxos[0].inputIndex === -1) && (i < labels.length))
      {
        labels[i] = txsUnConf[j].txId
        i++
      }
      setwaitAlert("Loading Orders ... verifying: " + i + ' / ' + (txsConf.length + txsUnConf.length))
    }

    for( ; i < labels.length; i ++)
    {
      //labels[i] = 'daa4c76b7385242529ae0c11735e914f25e466e8ec880b2b5750cb6e50a70aa6'
      labels[i] = ''
    }
    setwaitAlert('')

  };

  const handlePageChange = async (page: string, txidBuy: string) => {

    //console.log('Page enter.....: ', page)

    buyTXID = txidBuy

    if(buyTXID.length !== 64)
      buyTXID = 'daa4c76b7385242529ae0c11735e914f25e466e8ec880b2b5750cb6e50a70aa6'

    setCurrentPage(page);
    setShowReadDropdown(false);

  };

  return (

    <div className="App-header">
      <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        {
          //'P2P Token '
          'P2P Token - Market Place'
        }
        
      </h2>

      <div>
        {/*
          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                
                <label htmlFor="checkbox" onClick={() => handlePageChange('MPlaceList10', txidLabel)} 
                      style={{ fontSize: '14px', paddingBottom: '2px' }}
                  >{txidLabel}  
                </label>     
          </div>

          {currentPage === 'MPlaceList10' && <Page03ReadMarketPlace passedData={'GPToken'}/>}

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                
                <label htmlFor="checkbox" onClick={() => handlePageChange('MPlaceList20', txidLabel)} 
                      style={{ fontSize: '14px', paddingBottom: '2px' }}
                  >{txidLabel} + TXID 2  
                </label>     
          </div>

          {currentPage === 'MPlaceList20' && <Page03ReadMarketPlace passedData={'GPToken'}/>}

          
        */}
        </div>
        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                
                <label style={{ fontSize: '14px', paddingBottom: '2px', color: 'lightgreen' }}
                  > Click on the Order for Details  
                </label>     
        </div>

        <div>
          {
            waitAlert === ''?
          
              labelElements
            :
            <div style={{ textAlign: 'center', paddingBottom: '20px' }}>  
              <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                >{waitAlert}  
              </label>     
            </div>
              
          }
         </div>

    </div>
  );
};

export default PageSC15MarketPlace;