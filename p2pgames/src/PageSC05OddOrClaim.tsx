// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, ByteString, hash256, hash160, buildPublicKeyHashScript, findSig, SignatureResponse, PubKeyHash, SmartContract } from "scrypt-ts";
import './App.css';

import { broadcast, listUnspent, getTransaction, chainInfoWoC } from './mProviders';

import { OddOrEvenContract } from "./contracts/oddOrEvenContract";

import {homepvtKey, homenetwork, compState, utxoFeeAdd1, feeService} from './Home';

let signer: TestWallet;

interface props1 {
  passedData: string;
}

//const PageSC07GPTokenCreate: FC = (props) => {
const PageSC05OddOrClaim: FC<props1> = (props) => {

  //const [pubkey, setPubkey] = useState("");
  const [address, setaddress] = useState("");
  const [balance, setbalance] = useState(0);
  const labelRef02 = useRef<HTMLLabelElement | null>(null);
  const labelRef03 = useRef<HTMLLabelElement | null>(null);

  const [linkUrl, setLinkUrl] = useState("");
  const [txid, setTXID] = useState("");
    
  const [waitAlert, setwaitAlert] = useState("Inform Text of File then Press Set Data");
  const [txb, settxb] = useState(true);

  const [sendButton, setsendButton] = useState(true);

  let cStateTxid = useRef<any>(null);
  let txlink2 = ""
  let optionP2 = useRef<any>(null);
  let changeAddEx = useRef<any>(null);
  const nBlocks = useRef<any>(null);

  const setBalance = async (amount: any) => {

    console.log("setBalance!!!")

    if(homepvtKey.length !== 64)
    {
      alert("Wrong PVT Key");
      setaddress("");
      setbalance(0);
    }
    else
    {
      setaddress("Wait!!!");

      //bsv.PrivateKey.fromHex
      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //let privateKey = bsv.PrivateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
      privateKey.compAdd(compState);

      privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //privateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
  
      //Para evitar o problema:  Should connect to a livenet provider
      //Bypassar o provider externo e const
      let provider = new DefaultProvider({network: homenetwork});

      signer = new TestWallet(privateKey, provider)

      //Linha necessária nesta versão
      //O signee deve ser connectado
      await signer.connect(provider)

      console.log("PVT KEY: ", privateKey.compressed)

      try {

        const UTXOs = await listUnspent(bsv.Address.fromPrivateKey(privateKey).toString(), homenetwork)
        console.log('Depois de unspent call', UTXOs.length)

        let balance = 0
        for(let i = 0; i < UTXOs.length; i++ )
        {
          balance = balance + UTXOs[i].satoshis
        }
        setbalance(balance)
        console.log('Total Satoshis', balance)

        console.log("Bal: ", bsv.Address.fromPrivateKey(privateKey).toString())


        setaddress(bsv.Address.fromPrivateKey(privateKey).toString()) 

      } catch (e) {
        console.error('Failed', e)
        alert('Failed')
      }
    }
  };

  let cont = 0

  //Apresentar o Balance do Endereço
  useEffect(() => {
    console.log("Call useEffect")
    if(cont === 0)
    {    setBalance(0);
    }
    cont++
  }, []);  

  const handleSendButton = () => {
    if (sendButton) {
      setsendButton(false)
      writeToChain(0)
    }
  };

  const writeToChain = async (amount: any) => {

    //homepvtKey = localPvtKey.current.value;

    if(homepvtKey.length !== 64)
    {
      alert("Wrong PVT Key");
      setaddress("");
      setbalance(0);
      settxb(false);
      setLinkUrl("");
      setTXID("")
      setsendButton(true)
      
    }
    
    else if(cStateTxid.current.value.length !== 64)
    {
      alert("Missing Data");
      setsendButton(true)
      setwaitAlert("Inform Text of File then Press Set Data")
    }
    
    else
    {
      setLinkUrl('');
      setTXID('')
      setwaitAlert("Wait!!!");

      console.log('Current State: ', cStateTxid.current.value)

      //bsv.PrivateKey.fromHex
      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //let privateKey = bsv.PrivateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
      privateKey.compAdd(compState);

       privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //privateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
  
      let provider = new DefaultProvider({network: homenetwork});

      await provider.connect()

      signer = new TestWallet(privateKey, provider)

      //Linha necessária nesta versão
      //O signee deve ser connectado
      await signer.connect(provider)

      let tx3 = new bsv.Transaction
           
      tx3 = new bsv.Transaction (await getTransaction(cStateTxid.current.value, homenetwork))

      console.log('TXID Current State: ', tx3.id)

      let posNew1 = 0 // Output Index of the Contract in the Current State TX

      //let instance2 = GeneralToken.fromTx(tx3, posNew1)
      let instance2 = OddOrEvenContract.fromTx(tx3, posNew1)
      //Inform to the system the right output index of the contract and its sequence
      tx3.pvTxIdx(tx3.id, posNew1, sha256(tx3.outputs[posNew1].script.toHex()))
  
      let pbkey = bsv.PublicKey.fromPrivateKey(privateKey)
      let pvtkey = privateKey;
      
      //https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#method-with-signatures
  
      const balance = instance2.balance
      
      let info = await chainInfoWoC(homenetwork == bsv.Networks.testnet? false: true)
      console.log("chainInfoWoC: ", info[0].blocks);

      let delktaNBlocks: number = 0

      if(nBlocks && nBlocks.current.value > 0)
        delktaNBlocks = Number(nBlocks.current.value)

      await instance2.connect(signer)

      let fee = 17;

      instance2.bindTxBuilder('claimGame', async function () {

        const changeAddress = bsv.Address.fromPrivateKey(pvtkey)
           
        const unsignedTx: bsv.Transaction = new bsv.Transaction()
        .addInputFromPrevTx(tx3, posNew1);

        //Acrescenta o locktime na transação
        //O timeout do P2 deve começar a contar no minimo a partir do proximo bloco
        //unsignedTx.setLockTime((info[0].blocks + 1) + instance2.timeOutP2 + delktaNBlocks);

        let timeOutP2: number = Number(instance2.timeOutP2)
        console.log("Number(instance2.timeOutP2) + delktaNBlocks: ", (timeOutP2 + delktaNBlocks))
        console.log("delktaNBlocks: ", (delktaNBlocks))


        console.log("Number(instance2.timeOutP2): ", timeOutP2)
        //unsignedTx.setLockTime(timeOutP2 + delktaNBlocks);
        unsignedTx.setLockTime(info[0].blocks + delktaNBlocks);
        unsignedTx.setInputSequence(0,0);
        //unsignedTx.setInputSequence(1,0);

        //let plaformAmount = balance / 3;

        unsignedTx.addOutput(new bsv.Transaction.Output({
          //script: buildPublicKeyHashScript(hash160(instance2.alice)),
          script: buildPublicKeyHashScript(instance2.player2Add),
          satoshis: balance - fee
        }))

        unsignedTx.addOutput(new bsv.Transaction.Output({
          //script: buildPublicKeyHashScript(hash160(instance2.alice)),
          script: buildPublicKeyHashScript(instance2.player1Add),
          satoshis: 1
        }))

        //.change(changeAddress)

        console.log("TX --------: ", toHex(unsignedTx));

        //console.log('Unsig TX Out: ', toHex(unsignedTx.outputs[0].script))
        return Promise.resolve({
            tx: unsignedTx,
            atInputIndex: 0,
            nexts: [
            ]
        });              
      });

      console.log("Alice PKHASH: ", instance2.player1Add)
      console.log("Alice PK: ", toHex(pbkey))

      //SmartContract.dummyNSeqOn(0);
      SmartContract.dummyAutoPayFee(false);

      const { tx: callTx } = await instance2.methods.claimGame(
        //(sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
        BigInt(fee)
      );

      SmartContract.dummyAutoPayFee(true);
      //SmartContract.dummyNSeqOn(-1);

      console.log('TXID New State: ', callTx.id)     


//////////////////////////////////////////////////////////////

      settxb(true);
         
      //const txId = await provider.sendRawTransaction(rawTX)

      //const txId = await broadcast(rawTX, homenetwork)
      const txId = callTx.id

      if(txId.length === 64)
      {

        console.log('\nTXID: ', txId)

        //let txid = "bde9bf800372a80b5896653e7f9828b518516690f6a41f51c2b4552e4de4d26d";
  
        if(homenetwork === bsv.Networks.mainnet )
        {
          txlink2 = "https://whatsonchain.com/tx/" + txId;
        }
        else if (homenetwork === bsv.Networks.testnet )
        {
          txlink2 = "https://test.whatsonchain.com/tx/" + txId;
        }

        setwaitAlert('');

        //setbalance02(0)
        setLinkUrl(txlink2);

        setTXID(txId)

        setBalance(0)
        
      }
      else      
      {
        setwaitAlert('');
        setLinkUrl('');
        setTXID('')
        alert("Fail to Broadcast!!!");
      }
      setsendButton(true)

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

  return (

    <div className="App-header">
      <h2 style={{ fontSize: '34px', paddingBottom: '0px', paddingTop: '0px'}}>

        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>

        Odd or Even Challange - Claim
        {
         /*
        Create {props.passedData} Token
        */
        }
        
      </h2>


      <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                          <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'Address: '} 
                          </label>
                          <output id="output1"></output>

                          <label ref={labelRef02} style={{ fontSize: '12px', paddingBottom: '5px' }} 
                          >
                            {address}

                          </label>                   
        </div>

        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                          <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {'Balance: '} 
                          </label>
                          <output id="output1"></output>

                          <label ref={labelRef03} style={{ fontSize: '12px', paddingBottom: '5px' }} 
                          >
                            {balance} satoshis

                          </label>                   
      </div>



      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={cStateTxid} type="hex" name="PVTKEY1" min="1" placeholder="current state txid" />
              </label>     
          </div>
      </div>

        <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                  {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                  <input ref={nBlocks} type="number" name="OptionNumber" min="1" placeholder="test nBlocks(opt)" />
                </label>     
            </div>
        </div>


      <div>
        {
          sendButton?
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
              <button className="insert" onClick={handleSendButton}
                  style={{ fontSize: '14px', paddingBottom: '0px', marginLeft: '0px'}}
              >Claim</button>

          </div>
          :
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
          <button className="insert" onClick={handleSendButton}
              style={{ fontSize: '14px', paddingBottom: '0px', marginLeft: '0px'}}
          >Claim</button>
          </div>
        }
      </div>

      {
          txb?
          waitAlert ===''?
              <div>
                <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
                  <p className="responsive-label" style={{ fontSize: '12px' }}>TXID: {txid} </p>
                </div>
                <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
                  <p className="responsive-label" style={{ fontSize: '12px' }}>TX link: {' '} 
                      <a href={linkUrl} target="_blank" style={{ fontSize: '12px', color: 'cyan'}}>
                      {linkUrl}</a></p>
                </div>
              </div>
              :
              <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
              <p className="responsive-label" style={{ fontSize: '12px' }}>{waitAlert} </p>
              </div>  
          :
          ""
      }           

    </div>
  );
};

export default PageSC05OddOrClaim;