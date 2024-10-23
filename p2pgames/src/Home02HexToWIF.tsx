// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString } from "scrypt-ts";
import './App.css';

export let homepvtKey: string = "";
export let homenetwork = bsv.Networks.testnet;
export let compState = true;



//const provider = new DefaultProvider({network: homenetwork});
let signer: TestWallet;


interface props1 {
  passedData: string;
}

const Home02HexToWIF: FC<props1> = (props) => {

//const Home02HexToWIF: FC = () => {

  const [hexpvtkey, sethexpvtkey] = useState("");
  const [pvtkeyAlert, setpvtkeyAlert] = useState("");
  const [pvtkeyAlert02, setpvtkeyAlert02] = useState("");
  const [pvtkeyAlert03, setpvtkeyAlert03] = useState("");

  const [WIFtoHex, setWIFtoHex] = useState("");



  let localPvtKey = useRef<any>(null);


  const insertPVT = async (amount: any) => {

    //Criação da CHAVE PRIVADA através do Password
    let hexPrivateKey = localPvtKey.current.value

    if(props.passedData === 'WIF to Hex')
    {
      let privateKey = bsv.PrivateKey.fromWIF(localPvtKey.current.value);

      console.log("HEX format: ", privateKey.toHex())
      hexPrivateKey = privateKey.toHex()

      setWIFtoHex('HEX Format: ' + hexPrivateKey)

    }
    else
    {
      setWIFtoHex('')
    }
    



    //if( hexPrivateKey.length === 64 && props.passedData === 'Hex to WIF')
    if( hexPrivateKey.length === 64)
    {

      let key0 = ''
      let key1 = ''
      let key2 = ''
      let key3 = ''

      //UnCompressed Section

      let privateKey0 = bsv.PrivateKey.fromHex(hexPrivateKey, bsv.Networks.mainnet);
      privateKey0.compAdd(false);
      privateKey0 = bsv.PrivateKey.fromHex(hexPrivateKey, bsv.Networks.mainnet);

      key0 = privateKey0.toString()
      console.log("Main, Uncomp 0 : ", key0)
      sethexpvtkey('WIF MainNET Uncomp: ' + key0)

      let privateKey2 = bsv.PrivateKey.fromHex(hexPrivateKey, bsv.Networks.testnet);
      key2 = privateKey2.toString()
      setpvtkeyAlert02('WIF TestNET Uncomp: ' + key2)
      console.log("Test, uncomp 2: ", key2)

      //Compressed Section

      let privateKey1 = bsv.PrivateKey.fromHex(hexPrivateKey, bsv.Networks.mainnet);
      privateKey1.compAdd(true);
      privateKey1 = bsv.PrivateKey.fromHex(hexPrivateKey, bsv.Networks.mainnet);

      key1 = privateKey1.toString()
      setpvtkeyAlert('WIF MainNET Comp: ' + privateKey1.toString())
      console.log("Main, comp 1: ", key1)

      let privateKey3 = bsv.PrivateKey.fromHex(hexPrivateKey, bsv.Networks.testnet);
      key3 = privateKey3.toString()
      setpvtkeyAlert03('WIF TestNET Comp: ' + privateKey3.toString())
      //sethexpvtkey(key3)
      console.log("Test, comp 1: ", key3)
    }
    else
    {
      alert("Wrong PVT Key");
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
        
        {props.passedData + ' '} Formats
        
      </h2>


      <div>

        {
          props.passedData === 'Hex to WIF'?
          
         /* <button onClick={handleCopyClick}>Copy to ClipBoard</button> */

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                    
              <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                >Insert hex pvt key:  
              </label>     
          </div>
                    
          :

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                        
              <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                >Insert WIF pvt key:  
              </label>     
          </div>
         
        }         


        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" placeholder="pvt key (hex)" />
              </label>     
          </div>
          <div style={{ display: 'inline-block', textAlign: 'center' }}>
              
              <button className="insert" onClick={insertPVT}
                  style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
              >Convert</button>

          </div>
      </div>


      {
          props.passedData === 'WIF to Hex'?
          
         /* <button onClick={handleCopyClick}>Copy to ClipBoard</button> */
         <div className="label-container" style={{ textAlign: 'center' }}>
          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '20px' }}                           
          >
              {WIFtoHex} 
          </label>
         <output id="output1"></output>

           
          </div>

                    
          :
          ''
        }         

      <div className="label-container" style={{ textAlign: 'center' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '20px' }}                           
                          >
                              {hexpvtkey} 
                          </label>
                          <output id="output1"></output>

                        {/*
                          <label className="responsive-label" ref={labelRef} style={{ fontSize: '12px', paddingBottom: '5px' }} 
                          >
                            {pubkey}

                          </label>       */}            
      </div>

      <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
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
  );
};

export default Home02HexToWIF;