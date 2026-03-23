import React, { useRef, FC, useState } from 'react';
//import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import logo from './logo.svg';
import './App.css';

import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString } from "scrypt-ts";
import { Helloworld02 } from "./contracts/helloworld02";

import PageSC01HelloWorld from "./PageSC01HelloWorld";
import PageSC02HelloWorld from "./PageSC02HelloWorld";
import PageSC03CouterDep from "./PageSC03CouterDep";
import PageSC04CounterInc from "./PageSC04CounterInc"
import PageSC05CounterDec from "./PageSC05CounterDec"
import PageSC06CounterFinish from "./PageSC06CounterFinish"

import PageSC07GPTokenCreate from "./PageSC07GPTokenCreate"
import PageSC07GPTokenCreateECDSA from "./PageSC07GPTokenCreateECDSA"
import PageSC07GPTokenCreateRABIN from "./PageSC07GPTokenCreateRABIN"
import PageSC07GPTokenCreateECDSAmin from "./PageSC07GPTokenCreateECDSAmin"


import PageSC08GPTDataSet from "./PageSC08GPTDataSet"
import PageSC08GPTDataSetECDSA from "./PageSC08GPTDataSetECDSA"
import PageSC08GPTDataSetRABIN from "./PageSC08GPTDataSetRABIN"
import PageSC08GPTDataSetECDSAmin from "./PageSC08GPTDataSetECDSAmin"

import PageSC14GPTokenMelt from "./PageSC14GPTokenMelt"
import PageSC14GPTokenMeltECDSA from "./PageSC14GPTokenMeltECDSA"
import PageSC14GPTokenMeltRABIN from "./PageSC14GPTokenMeltRABIN"
import PageSC14GPTokenMeltECDSAmin from "./PageSC14GPTokenMeltECDSAmin"


import PageSC09GPTokenSplit from "./PageSC09GPTokenSplit"
import PageSC09GPTokenSplitECDSA from "./PageSC09GPTokenSplitECDSA"
import PageSC09GPTokenSplitRABIN from "./PageSC09GPTokenSplitRABIN"
import PageSC09GPTokenSplitECDSAmin from "./PageSC09GPTokenSplitECDSAmin"



import PageSC10GPTokenMerge from "./PageSC10GPTokenMerge"
import PageSC10GPTokenMergeECDSA from "./PageSC10GPTokenMergeECDSA"
import PageSC10GPTokenMergeRABIN from "./PageSC10GPTokenMergeRABIN"
import PageSC10GPTokenMergeECDSAmin from "./PageSC10GPTokenMergeECDSAmin"


import PageSC11GPTokenOrdLock from "./PageSC11GPTokenOrdLock"
import PageSC11GPTokenOrdLockECDSA from "./PageSC11GPTokenOrdLockECDSA"
import PageSC11GPTokenOrdLockRABIN from "./PageSC11GPTokenOrdLockRABIN"
import PageSC11GPTokenOrdLockECDSAmin from "./PageSC11GPTokenOrdLockECDSAmin"


import PageSC12GPTokenCancelOrd from "./PageSC12GPTokenCancelOrd"
import PageSC12GPTokenCancelOrdECDSA from "./PageSC12GPTokenCancelOrdECDSA"
import PageSC12GPTokenCancelOrdRABIN from "./PageSC12GPTokenCancelOrdRABIN"
import PageSC12GPTokenCancelOrdECDSAmin from "./PageSC12GPTokenCancelOrdECDSAmin"


import PageSC13GPTokenBuy from "./PageSC13GPTokenBuy"
import PageSC13GPTokenBuyECDSA from "./PageSC13GPTokenBuyECDSA"
import PageSC13GPTokenBuyRABIN from "./PageSC13GPTokenBuyRABIN"
import PageSC13GPTokenBuyECDSAmin from "./PageSC13GPTokenBuyECDSAmin"



import Home from './Home';
//import HomeUser from './HomeUser';
import Home00WeBSVmenu from './Home00WeBSVmenu';

import Home01pw2pvtkey from './Home01pw2pvtkey';
import Home01pw2pvtkeyUser from './Home01pw2pvtkeyUser';

import Home02HexToWIF from './Home02HexToWIF'

import {homepvtKey} from './Home';
import TodoList from './TodoList';
import Page01TX from './Page01TX';
import Page02Write from './Page02Write';
import Page03Read from './Page03Read';
import Page04UtxoL from './Page04UtxoL';
import Page05P2PKC from './Page05P2PKC';
import Page06P2PK2P2PK from './Page06P2PK2P2PK';
import Page07p2pk2p2pkh from './Page07p2pk2p2pkh';
import Page08TXDidactic from './Page08TXDidactic';
import Page09SigForge from './Page09SigForge';
import Page09SigAlt from './Page09SigAlt';
import Page10Sig2QA from './Page10Sig2QA';
import Page11SigVerify from './Page11SigVerify';

import Page12TokenDCreate from './Page12TokenDCreate';
import Page12TokenDCreateV2 from './Page12TokenDCreateV2';
import Page12TokenDCreateUTXOattack from './Page12TokenDCreateUTXOAttack';

