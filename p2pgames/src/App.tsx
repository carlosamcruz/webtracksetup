import React, { useRef, FC, useState } from 'react';
//import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import './App.css';

import PageSC01OddOrEvenCreate from "./PageSC01OddOrEvenCreate"
import PageSC02OddOrEvenQuit from "./PageSC02OddOrEvenQuit"
import PageSC03OddOrEvenAccept from "./PageSC03OddOrEvenAccept"
import PageSC04OddOrEvenResult from "./PageSC04OddOrEvenResult"
import PageSC05OddOrClaim from "./PageSC05OddOrClaim"

import Home from './Home';
//import HomeUser from './HomeUser';
import Home00WeBSVmenu from './Home00WeBSVmenu';

import Home01pw2pvtkey from './Home01pw2pvtkey';
import Home01pw2pvtkeyUser from './Home01pw2pvtkeyUser';

import Home02HexToWIF from './Home02HexToWIF'

import Page01TX from './Page01TX';
import Page03Read from './Page03Read';


function App() {

  const [currentPage, setCurrentPage] = useState<string>('home00WeBSVmenu');
  const [showHomeDropdown, setShowHomeDropdown] = useState<boolean>(false);

  const [showTodoDropdown, setShowTodoDropdown] = useState<boolean>(false);
  const [showSCDropdown, setShowSCDropdown] = useState<boolean>(false);

  const [showGPTDropdown, setShowGPTDropdown] = useState<boolean>(false);
  const [showSendDropdown, setShowSendDropdown] = useState<boolean>(false);
  const [showPVTKEYFORMDropdown, setShowPVTKEYFORMDropdown] = useState<boolean>(false);


  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setShowHomeDropdown(false);

    setShowTodoDropdown(false);

    setShowSCDropdown(false);
    setShowSendDropdown(false);
    setShowPVTKEYFORMDropdown(false);
    setShowGPTDropdown(false)
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

  return (


        <div className="App">

            <nav className="navbar">
              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSendDropdown(false); setShowHomeDropdown(!showHomeDropdown); 
                                    setShowTodoDropdown(false);setShowSCDropdown(false);setShowPVTKEYFORMDropdown(false); 
                                    setShowGPTDropdown(false)}}>
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
                          onClick={() => {setShowPVTKEYFORMDropdown(!showPVTKEYFORMDropdown); setShowSendDropdown(false) }}>
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

                    <button className="dropdown-button" onClick={() => handlePageChange('home00WeBSVmenu')}>
                      Reception
                    </button>


                  </div>
                )}
              </div>

              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSendDropdown(false); setShowTodoDropdown(!showTodoDropdown); 
                                    setShowHomeDropdown(false); setShowSCDropdown(false);setShowPVTKEYFORMDropdown(false); 
                                    setShowGPTDropdown(false)}}>
                  Satoshi-to-Peer
                </button>
                {showTodoDropdown && (
                  <div className="dropdown-content">

                      <button className="dropdown-button" 
                          onClick={() => {setShowSendDropdown(!showSendDropdown)}}>
                        Send Satoshis
                      </button>
                      {showSendDropdown && (
                        <div className="button">
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home02')}>
                            p2pkh-p2pkh
                          </button>
                        </div>
                      )}
                    
                  </div>
                )}
              </div>

              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSendDropdown(false); setShowTodoDropdown(false); 
                                    setShowSCDropdown(!showSCDropdown); setShowHomeDropdown(false); setShowPVTKEYFORMDropdown(false); 
                                    setShowGPTDropdown(false)}}>
                  P2P Games
                </button>
                {showSCDropdown && (
                  <div className="dropdown-content">


                    <button className="dropdown-button" 
                          onClick={() => {setShowGPTDropdown(!showGPTDropdown)}}>
                        Odd or Even
                    </button>
                    {showGPTDropdown && (
                        <div className="button">
                          
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('OoE01')}>
                            Create
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('OoE02')}>
                            Quit
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('OoE03')}>
                            Accept
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('OoE04')}>
                            Result
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('OoE05')}>
                            Claim
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('home04')}>
                            Details
                          </button>

                        </div>
                    )}


                  </div>
                )}  
              </div>

            </nav>

            {currentPage === 'home' && <Home passedData={''}/>}
            {currentPage === 'homeUser' && <Home passedData={'rapido'} />}
            {currentPage === 'home00WeBSVmenu' && <Home00WeBSVmenu />}

            {currentPage === 'home01PvtKey' && <Home01pw2pvtkey />}
            {currentPage === 'home01PvtKeyUser' && <Home01pw2pvtkeyUser />}

            {currentPage === 'home02HexToWIF' && <Home02HexToWIF passedData={'Hex to WIF'}/>}
            {currentPage === 'home02WIFToHex' && <Home02HexToWIF passedData={'WIF to Hex'}/>}

            

            {currentPage === 'home02' && <Page01TX />}

            {currentPage === 'home04' && <Page03Read passedData={'OoE'}/>}


            {currentPage === 'OoE01' && <PageSC01OddOrEvenCreate/>}
            {currentPage === 'OoE02' && <PageSC02OddOrEvenQuit passedData={''}/>}
            {currentPage === 'OoE03' && <PageSC03OddOrEvenAccept passedData={''}/>}
            {currentPage === 'OoE04' && <PageSC04OddOrEvenResult passedData={''}/>}
            {currentPage === 'OoE05' && <PageSC05OddOrClaim passedData={''}/>}
            
         
        </div>

  );
}

export default App;
