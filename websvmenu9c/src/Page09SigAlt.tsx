// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString } from "scrypt-ts";
import './App.css';
import { pvtkey } from './globals';
import { broadcast } from './mProviders';
import { littleEndian } from './myUtils';


const Page09SigAlt: FC = () => {

  const [sendButton, setsendButton] = useState(true);

  const [forged, setforged] = useState(false);
  const [z, setz] = useState("");
  const [r, setr] = useState("");
  const [s1, sets1] = useState("");
  const [s2, sets2] = useState("");
  const [DER1, setDER1] = useState("");
  const [DER2, setDER2] = useState("");


  let addToSend = useRef<any>(null);
  let satsAmount = useRef<any>(null);
  let messageOpt = useRef<any>(null);

  const handleSendButton = () => {
    if (sendButton) {
      //setsendButton(false)
      setforged(false)
      forgeECDSA(0)
    }
  };

  const forgeECDSA = async (amount: any) => {

    //homepvtKey = localPvtKey.current.value;
    //setdownloadFile(false)
    {

      let PVK = addToSend.current.value
      let e = satsAmount.current.value
      let k = messageOpt.current.value
      let tx = new bsv.Transaction

      //e = littleEndian(e);

      let pbkx = PVK//.substring(2, 64 + 2);

      let sigForged = tx.ecdsaAlt(e, k, pbkx)

      setforged(true)

      setz(sigForged[0])
      setr(sigForged[1])
      sets1(sigForged[2])
      sets2(sigForged[3])

      let DER1 = ''
      let DER2 = ''

      let r = sigForged[1]
      let s1 = sigForged[2]
      let s2 = sigForged[3]

      while(r.length % 2 ===1)
      {
        r = '0' + r
      }
      
      while(s1.length % 2 ===1)
      {
        s1 = '0' + s1
      }
      
      while(s2.length % 2 ===1)
      {
        s2 = '0' + s2
      }

      if(parseInt(r.substring(0, 2), 16) > parseInt('7f', 16))
      {
        r = '00' + r
      }
      if(parseInt(s1.substring(0, 2), 16) > parseInt('7f', 16))
      {
        s1 = '00' + s1
      }
      if(parseInt(s2.substring(0, 2), 16) > parseInt('7f', 16))
      {
        s2 = '00' + s2
      }

      let lngt = (r.length/2).toString(16)
       
      while(lngt.length % 2 ===1)
      {
        lngt = '0' + lngt
      }

      r = '02' + lngt + r

      lngt = (s1.length/2).toString(16)
       
      while(lngt.length % 2 ===1)
      {
        lngt = '0' + lngt
      }

      s1 = '02' + lngt + s1

      lngt = (s2.length/2).toString(16)
       
      while(lngt.length % 2 ===1)
      {
        lngt = '0' + lngt
      }

      s2 = '02' + lngt + s2


      lngt = ((r + s1).length/2).toString(16)
       
      while(lngt.length % 2 ===1)
      {
        lngt = '0' + lngt
      }

      console.log('Length: ', lngt)

      DER1 = '30' + lngt + r + s1
        
      lngt = ((r + s2).length/2).toString(16)
       
      while(lngt.length % 2 ===1)
      {
        lngt = '0' + lngt
      }

      DER2 = '30' + lngt + r + s2
        
      setDER1(DER1)
      setDER2(DER2)


      console.log('z: ', sigForged[0], '\nr: ', sigForged[1], '\ns1: ', sigForged[2], '\ns2: ', sigForged[3]  )
      console.log('DER1: ', DER1, '\nDER2: ', DER2  )
    }
  };

  return (

    <div className="App-header">
      <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          
        ECDSA Bitcoin
        
      </h2>

      <div className="label-container" style={{ textAlign: 'center', paddingBottom: '2px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '14px', paddingBottom: '5px' }}                           
                          >
                              {'0 < pvt key < n'} 
                          </label>
                          <output id="output1"></output>
        </div>

        <div style={{ textAlign: 'center' , paddingBottom: '2px'}}>
                          <label htmlFor="output1"  style={{ fontSize: '14px', paddingBottom: '5px' }}                           
                          >
                              {'e = sha256 ( sha256 ( msg ) )'} 
                          </label>
                          <output id="output1"></output>
        </div>
                <div style={{ textAlign: 'center' , paddingBottom: '2px'}}>
                          <label htmlFor="output1"  style={{ fontSize: '14px', paddingBottom: '5px' }}                           
                          >
                              {'0 < k < n'} 
                          </label>
                          <output id="output1"></output>
        </div>


      <div>

              <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                    > 
                      {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                      <input ref={addToSend} type="hex" name="PVTKEY1" min="1" placeholder="pvt key" />
                    </label>     
                </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={satsAmount} type="hex" name="PVTKEY1" min="1" placeholder="e = dsha256 ( msg )" />
              </label>     
          </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={messageOpt} type="hex" name="PVTKEY1" min="1" placeholder="0 < k < n" />
              </label>     
          </div>
      </div>

      <div>
        {
          sendButton?
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
              <button className="insert" onClick={handleSendButton}
                  style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
              >Sign</button>

          </div>
          :
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
          <button className="insert" onClick={handleSendButton}
              style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
          >Sign</button>

          </div>
        }
      </div>

      <div>
        {
          forged?
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
              <div className="label-container" style={{ textAlign: 'center', paddingBottom: '2px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'z: ' + z} 
                          </label>
                          <output id="output1"></output>
                </div>
                <div className="label-container" style={{ textAlign: 'center', paddingBottom: '2px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'r: ' + r} 
                          </label>
                          <output id="output1"></output>
                </div>
                <div className="label-container" style={{ textAlign: 'center', paddingBottom: '2px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'s1: ' + s1} 
                          </label>
                          <output id="output1"></output>
                </div>
                <div className="label-container" style={{ textAlign: 'center', paddingBottom: '2px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'s2: ' + s2} 
                          </label>
                          <output id="output1"></output>
                </div>
                <div className="label-container" style={{ textAlign: 'center', paddingBottom: '2px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'DER1: ' + DER1} 
                          </label>
                          <output id="output1"></output>
                </div>
                <div className="label-container" style={{ textAlign: 'center', paddingBottom: '2px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'DER2: ' + DER2} 
                          </label>
                          <output id="output1"></output>
                </div>

          </div>
          :
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
          </div>
        }
      </div>

    </div>
  );
};

export default Page09SigAlt;