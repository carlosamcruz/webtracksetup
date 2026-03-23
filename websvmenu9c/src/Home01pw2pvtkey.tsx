// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString } from "scrypt-ts";
import './App.css';
import { pvtkey } from './globals';

import { broadcast, listUnspent } from './mProviders';
import { hexToBytes } from './myUtils';


export let homepvtKey: string = "";
export let homenetwork = bsv.Networks.testnet;
export let compState = true;



//const provider = new DefaultProvider({network: homenetwork});
let signer: TestWallet;

const Home01pw2pvtkey: FC = () => {

  const [hexpvtkey, sethexpvtkey] = useState("");
  const [pvtkeyAlert, setpvtkeyAlert] = useState("");
  const [pvtkeyAlert02, setpvtkeyAlert02] = useState("");
  const [pvtkeyAlert03, setpvtkeyAlert03] = useState("");


  let localPvtKey = useRef<any>(null);


  const [downloadFile, setdownloadFile] = useState(false);
  const [binaryData, setbinaryData] = useState<Uint8Array>(new Uint8Array());

  const downloadBinaryFile = () => {
    // Create a Blob from the binary data
    const blob = new Blob([binaryData]);

    console.log("File Size: ", binaryData?.byteLength)

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'S2P-Private-Key' + '.' + "txt"; // Specify the desired file name with the correct extension

    // Programmatically trigger a click event on the anchor element
    a.click();

    // Clean up the URL object and remove the anchor element
    URL.revokeObjectURL(url);
    a.remove();
  };



  const insertPVT = async (amount: any) => {

    setdownloadFile(false)

    //Criação da CHAVE PRIVADA através do Password
    if( localPvtKey.current.value.length >= 8)
    {
      console.log('PassW: ', localPvtKey.current.value)
      console.log('PassW Hex: ', Buffer.from(localPvtKey.current.value, 'utf-8').toString('hex'))
      let base = Buffer.from(localPvtKey.current.value, 'utf-8').toString('hex')
      let a = sha256(base).toString()
      for(let i = 0; i < base.length; i ++ )
      {
        a = a + base.charAt(i) + base.charAt(i)
        //console.log('a: ', a)
        a = sha256(a).toString()
      }
      //a = sha256(a)
      //homepvtKey = a
      console.log('PVT Key: ',a)

      sethexpvtkey(a)
      //setpvtkeyAlert('You may forget the passoword.')
      //setpvtkeyAlert02('But keep safe the private key safe and PRIVATE.')
      //setpvtkeyAlert03('If you lose the Private Key, it can not be recovered!!!')
      //setpvtkeyAlert04('If you lose the Private Key, it can not be recovered!!!')

      let cpFile = 'New Private Key Formation Data\n\n'
                    + '-------------------------------------------------------------------------------------\n'
                    + '-------------------------------------------------------------------------------------\n'
                    + 'PassWord: ' +   localPvtKey.current.value
                    + '\n\nPrivate Key: ' + a
                    + '\n-------------------------------------------------------------------------------------\n'
                    + '-------------------------------------------------------------------------------------\n'
                    + '\n****     Keep your new private key in a safe place      ****'
                    + '\n****     Do not share your private key with anyone      ****'
                    + '\n****  If you lose your New Key, it cannot be recovered  ****'

      let dataTX = toByteString(cpFile, true)


      let bytes = hexToBytes(dataTX);

      setbinaryData(bytes)

      if(bytes.length > 0)
      {
        setdownloadFile(true)
        //setwaitAlert("Download File!!!");

        //console.log("download file: ", downloadFile)
        //console.log("File Type: ", fileType)

      }



    }
    else
    {
      alert("PassWord too short");
      sethexpvtkey('')
      setpvtkeyAlert('')
      setpvtkeyAlert02('')
      setpvtkeyAlert03('')
    }

  };

  return (

    <div className="App-header">
      <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        
        New Hex Private Key
        
      </h2>


      <div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                
                <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                  >Insert a Pasword at least 8 char long:  
                </label>     
          </div>

          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                  {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                  <input ref={localPvtKey} type="password" name="PVTKEY1" min="1" placeholder="PassWord (8 char min)" />
                </label>     
            </div>
            <div style={{ display: 'inline-block', textAlign: 'center' }}>
                
                <button className="insert" onClick={insertPVT}
                    style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
                >Create</button>

            </div>
        </div>

        <div className="label-container" style={{ display: 'flex', flexDirection: 'row', textAlign: 'center' }}>
                            <label className="responsive-label" htmlFor="output1"  
                            style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px'}}                           
                            >
                                {'Hex Pvt Key: '
                                } 
                            </label>
                            <span>&nbsp;</span>
                            <label className="responsive-label" htmlFor="output1"  
                            style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px', color: 'lightgreen'}}                           
                            >
                                {'' + hexpvtkey} 
                            </label>
                            <output id="output1"></output>
          
        </div>

        {
          /*
          hexpvtkey !== ''?

          <div>
              <div style={{ textAlign: 'center', paddingBottom: '20px', paddingTop: '0px' }}>
                  <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                  >
                      {pvtkeyAlert} 
                  </label>
                  <output id="output1"></output>
              </div>
              <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                          <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {pvtkeyAlert02} 
                          </label>
                          <output id="output1"></output>             
              </div>
              <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                          <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {pvtkeyAlert03} 
                          </label>
                          <output id="output1"></output>             
              </div>
          </div>
          :
          ''
          */
        }

        { 
          downloadFile?
          <div>
            <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '40px', paddingTop: '20px'}}>
                
                <button className="insert" onClick={downloadBinaryFile}
                    style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
                >Download Key</button>

            </div>
          </div>
          :
          //<div></div>
          ''
        }

        <a href='https://medium.com/@cktcracker/new-private-key-95f5b98a8aa0' target="_blank" rel="noopener noreferrer"
        style={{ fontSize: '14px', paddingBottom: '5px', color: 'yellow' }}>
            Instructions of Use
        </a>

    </div>
  );
};

export default Home01pw2pvtkey;