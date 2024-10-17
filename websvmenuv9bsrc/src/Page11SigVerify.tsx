// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString } from "scrypt-ts";
import './App.css';
import { pvtkey } from './globals';
import { broadcast } from './mProviders';

const Page11SigVerify: FC = () => {

  const [sendButton, setsendButton] = useState(true);

  const [forged, setforged] = useState(false);
  const [pbk1, setpbk1] = useState("");
  const [pbk2, setpbk2] = useState("");
  const [pbk3, setpbk3] = useState("");
  const [pbk4, setpbk4] = useState("");
  const [verify, setverify] = useState("");



  let addToSend = useRef<any>(null);
  let satsAmount = useRef<any>(null);
  let messageOpt = useRef<any>(null);
  let zin = useRef<any>(null);


  const handleSendButton = () => {
    if (sendButton) {
      //setsendButton(false)
      setforged(false)
      ecdsaVeify(0)
    }
  };


  const ecdsaVeify = async (amount: any) => {
    {
      
      
      //let zIn = addToSend.current.value
      let pubKey = addToSend.current.value
      //let pubKey = satsAmount.current.value
      
      let rIn = satsAmount.current.value
      let sIn = messageOpt.current.value

      let zIn = zin.current.value

      let tx = new bsv.Transaction

      //rIn = DER.substring(8, parseInt(DER.substring(6, 8), 16))



      let pbkFromECDSA = tx.pbkeyFromECDSA(zIn, sIn, rIn)

      setforged(true)

      setpbk1(pbkFromECDSA[0])
      setpbk2(pbkFromECDSA[1])

      let pk3, pk4
      
      if(parseInt(pbkFromECDSA[0].substring(pbkFromECDSA[0].length - 2, pbkFromECDSA[0].length), 16) % 2 == 1)
      {
        setpbk3('03' + pbkFromECDSA[0].substring(2, 66))
        pk3 = '03' + pbkFromECDSA[0].substring(2, 66)
      }
      else {
        setpbk3('02' + pbkFromECDSA[0].substring(2, 66))
        pk3 = '02' + pbkFromECDSA[0].substring(2, 66)
      }

      if(parseInt(pbkFromECDSA[1].substring(pbkFromECDSA[1].length - 2, pbkFromECDSA[1].length), 16) % 2 == 1)
      {
        setpbk4('03' + pbkFromECDSA[1].substring(2, 66))
        pk4 = '03' + pbkFromECDSA[1].substring(2, 66)
      }
      else {
        setpbk4('02' + pbkFromECDSA[1].substring(2, 66))
        pk4 = '02' + pbkFromECDSA[1].substring(2, 66)
      }

      if(pbkFromECDSA[0] === pubKey || pbkFromECDSA[1] === pubKey || pk3 === pubKey || pk4 === pubKey )
      {
        setverify("Successfully Verified")
        console.log("Success")
      }
      else
      {
        setverify("Verification Failed")
        console.log("Failed")
      }

      console.log('PBK1: ', pbkFromECDSA[0], '\nPBK2: ', pbkFromECDSA[1] )
      console.log('PBK3: ', pk3, '\nPBK4: ', pk4 )
      
    }
  };

  return (

    <div className="App-header">
      <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          
        ECDSA Verification
        
      </h2>

      <div>

              <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                    > 
                      {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                      <input ref={addToSend} type="hex" name="PVTKEY1" min="1" placeholder="Pub Key (SEC)" />
                    </label>     
                </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={satsAmount} type="hex" name="PVTKEY1" min="1" placeholder="r (hex)" />
              </label>     
          </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={messageOpt} type="hex" name="PVTKEY1" min="1" placeholder="s (hex)" />
              </label>     
          </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={zin} type="hex" name="PVTKEY1" min="1" placeholder="z (hex)" />
              </label>     
          </div>
      </div>

      <div>
        {
          sendButton?
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
              <button className="insert" onClick={handleSendButton}
                  style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
              >Verify</button>

          </div>
          :
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
          <button className="insert" onClick={handleSendButton}
              style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
          >Verify</button>

          </div>
        }
      </div>

      <div>
        {
          forged?
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
                <div className="label-container" style={{ textAlign: 'center', paddingBottom: '2px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '15px', paddingBottom: '5px' }}                           
                          >
                              {verify} 
                          </label>
                          <output id="output1"></output>
                </div>
                {/*


                <div className="label-container" style={{ textAlign: 'center', paddingBottom: '2px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'COMP: ' + pbk3} 
                          </label>
                          <output id="output1"></output>
                </div>
                <div className="label-container" style={{ textAlign: 'center', paddingBottom: '2px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'SEC PBK2: ' + pbk2} 
                          </label>
                          <output id="output1"></output>
                </div>
                <div className="label-container" style={{ textAlign: 'center', paddingBottom: '2px' }}>
                          <label className="responsive-label" htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'COMP: ' + pbk4} 
                          </label>
                          <output id="output1"></output>
                </div>

                */}

          </div>
          :
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
          </div>
        }
      </div>

    </div>
  );
};

export default Page11SigVerify;