import Page13TokenDReshape from './Page13TokenDReshape';
import Page14TokenDTransfer from './Page14TokenDTransfer';
import Page14TokenDTransferV2 from './Page14TokenDTransferV2';

import Page15TokenDMelt from './Page15TokenDMelt';
import Page15TokenDMeltV2 from './Page15TokenDMeltV2';

import Page16TokenOLock from './Page16TokenOLock';
import Page17TokenLockSC from './Page17TokenLockSC';
import Page18TokenLockCancel from './Page18TokenLockCancel';
import Page19TokenBuy from './Page19TokenBuy';

import PageSC15MarketPlace from './PageSC15MarketPlace';



import TodoList02 from './TodoList02';
import { pvtkey } from './globals';


const provider = new DefaultProvider({network: bsv.Networks.testnet});
let Alice: TestWallet
let signerExt: TestWallet
const privateKey = bsv.PrivateKey.fromHex("79342a4c317817a80a298fe116147a74e4e90912a4f321e588a4db67204e29b0", bsv.Networks.testnet)   

function App() {
//const App: FC = () => {  

//const [currentPage, setCurrentPage] = useState<string>('home');

//const handlePageChange = (page: string) => {
//  setCurrentPage(page);
//};

  const [currentPage, setCurrentPage] = useState<string>('home00WeBSVmenu');
  const [showHomeDropdown, setShowHomeDropdown] = useState<boolean>(false);
  const [showHomePVTKeyDropdown, setShowHomePVTKeyDropdown] = useState<boolean>(false);

  const [showWebSVDropdown, setShowWebSVDropdown] = useState<boolean>(false);


  const [showTodoDropdown, setShowTodoDropdown] = useState<boolean>(false);
  const [showHWDropdown, setShowHWDropdown] = useState<boolean>(false);
  const [showSCDropdown, setShowSCDropdown] = useState<boolean>(false);

  const [showGPTDropdown, setShowGPTDropdown] = useState<boolean>(false);

  const [showGPTECDSADropdown, setShowGPTECDSADropdown] = useState<boolean>(false);
  const [showGPTECDSAminDropdown, setShowGPTECDSAminDropdown] = useState<boolean>(false);
  const [showGPTRABINDropdown, setShowGPTRABINDropdown] = useState<boolean>(false);


  const [showMPlaceDropdown, setShowMPlaceDropdown] = useState<boolean>(false);


  const [showContDropdown, setShowContDropdown] = useState<boolean>(false);
  const [showUTXODropdown, setShowUTXODropdown] = useState<boolean>(false);
  const [showP2PKCDropdown, setShowP2PKCDropdown] = useState<boolean>(false);
  const [showP2PK2P2PKDropdown, setShowP2PK2P2PKDropdown] = useState<boolean>(false);
  const [showSendDropdown, setShowSendDropdown] = useState<boolean>(false);
  const [showDataDropdown, setShowDataDropdown] = useState<boolean>(false);
  const [showDTRDropdown, setShowDTRDropdown] = useState<boolean>(false);
  const [showDTDDropdown, setShowDTDDropdown] = useState<boolean>(false);
  const [showDTDaddDropdown, setShowDTDaddDropdown] = useState<boolean>(false);
  const [showDdtcDropdown, setShowDdtcDropdown] = useState<boolean>(false);
  const [showDTOrdDropdown, setShowDTOrdDropdown] = useState<boolean>(false);
  const [showPVTKEYFORMDropdown, setShowPVTKEYFORMDropdown] = useState<boolean>(false);
  const [showOrderLockDropdown, setShowOrderLockDropdown] = useState<boolean>(false);

  const [showStampsDropdown, setShowStampsDropdown] = useState<boolean>(false);





  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setShowHomeDropdown(false);
    setShowHomePVTKeyDropdown(false);

    setShowTodoDropdown(false);
    setShowHWDropdown(false);
    setShowSCDropdown(false);
    setShowContDropdown(false);
    setShowUTXODropdown(false);
    setShowP2PKCDropdown(false);
    setShowP2PK2P2PKDropdown(false);
    setShowSendDropdown(false);
    setShowDataDropdown(false);
    setShowDTRDropdown(false);
    setShowDTDDropdown(false);
    setShowDTDaddDropdown(false);
    setShowDdtcDropdown(false);
    setShowDTOrdDropdown(false)
    setShowPVTKEYFORMDropdown(false);
    setShowGPTDropdown(false);
    setShowGPTECDSADropdown(false);
    setShowGPTECDSAminDropdown(false);
    setShowGPTRABINDropdown(false);
    setShowMPlaceDropdown(false);
    setShowOrderLockDropdown(false);

    setShowStampsDropdown(false)
  };


  const handleButtonClick = (urlStr: string) => {
    // Define the site URL you want to navigate to
    let siteUrl = 'https://medium.com/@cktcracker/general-purpose-token-gptoken-6e4a06c3f01e'; // Replace with your desired site URL

    if(urlStr === 'GPToken00')
    {
      siteUrl = 'https://medium.com/@cktcracker/general-purpose-token-gptoken-6e4a06c3f01e'; // Replace with your desired site URL

    }
  
    // Open the site in a new tab or window
    window.open(siteUrl, '_blank');
  };

  const deploy = async (amount: any) => {

    Alice = new TestWallet(privateKey, provider)

    try {

      const signer = Alice
      const message = toByteString('hello world', true)
      const instance = new Helloworld02(sha256(message))
      //const instance = new Helloworld02(0n)
      
      await instance.connect(signer);
          
      //const deployTx = await instance.deploy(100)


      const deployTx = new bsv.Transaction(await instance.deploy(amount));

      console.log('Helloworld contract deployed: ', deployTx.id)
      alert('deployed: ' + deployTx.id)

    } catch (e) {
      console.error('deploy HelloWorld failes', e)
      alert('deploy HelloWorld failes')
    }
  };


  const interact = async (amount: any) => {

    Alice = new TestWallet(privateKey, provider)

    try {

      const signer = Alice
      const message = toByteString('hello world', true)
      let tx = new bsv.Transaction
      tx = await provider.getTransaction(txid.current.value)
  
      console.log('Current State TXID: ', tx.id)

      const instance = Helloworld02.fromTx(tx, 0) 
      await instance.connect(signer)
  
      const { tx: callTx } = await instance.methods.unlock(message)
      console.log('Helloworld contract `unlock` called: ', callTx.id)
      alert('unlock: ' + callTx.id)
  
    } catch (e) {
      console.error('deploy HelloWorld failes', e)
      alert('deploy HelloWorld failes')
    }
  };

  const txid = useRef<any>(null);

  return (


        <div className="App">

            <nav className="navbar">
              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSendDropdown(false); setShowHWDropdown(false); setShowHomeDropdown(!showHomeDropdown); 
                                    setShowTodoDropdown(false);setShowSCDropdown(false);setShowPVTKEYFORMDropdown(false); 
                                    setShowDdtcDropdown(false); setShowGPTDropdown(false); 
                                    setShowOrderLockDropdown(false); setShowMPlaceDropdown(false);
                                    setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                                    setShowGPTECDSAminDropdown(false)}}>
                  Home
                </button>
                {showHomeDropdown && (
                  <div className="dropdown-content">

                    <button className="dropdown-button" onClick={() => handlePageChange('home')}>
                      Access
                    </button>

                    <button className="dropdown-button" onClick={() => handlePageChange('homeUser')}>
                      Acesso Rápido
                    </button>

                    <button className="dropdown-button" onClick={() => handlePageChange('home01PvtKeyUser')}>
                      Novo Usuário
                    </button>

                    <button className="dropdown-button" onClick={() => handlePageChange('home01PvtKey')}>
                      New PvtKey
                    </button>

                    <button className="dropdown-button" 
                          onClick={() => {setShowPVTKEYFORMDropdown(!showPVTKEYFORMDropdown); setShowSendDropdown(false); 
                          setShowDdtcDropdown(false); setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                          setShowGPTECDSAminDropdown(false) }}>
                        PvtKey Formats
                    </button>
                      {showPVTKEYFORMDropdown && (
                        <div className="button">

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home02HexToWIF')}>
                            Hex to WIF
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home02WIFToHex')}>
                            WIF to Hex
                          </button>
                        </div>
                    )}


                    <button className="dropdown-button" 
                          onClick={() => {setShowDdtcDropdown(!showDdtcDropdown); setShowSendDropdown(false); 
                          setShowPVTKEYFORMDropdown(false); setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                          setShowGPTECDSAminDropdown(false) }}>
                        Didactic
                    </button>
                      {showDdtcDropdown && (
                        <div className="button">

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home25')}>
                            TrueR Token
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home26')}>
                            TrueD Token
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home27')}>
                            Melt True Token
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home25UTXOattack')}>
                            UTXO Replay
                          </button>
                          
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home09')}>
                            preimage
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home10b')}>
                            ecdsa Bitcoin
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home10')}>
                            ecdsa forgery
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home11')}>
                            ecdsa-pbk
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home12')}>
                            ecdsa verify
                          </button>
                        </div>
                    )}



                    {/*



                    <button className="dropdown-button" 
                          onClick={() => {setShowSendDropdown(!showSendDropdown); setShowDdtcDropdown(false) }}>
                        Send Satoshis
                    </button>
                      {showSendDropdown && (
                        <div className="button">
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home02')}>
                            p2pkh-p2pkh
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home06')}>
                            p2pkh-p2pk
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home07')}>
                            p2pk-p2pk
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home07')}>
                            p2pk-p2pkh
                          </button>
                        </div>
                    )}

                */}

                    <button className="dropdown-button" onClick={() => handlePageChange('home00WeBSVmenu')}>
                      Reception
                    </button>


                  </div>
                )}
              </div>

              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSendDropdown(false); setShowHWDropdown(false); setShowTodoDropdown(!showTodoDropdown); 
                                    setShowHomeDropdown(false); setShowSCDropdown(false);setShowPVTKEYFORMDropdown(false); 
                                    setShowDdtcDropdown(false); setShowGPTDropdown(false); 
                                    setShowOrderLockDropdown(false); setShowMPlaceDropdown(false);
                                    setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                                    setShowGPTECDSAminDropdown(false); setShowDTDDropdown(false); setShowDTDaddDropdown(false)}}>
                  Satoshi to Peer
                </button>
                {showTodoDropdown && (
                  <div className="dropdown-content">

                      <button className="dropdown-button" 
                          onClick={() => {setShowSendDropdown(!showSendDropdown); setShowDTDDropdown(false); setShowDataDropdown(false); 
                          setShowDTRDropdown(false); setShowDTOrdDropdown(false); setShowOrderLockDropdown(false); 
                          setShowStampsDropdown(false); setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                          setShowGPTECDSAminDropdown(false); setShowDTDaddDropdown(false)}}>
                        Send Satoshis
                      </button>
                      {showSendDropdown && (
                        <div className="button">
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home02')}>
                            p2pkh-p2pkh
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home06')}>
                            p2pkh-p2pk
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home07')}>
                            p2pk-p2pk
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home08')}>
                            p2pk-p2pkh
                          </button>
                        </div>
                      )}

                      <button className="dropdown-button" 
                          onClick={() => {setShowDataDropdown(!showDataDropdown); setShowDTDDropdown(false); setShowSendDropdown(false); 
                          setShowDTRDropdown(false); setShowDTOrdDropdown(false); setShowOrderLockDropdown(false); 
                          setShowStampsDropdown(false); setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                          setShowGPTECDSAminDropdown(false); setShowDTDaddDropdown(false)}}>
                        Data on Chain
                      </button>
                      {showDataDropdown && (
                        <div className="button">

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home03')}>
                            Write Data
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home04')}>
                            Read Data
                          </button>

                        </div>
                      )}

                      <button className="dropdown-button" 
                          onClick={() => {setShowDTRDropdown(!showDTRDropdown); setShowDTDDropdown(false); setShowSendDropdown(false); 
                          setShowDataDropdown(false); setShowDTOrdDropdown(false); 
                          setShowOrderLockDropdown(false); setShowStampsDropdown(false); 
                          setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                          setShowGPTECDSAminDropdown(false); setShowDTDaddDropdown(false)}}>
                        Return Token
                      </button>
                      {showDTRDropdown && (
                        <div className="button">

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home17')}>
                            Create
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home18')}>
                            Reshape
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home19')}>
                            Transfer
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home20')}>
                            Melt
                          </button>

                        </div>
                      )}

                      <button className="dropdown-button" 
                          onClick={() => {setShowDTDDropdown(!showDTDDropdown); setShowDTRDropdown(false); setShowSendDropdown(false); 
                          setShowDataDropdown(false); setShowDTOrdDropdown(false); 
                          setShowOrderLockDropdown(false); setShowStampsDropdown(false); 
                          setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                          setShowGPTECDSAminDropdown(false); setShowDTDaddDropdown(false)}}>
                        Drop Token
                      </button>
                      {showDTDDropdown && (
                        <div className="button">

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home13')}>
                            Create
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home14')}>
                            Reshape
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home15')}>
                            Transfer
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home16')}>
                            Melt
                          </button>
                          
                        </div>
                      )}

                      <button className="dropdown-button" 
                          onClick={() => {setShowDTDaddDropdown(!showDTDaddDropdown); setShowDTRDropdown(false); setShowSendDropdown(false); 
                          setShowDataDropdown(false); setShowDTOrdDropdown(false); 
                          setShowOrderLockDropdown(false); setShowStampsDropdown(false); 
                          setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                          setShowGPTECDSAminDropdown(false); setShowDTDDropdown(false)}}>
                        Drop Auto Token
                      </button>
                      {showDTDaddDropdown && (
                        <div className="button">

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home13add')}>
                            Create
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home15add')}>
                            Send
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home16add')}>
                            Melt
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home04')}>
                            Details
                          </button>
                          
                        </div>
                      )}


                      <button className="dropdown-button" 
                          onClick={() => {setShowDTOrdDropdown(!showDTOrdDropdown); setShowDTDDropdown(false); setShowDTRDropdown(false); 
                          setShowSendDropdown(false); setShowDataDropdown(false); setShowOrderLockDropdown(false); 
                          setShowStampsDropdown(false); setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                          setShowGPTECDSAminDropdown(false); setShowDTDaddDropdown(false) }}>
                        nSatOrdinals
                      </button>
                      {showDTOrdDropdown && (
                        <div className="button">

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home21')}>
                            Create
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home22')}>
                            Reshape
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home23')}>
                            Transfer
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home24')}>
                            Melt
                          </button>

                        </div>
                      )}

                      <button className="dropdown-button" 
                          onClick={() => {setShowStampsDropdown(!showStampsDropdown); setShowDTOrdDropdown(false); setShowDTDDropdown(false); setShowDTRDropdown(false); 
                          setShowSendDropdown(false); setShowDataDropdown(false); setShowOrderLockDropdown(false); 
                          setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                          setShowGPTECDSAminDropdown(false) ; setShowDTDaddDropdown(false)}}>
                        Opt Stamps
                      </button>
                      {showStampsDropdown && (
                        <div className="button">

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home30stamps')}>
                            Create
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home31stamps')}>
                            Reshape
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home32stamps')}>
                            Transfer
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home33stamps')}>
                            Melt
                          </button>

                        </div>
                      )}


                      <button className="dropdown-button" 
                          onClick={() => {setShowOrderLockDropdown(!showOrderLockDropdown); setShowDTDDropdown(false); 
                          setShowDTRDropdown(false); setShowSendDropdown(false); setShowDataDropdown(false); 
                          setShowDTOrdDropdown(false); setShowStampsDropdown(false); setShowGPTECDSADropdown(false); 
                          setShowGPTRABINDropdown(false); setShowGPTECDSAminDropdown(false); setShowDTDaddDropdown(false)}}>
                        Order Lock
                      </button>
                      {showOrderLockDropdown && (
                        <div className="button">

                          {
                            
                              <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                              fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home16c')}>
                                Base Contract
                              </button>
                            
                          }

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home16b')}>
                            Create
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home16d')}>
                            Cancel
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home16e')}>
                            Buy
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home16f')}>
                            Read Order
                          </button>

                        </div>
                      )}

                      {/*

                      <button className="dropdown-button" style={{ zIndex: 1 }}  onClick={() => handlePageChange('home03')}>
                        Write Data
                      </button>

                      <button className="dropdown-button" onClick={() => handlePageChange('home04')}>
                        Retrieve Data
                      </button>
                      */}

                      <button className="dropdown-button" onClick={() => handlePageChange('home05')}>
                        UTXO List
                      </button>

                   {/*   </div> */}
                  
                             


                    {/*
                    <button className="dropdown-button" onClick={() => handlePageChange('home06')}>
                      p2pkh to P2PK
                    </button>
                    <button className="dropdown-button" onClick={() => handlePageChange('home07')}>
                      P2PK to P2PK 
                    </button>
                      */}

                      {/*

                    <button className="dropdown-button" onClick={() => handlePageChange('todo')}>
                      Todo List Page 1
                    </button>
                    <button className="dropdown-button" onClick={() => handlePageChange('todo02')}>
                      Todo List Page 2
                    </button>

                    */}
                    
                  </div>
                )}
              </div>

              {/*    
              <button className="button" onClick={() => handlePageChange('helloworld')}>
                Hello World
              </button>

              */}


              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSendDropdown(false); setShowTodoDropdown(false); setShowHWDropdown(false); 
                                    setShowSCDropdown(!showSCDropdown); setShowHomeDropdown(false); setShowPVTKEYFORMDropdown(false); 
                                    setShowDdtcDropdown(false); setShowGPTDropdown(false); 
                                    setShowOrderLockDropdown(false); setShowMPlaceDropdown(false); 
                                    setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                                    setShowGPTECDSAminDropdown(false)}}>
                  Smart Contracts
                </button>
                {showSCDropdown && (
                  <div className="dropdown-content">

                    <button className="dropdown-button" 
                          onClick={() => {setShowHWDropdown(!showHWDropdown); setShowContDropdown(false); 
                          setShowGPTDropdown(false); setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false);
                          setShowGPTECDSAminDropdown(false)}}>
                        Hello World
                    </button>
                    {showHWDropdown && (
                        <div className="button">
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('helloworld')}>
                            Deploy
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('helloworld02')}>
                            Interact
                          </button>
                        </div>
                    )}


                    <button className="dropdown-button" 
                          onClick={() => {setShowContDropdown(!showContDropdown); setShowHWDropdown(false); 
                          setShowGPTDropdown(false); setShowMPlaceDropdown(false); 
                          setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false); 
                          setShowGPTECDSAminDropdown(false)}}>
                        Counter
                    </button>
                    {showContDropdown && (
                        <div className="button">
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('Counter')}>
                            Deploy
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('Counter02')}>
                            Increment
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('Counter03')}>
                            Decrement
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('Counter04')}>
                            Finish
                          </button>
                        </div>
                    )}

                    <button className="dropdown-button" 
                          onClick={() => {setShowGPTDropdown(!showGPTDropdown); setShowHWDropdown(false); 
                          setShowContDropdown(false); setShowMPlaceDropdown(false); 
                          setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false); 
                          setShowGPTECDSAminDropdown(false)}}>
                        GPToken
                    </button>
                    {showGPTDropdown && (
                        <div className="button">
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handleButtonClick('GPToken00')}>
                            Description
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken01')}>
                            Create
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken02')}>
                            Set Data
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken10')}>
                            Transfer
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken03')}>
                            Split
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken04')}>
                            Merge
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken05')}>
                            O-Lock
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken06')}>
                            O-Cancel
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken07')}>
                            O-Buy
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken09')}>
                            Details
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken08')}>
                            Extinguish
                          </button>

                        </div>
                    )}

                    <button className="dropdown-button" 
                          onClick={() => {setShowGPTRABINDropdown(!showGPTRABINDropdown); setShowGPTDropdown(false); setShowHWDropdown(false); 
                          setShowContDropdown(false); setShowMPlaceDropdown(false); setShowGPTECDSADropdown(false);
                          setShowGPTECDSAminDropdown(false) }}>
                        GPToken Oracle RABIN
                    </button>
                    {showGPTRABINDropdown && (
                        <div className="button">
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken01RABIN')}>
                            Create*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken02RABIN')}>
                            Set Data*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken10RABIN')}>
                            Transfer*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken03RABIN')}>
                            Split*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken04RABIN')}>
                            Merge*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken05RABIN')}>
                            O-Lock*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken06RABIN')}>
                            O-Cancel*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken07RABIN')}>
                            O-Buy*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken09')}>
                            Details*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken08RABIN')}>
                            Extinguish*
                          </button>
                        </div>
                    )}

                    <button className="dropdown-button" 
                          onClick={() => {setShowGPTECDSADropdown(!showGPTECDSADropdown); setShowGPTDropdown(false); setShowHWDropdown(false); 
                          setShowContDropdown(false); setShowMPlaceDropdown(false); setShowGPTRABINDropdown(false); 
                          setShowGPTECDSAminDropdown(false)}}>
                        GPToken Oracle ECDSA-Hard
                    </button>
                    {showGPTECDSADropdown && (
                        <div className="button">
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken01ECDSA')}>
                            Create*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken02ECDSA')}>
                            Set Data*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken10ECDSA')}>
                            Transfer*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken03ECDSA')}>
                            Split*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken04ECDSA')}>
                            Merge*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken05ECDSA')}>
                            O-Lock*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken06ECDSA')}>
                            O-Cancel*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken07ECDSA')}>
                            O-Buy*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken09')}>
                            Details*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken08ECDSA')}>
                            Extinguish*
                          </button>
                        </div>
                    )}


                    <button className="dropdown-button" 
                          onClick={() => {setShowGPTECDSAminDropdown(!showGPTECDSAminDropdown); setShowGPTDropdown(false); setShowHWDropdown(false); 
                          setShowContDropdown(false); setShowMPlaceDropdown(false); setShowGPTRABINDropdown(false);
                          setShowGPTECDSADropdown(false) }}>
                        GPToken Oracle ECDSA-Soft
                    </button>
                    {showGPTECDSAminDropdown && (
                        <div className="button">
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken01ECDSAmin')}>
                            Create*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken02ECDSAmin')}>
                            Set Data*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken10ECDSAmin')}>
                            Transfer*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken03ECDSAmin')}>
                            Split*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken04ECDSAmin')}>
                            Merge*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken05ECDSAmin')}>
                            O-Lock*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken06ECDSAmin')}>
                            O-Cancel*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken07ECDSAmin')}>
                            O-Buy*
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken09')}>
                            Details*
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken08ECDSAmin')}>
                            Extinguish*
                          </button>
                        </div>
                    )}


                    <button className="dropdown-button" 
                          onClick={() => {setShowMPlaceDropdown(!showMPlaceDropdown); setShowHWDropdown(false); 
                          setShowContDropdown(false); setShowGPTDropdown(false); 
                          setShowGPTECDSADropdown(false); setShowGPTRABINDropdown(false); 
                          setShowGPTECDSAminDropdown(false)}}>
                        Market Place
                    </button>
                    {showMPlaceDropdown && (
                        <div className="button">
                         
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('MarketPlace01')}>
                            Active List
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken05')}>
                            Order Lock
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken06')}>
                            Cancel
                          </button>

                        </div>
                    )}


                  </div>
                )}  
              </div>

              {/*          
              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowHWDropdown(!showHWDropdown); setShowTodoDropdown(false); setShowHomeDropdown(false); setShowSCDropdown(false)}}>
                  Hello World
                </button>
                {showHWDropdown && (
                  <div className="dropdown-content">
                    <button className="dropdown-button" onClick={() => handlePageChange('helloworld')}>
                      Deploy
                    </button>
                    <button className="dropdown-button" onClick={() => handlePageChange('helloworld02')}>
                      Interact
                    </button>
                  </div>
                )}
              </div>

              */}



            </nav>

            {currentPage === 'home' && <Home passedData={''}/>}
            {currentPage === 'homeUser' && <Home passedData={'rapido'} />}
            {currentPage === 'home00WeBSVmenu' && <Home00WeBSVmenu />}

            {currentPage === 'home01PvtKey' && <Home01pw2pvtkey />}
            {currentPage === 'home01PvtKeyUser' && <Home01pw2pvtkeyUser />}

            {currentPage === 'home02HexToWIF' && <Home02HexToWIF passedData={'Hex to WIF'}/>}
            {currentPage === 'home02WIFToHex' && <Home02HexToWIF passedData={'WIF to Hex'}/>}

            

            {currentPage === 'todo' && <TodoList />}
            {currentPage === 'home02' && <Page01TX />}
            {currentPage === 'home03' && <Page02Write />}
            {currentPage === 'home04' && <Page03Read passedData={''}/>}
            {currentPage === 'home05' && <Page04UtxoL />}
            {currentPage === 'home06' && <Page05P2PKC />}
            {currentPage === 'home07' && <Page06P2PK2P2PK />}
            {currentPage === 'home08' && <Page07p2pk2p2pkh />}
            {currentPage === 'home09' && <Page08TXDidactic />}
            {currentPage === 'home10' && <Page09SigForge />}
            {currentPage === 'home10b' && <Page09SigAlt />}
            {currentPage === 'home11' && <Page10Sig2QA />}
            {currentPage === 'home12' && <Page11SigVerify />}

            {currentPage === 'home13' && <Page12TokenDCreate passedData={'Drop'}/>}
            {currentPage === 'home14' && <Page13TokenDReshape passedData={'Drop'}/>}
            {currentPage === 'home15' && <Page14TokenDTransfer passedData={'Drop'}/>}
            {currentPage === 'home16' && <Page15TokenDMelt passedData={'Drop'}/>}

            {currentPage === 'home13add' && <Page12TokenDCreateV2 passedData={'Drop'}/>}
            {currentPage === 'home15add' && <Page14TokenDTransferV2 passedData={'Drop'}/>}
            {currentPage === 'home16add' && <Page15TokenDMeltV2 passedData={'Drop'}/>}


            {currentPage === 'home16b' && <Page16TokenOLock passedData={'p2pkh'}/>}
            {currentPage === 'home16c' && <Page17TokenLockSC/>}
            {currentPage === 'home16d' && <Page18TokenLockCancel/>}
            {currentPage === 'home16e' && <Page19TokenBuy/>}
            {currentPage === 'home16f' && <Page03Read passedData={'OLock'}/>}



            {currentPage === 'home17' && <Page12TokenDCreate passedData={'Return'}/>}
            {currentPage === 'home18' && <Page13TokenDReshape passedData={'Return'}/>}
            {currentPage === 'home19' && <Page14TokenDTransfer passedData={'Return'}/>}
            {currentPage === 'home20' && <Page15TokenDMelt passedData={'Return'}/>}

            {currentPage === 'home21' && <Page12TokenDCreate passedData={'Ordinals'}/>}
            {currentPage === 'home22' && <Page13TokenDReshape passedData={'Ordinals'}/>}
            {currentPage === 'home23' && <Page14TokenDTransfer passedData={'Ordinals'}/>}
            {currentPage === 'home24' && <Page15TokenDMelt passedData={'Ordinals'}/>}

            {currentPage === 'home25' && <Page12TokenDCreate passedData={'TrueR'}/>}
            {currentPage === 'home26' && <Page12TokenDCreate passedData={'TrueD'}/>}
            {currentPage === 'home27' && <Page15TokenDMelt passedData={'True'}/>}

            {currentPage === 'home25UTXOattack' && <Page12TokenDCreateUTXOattack passedData={'UTXOattack'}/>}
            

            {currentPage === 'home30stamps' && <Page12TokenDCreate passedData={'Stamps'}/>}
            {currentPage === 'home31stamps' && <Page13TokenDReshape passedData={'Stamps'}/>}
            {currentPage === 'home32stamps' && <Page14TokenDTransfer passedData={'Stamps'}/>}
            {currentPage === 'home33stamps' && <Page15TokenDMelt passedData={'Stamps'}/>}



            {currentPage === 'todo02' && <TodoList02 />}

            {currentPage === 'helloworld' && <PageSC01HelloWorld />}
            {currentPage === 'helloworld02' && <PageSC02HelloWorld />}
            
            {currentPage === 'Counter' && <PageSC03CouterDep />}
            {currentPage === 'Counter02' && <PageSC04CounterInc />}
            {currentPage === 'Counter03' && <PageSC05CounterDec />}
            {currentPage === 'Counter04' && <PageSC06CounterFinish />}

            {currentPage === 'GPToken01' && <PageSC07GPTokenCreate/>}
            {currentPage === 'GPToken01ECDSA' && <PageSC07GPTokenCreateECDSA/>}
            {currentPage === 'GPToken01ECDSAmin' && <PageSC07GPTokenCreateECDSAmin/>}
            {currentPage === 'GPToken01RABIN' && <PageSC07GPTokenCreateRABIN/>}

            {currentPage === 'GPToken02' && <PageSC08GPTDataSet passedData={'GPT'}/>}
            {currentPage === 'GPToken02ECDSA' && <PageSC08GPTDataSetECDSA passedData={'GPT'}/>}
            {currentPage === 'GPToken02RABIN' && <PageSC08GPTDataSetRABIN passedData={'GPT'}/>}
            {currentPage === 'GPToken02ECDSAmin' && <PageSC08GPTDataSetECDSAmin passedData={'GPT'}/>}

            {currentPage === 'GPToken03' && <PageSC09GPTokenSplit passedData={'Split'}/>}
            {currentPage === 'GPToken03ECDSA' && <PageSC09GPTokenSplitECDSA passedData={'Split'}/>}
            {currentPage === 'GPToken03RABIN' && <PageSC09GPTokenSplitRABIN passedData={'Split'}/>}
            {currentPage === 'GPToken03ECDSAmin' && <PageSC09GPTokenSplitECDSAmin passedData={'Split'}/>}

            {currentPage === 'GPToken04' && <PageSC10GPTokenMerge/>}
            {currentPage === 'GPToken04ECDSA' && <PageSC10GPTokenMergeECDSA/>}
            {currentPage === 'GPToken04RABIN' && <PageSC10GPTokenMergeRABIN/>}
            {currentPage === 'GPToken04ECDSAmin' && <PageSC10GPTokenMergeECDSAmin/>}

            {currentPage === 'GPToken05' && <PageSC11GPTokenOrdLock/>}
            {currentPage === 'GPToken05ECDSA' && <PageSC11GPTokenOrdLockECDSA/>}
            {currentPage === 'GPToken05RABIN' && <PageSC11GPTokenOrdLockRABIN/>}
            {currentPage === 'GPToken05ECDSAmin' && <PageSC11GPTokenOrdLockECDSAmin/>}

            {currentPage === 'GPToken06' && <PageSC12GPTokenCancelOrd/>}
            {currentPage === 'GPToken06ECDSA' && <PageSC12GPTokenCancelOrdECDSA/>}
            {currentPage === 'GPToken06RABIN' && <PageSC12GPTokenCancelOrdRABIN/>}
            {currentPage === 'GPToken06ECDSAmin' && <PageSC12GPTokenCancelOrdECDSAmin/>}


            {currentPage === 'GPToken07' && <PageSC13GPTokenBuy/>}
            {currentPage === 'GPToken07ECDSA' && <PageSC13GPTokenBuyECDSA/>}
            {currentPage === 'GPToken07RABIN' && <PageSC13GPTokenBuyRABIN/>}
            {currentPage === 'GPToken07ECDSAmin' && <PageSC13GPTokenBuyECDSAmin/>}

            {currentPage === 'GPToken08' && <PageSC14GPTokenMelt/>}
            {currentPage === 'GPToken08ECDSA' && <PageSC14GPTokenMeltECDSA/>}
            {currentPage === 'GPToken08ECDSAmin' && <PageSC14GPTokenMeltECDSAmin/>}
            {currentPage === 'GPToken08RABIN' && <PageSC14GPTokenMeltRABIN/>}
            {currentPage === 'GPToken09' && <Page03Read passedData={'GPToken'}/>}

            {currentPage === 'GPToken10' && <PageSC09GPTokenSplit passedData={'Transfer'}/>}
            {currentPage === 'GPToken10ECDSA' && <PageSC09GPTokenSplitECDSA passedData={'Transfer'}/>}
            {currentPage === 'GPToken10RABIN' && <PageSC09GPTokenSplitRABIN passedData={'Transfer'}/>}
            {currentPage === 'GPToken10ECDSAmin' && <PageSC09GPTokenSplitECDSAmin passedData={'Transfer'}/>}


            {currentPage === 'MarketPlace01' && <PageSC15MarketPlace/>}



                  

            {/*
            <nav className="navbar">
              <button className="button" onClick={() => handlePageChange('home')}>
                Home
              </button>
              <button className="button" onClick={() => handlePageChange('todo')}>
                Todo List
              </button>
              <button className="button" onClick={() => handlePageChange('helloworld')}>
                Hello World
              </button>
            </nav>

            {currentPage === 'home' && <Home />}
            {currentPage === 'todo' && <TodoList />}
            {currentPage === 'helloworld' && <DeployACT />}

            */}

            {/*

            <header className="App-header">

            <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>Hello World - sCrypt & React --HOME</h2>

            <div style={{ textAlign: 'center' }}>
                      
                      <label style={{ fontSize: '14px', paddingBottom: '5px' }}
                        >Press Deploy to Create the Contract:  
                      </label>     
            </div>
            <button className="insert" onClick={deploy}
                    style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '5px'}}
            >Deploy</button>

                                  
            <div>

              <div style={{ textAlign: 'center' }}>
                    
                    <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                      >Inform the Current TXID and press Unlock to use the Contract:  
                    </label>     
              </div>

              <div style={{ display: 'inline-block', textAlign: 'center' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                    > 
                        <input ref={txid} type="hex" name="PVTKEY1" min="1" defaultValue={'TXID'} placeholder="hex" />
                    </label>     
                </div>
                <div style={{ display: 'inline-block', textAlign: 'center' }}>
                    
                    <button className="insert" onClick={interact}
                        style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
                    >Unlock</button>

                </div>
            </div>                      
          </header>

          */}


          

        </div>

 

  );
}

export default App;
