import React, { useRef, FC, useState } from 'react';

import './App.css';

import Home from './Home';
//import HomeUser from './HomeUser';
import Home00WeBSVmenu from './Home00WeBSVmenu';

import Page01TX from './Page01TX';
import Page02Write from './Page02Write';
import Page03Read from './Page03Read';

import Page12TokenDCreate from './Page12TokenDCreate';
import Page13TokenDReshape from './Page13TokenDReshape';
import Page14TokenDTransfer from './Page14TokenDTransfer';
import Page15TokenDMelt from './Page15TokenDMelt';

function App() {

  const [currentPage, setCurrentPage] = useState<string>('home00WeBSVmenu');
  const [showHomeDropdown, setShowHomeDropdown] = useState<boolean>(false);


  const [showTodoDropdown, setShowTodoDropdown] = useState<boolean>(false);
  const [showSendDropdown, setShowSendDropdown] = useState<boolean>(false);
  const [showDataDropdown, setShowDataDropdown] = useState<boolean>(false);

  const [showDTDDropdown, setShowDTDDropdown] = useState<boolean>(false);


  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setShowHomeDropdown(false);
    setShowTodoDropdown(false);
    setShowSendDropdown(false);
    setShowDataDropdown(false);
    setShowDTDDropdown(false);
  };


  const txid = useRef<any>(null);

  return (


        <div className="App">

            <nav className="navbar">
              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSendDropdown(false); setShowHomeDropdown(!showHomeDropdown); 
                                    setShowTodoDropdown(false);}}>
                  Home
                </button>
                {showHomeDropdown && (
                  <div className="dropdown-content">

                    <button className="dropdown-button" onClick={() => handlePageChange('home')}>
                      Access
                    </button>

                    <button className="dropdown-button" onClick={() => handlePageChange('home00WeBSVmenu')}>
                      Reception
                    </button>


                  </div>
                )}
              </div>

              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSendDropdown(false); setShowTodoDropdown(!showTodoDropdown); 
                                    setShowHomeDropdown(false); setShowDTDDropdown(false);}}>
                  Web3 Tracker
                </button>
                {showTodoDropdown && (
                  <div className="dropdown-content">

                      <button className="dropdown-button" 
                          onClick={() => {setShowSendDropdown(!showSendDropdown); setShowDTDDropdown(false); setShowDataDropdown(false)
                          }}>
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

                      <button className="dropdown-button" 
                          onClick={() => {setShowDataDropdown(!showDataDropdown); setShowDTDDropdown(false); setShowSendDropdown(false)}}>
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
                          onClick={() => {setShowDTDDropdown(!showDTDDropdown); setShowSendDropdown(false); 
                          setShowDataDropdown(false)}}>
                        Track Token
                      </button>
                      {showDTDDropdown && (
                        <div className="button">

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home13')}>
                            Create
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '60%'}} onClick={() => handlePageChange('home14')}>
                            Update
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
                   
                  </div>
                )}
              </div>


            </nav>

            {currentPage === 'home' && <Home passedData={''}/>}
            {currentPage === 'home00WeBSVmenu' && <Home00WeBSVmenu />}
            
            {currentPage === 'home02' && <Page01TX />}
            {currentPage === 'home03' && <Page02Write />}
            {currentPage === 'home04' && <Page03Read passedData={''}/>}

            {currentPage === 'home13' && <Page12TokenDCreate passedData={'Track'}/>}
            {currentPage === 'home14' && <Page13TokenDReshape passedData={'Track'}/>}
            {currentPage === 'home15' && <Page14TokenDTransfer passedData={'Track'}/>}
            {currentPage === 'home16' && <Page15TokenDMelt passedData={'Track'}/>}
         
        </div>
  );
}

export default App;
