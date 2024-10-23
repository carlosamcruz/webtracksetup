// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString } from "scrypt-ts";
import './App.css';

import { broadcast, listUnspent } from './mProviders';
import { convertBinaryToHexString , myUTXOData, setMyUTXOsData} from './myUtils';


export let homepvtKey: string = "";
export let homenetwork = bsv.Networks.testnet;
export let compState = true;

//const provider = new DefaultProvider({network: homenetwork});
let signer: TestWallet;

interface props1 {
  passedData: string;
}


//const Home: FC = () => {
const Home: FC<props1> = (props) => {  

  const [pubkey, setPubkey] = useState("");
  const [address, setaddress] = useState("");
  const [balance, setbalance] = useState(0);
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const labelRef02 = useRef<HTMLLabelElement | null>(null);
  const labelRef03 = useRef<HTMLLabelElement | null>(null);

  const [netbitcoin, setnet] = useState("TestNet");
  const [addcomp, setcomp] = useState("Compressed");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<Uint8Array | null>(null);
  const [hexStrFileData, setHexString] = useState('');
  const [sendButton, setsendButton] = useState(true);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    //setwaitAlert("Press Set Data");
    //settxb(true)

    const file = event.target.files && event.target.files[0];
    //setSelectedFile(file);

    console.log("Entrou aqui: ")

    if (file) {
      setSelectedFile(file);
      // Create a FileReader
      const reader = new FileReader();

      // Define a callback function for when the file is loaded
      reader.onload = (e) => {
        if(e.target)
        {
          const binaryString = e.target.result; // The file data as a binary string

          console.log("Data: ", binaryString)

          const hexString = convertBinaryToHexString(binaryString);

          let text = '' + binaryString

          let positon = text.indexOf('Chave Privada: ')

          if(positon != -1)
          {

            positon = positon + 'Chave Privada: '.length
            
            console.log("Data 2: ", text.substring(positon, positon + 64))

            localPvtKey.current.value = text.substring(positon, positon + 64)

            insertPVT(0);
      

          }
          
          console.log("Data hexString: ", hexString)

          setHexString(hexString);
        }
      };

      // Read the file as an ArrayBuffer
      //reader.readAsArrayBuffer(file);
      reader.readAsBinaryString(file);
    }
  };


  const handleFileChangeData = (event: React.ChangeEvent<HTMLInputElement>) => {

    //setwaitAlert("Press Set Data");
    //settxb(true)

    const file = event.target.files && event.target.files[0];
    //setSelectedFile(file);

    console.log("Entrou aqui: ")

    if (file) {
      setSelectedFile(file);
      // Create a FileReader
      const reader = new FileReader();

      // Define a callback function for when the file is loaded
      reader.onload = (e) => {
        if(e.target)
        {
          const binaryString = e.target.result; // The file data as a binary string

          console.log("Data: ", binaryString)

          const hexString = convertBinaryToHexString(binaryString);

          let text = '' + binaryString

          let positon = text.indexOf('[')

          if(positon != -1)
          {

            //positon = positon + 'Chave Privada: '.length

            setMyUTXOsData(text.substring(positon))    

          }
          
          console.log("Data hexString: ", hexString)

          setHexString(hexString);
        }
      };

      // Read the file as an ArrayBuffer
      //reader.readAsArrayBuffer(file);
      reader.readAsBinaryString(file);
    }
  };


  const handleCopyClick = () => {
    if (labelRef.current) {
      navigator.clipboard.writeText(labelRef.current.innerText)
        .then(() => {
          alert('Copied to clipboard!');
        })
        .catch((error) => {
          console.error('Failed to copy to clipboard:', error);
        });
    }
  };


  let localPvtKey = useRef<any>(null);
  let localPvtKey2 = useRef<any>(null);
  let localEmail = useRef<any>(null);


  async function delayHere() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500); // 2000 milliseconds = 2 seconds
    });
  }

  let cont = 0

  //Apresentar o Balance do Endereço
  useEffect(() => {
    console.log("Call useEffect")
    if(cont === 0)
    {    setBalance(0);
    }
    cont++
  }, []);  

  const setBalance = async (amount: any) => {

    
    //if(netbitcoin !== "TestNet") //Não muda de rede
    //if(homenetwork === bsv.Networks.mainnet) //Não muda de rede
    if(homenetwork === bsv.Networks.mainnet || props.passedData !== '') //Não muda de rede
    {
      homenetwork = bsv.Networks.mainnet;

      setnet("MainNet");
      //insertPVT(0);      
    }
    else
    {
      homenetwork = bsv.Networks.testnet;

      setnet("TestNet");
      //insertPVT(0);
      //insertPVT.caller();
    }

    //if(addcomp == "Compressed") //Não muda de compressão
    if(!compState) //Não muda de compressão
    {
      setcomp("Uncompressed");
      compState = false
      //insertPVT(0);
    }
    else
    {
      setcomp("Compressed");
      compState = true
      //insertPVT(0);
    }

    

    if(homepvtKey.length === 64)
    {
        localPvtKey.current.value = homepvtKey;

        if(homepvtKey.length !== 64)
        {
          alert("Wrong PVT Key");
          setaddress("");
          setPubkey("");
          setbalance(0);
          
        }
        else
        {
          setaddress("Wait!!!");
          setPubkey("Wait!!!");
    
          //bsv.PrivateKey.fromHex
          let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
          //let privateKey = bsv.PrivateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
          privateKey.compAdd(compState);
    
          privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
          //privateKey.fromHexAddComp(homepvtKey, homenetwork, compState)
    
          let provider = new DefaultProvider({network: homenetwork});
    
          signer = new TestWallet(privateKey, provider)
           
          //Linha necessária nesta versão
          //O signee deve ser connectado
          console.log("Até aqui: ", cont)

          //Dealy antes de tentar conectar;
          //await delayHere()

          await signer.connect(provider)

          console.log("PVT KEY 1: ", privateKey.compressed, " cont: ", cont)
          //console.log("Até aqui depois: ", cont)

    
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

            //From broadcast
            //await unspent(bsv.Address.fromPrivateKey(privateKey).toString(), homenetwork)
            //console.log('Depois de unspent call')
    
            setPubkey(bsv.PublicKey.fromPrivateKey(privateKey).toString())
    
            setaddress(bsv.Address.fromPrivateKey(privateKey).toString())
    
            //alert('PVT Key: ' + homepvtKey)
      
    
          } catch (e) {
            console.error('Failed', e)
            alert('Failed')
          }
        }
    }
  };


  //let privateKey = bsv.PrivateKey;

  function isNotHexadecimal(input: string): boolean {
    // Use a regular expression to match a valid hexadecimal string
    const hexPattern = /^[0-9A-Fa-f]+$/;
  
    // Use the negation operator to check if the input doesn't match the pattern
    return !hexPattern.test(input);
  }


  const insertPVT = async (amount: any) => {

    homepvtKey = localPvtKey.current.value;

    //Criação da CHAVE PRIVADA através do Password
    if((isNotHexadecimal(localPvtKey.current.value) || homepvtKey.length !== 64) && homepvtKey.length >= 8)
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
      homepvtKey = a
      console.log('PVT Key: ',a)
    }




    if(homepvtKey.length !== 64)
    {
      alert("Invalid Password or PVT Key");
      setaddress("");
      setPubkey("");
      setbalance(0);
    }
    else
    {
      setaddress("Wait!!!");
      setPubkey("Wait!!!");

      //bsv.PrivateKey.fromHex
      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //let privateKey = bsv.PrivateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
      privateKey.compAdd(compState);

      privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
      //privateKey.fromHexAddComp(homepvtKey, homenetwork, compState);

      //console.log("Pvt Key ACCESS: ", privateKey)
    

      let provider = new DefaultProvider({network: homenetwork});

      signer = new TestWallet(privateKey, provider)

      console.log("Na chave: ")

      //Linha necessária nesta versão
      //O signee deve ser connectado
      await signer.connect(provider)

      //console.log("Home Network : ", homenetwork)
      //console.log("PVT KEY : ", homepvtKey)
      //console.log("PVT KEY length: ", homepvtKey.length)

      console.log("PVT KEY 2: ", privateKey.compressed)

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

        setPubkey(bsv.PublicKey.fromPrivateKey(privateKey).toString())
        setaddress(bsv.Address.fromPrivateKey(privateKey).toString())

        console.log('Pvt Key 01: ', privateKey.toWIF())

        console.log('My Data: ', myUTXOData.utxoData)



        //alert('PVT Key: ' + homepvtKey)
  

      } catch (e) {
        console.error('Failed', e)
        alert('Failed')
      }
    }
  };

  const insertPVT2 = async (amount: any) => {

    //setdownloadFile(false)
    //Criação da CHAVE PRIVADA através do Password

    let toAlert = ""

    if((localEmail.current.value).indexOf("@") === -1 
    || (localEmail.current.value).indexOf(".") === -1)
      toAlert = 'E-mail Incorreto'
    if(localPvtKey2.current.value.length < 8 )
    {
      if(toAlert.length > 0)
        toAlert += ' | ' 

      toAlert += 'Senha Pequena'
    }  



    if( localPvtKey2.current.value.length >= 8  
      && (localEmail.current.value).indexOf("@") !== -1 
      && (localEmail.current.value).indexOf(".") !== -1)
    {
      console.log('PassW: ', localPvtKey2.current.value)
      console.log('Email: ', localEmail.current.value)


      console.log('PassW Hex: ', Buffer.from(localEmail.current.value + localPvtKey2.current.value, 'utf-8').toString('hex'))
      let base = Buffer.from(localEmail.current.value + localPvtKey2.current.value, 'utf-8').toString('hex')
      //let a = sha256(base).toString()
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

      localPvtKey.current.value = a

      insertPVT(0);


    }
    else
    {
      alert('E-amil ou senha errados');
    }

  };

  const net = async (amount: any) => {

    if(netbitcoin === "TestNet") // muda de rede
    {
      homenetwork = bsv.Networks.mainnet;

      setnet("MainNet");
      //insertPVT(0);      
    }
    else
    {
      homenetwork = bsv.Networks.testnet;

      setnet("TestNet");
      //insertPVT(0);
      //insertPVT.caller();
    }

    homepvtKey = localPvtKey.current.value;
    //Criação da CHAVE PRIVADA através do Password
    if((isNotHexadecimal(localPvtKey.current.value) || homepvtKey.length !== 64) && homepvtKey.length >= 8)
    {
      //console.log('PassW: ', localPvtKey.current.value)
      //console.log('PassW Hex: ', Buffer.from(localPvtKey.current.value, 'utf-8').toString('hex'))
      let base = Buffer.from(localPvtKey.current.value, 'utf-8').toString('hex')
      let a = sha256(base).toString()
      for(let i = 0; i < base.length; i ++ )
      {
        a = a + base.charAt(i) + base.charAt(i)
        //console.log('a: ', a)
        a = sha256(a).toString()
      }
      //a = sha256(a)
      homepvtKey = a
      //console.log('PVT Key: ',a)
    }


    //if((localPvtKey.current.value).length === 64)
    if(homepvtKey.length === 64)
    {
      insertPVT(0);
    }

  };

  const addComp = async (amount: any) => {


    if(addcomp == "Compressed")
    {
      setcomp("Uncompressed");
      compState = false
      //insertPVT(0);
    }
    else
    {
      setcomp("Compressed");
      compState = true
      //insertPVT(0);
    }
    
    homepvtKey = localPvtKey.current.value;
    //Criação da CHAVE PRIVADA através do Password
    if((isNotHexadecimal(localPvtKey.current.value) || homepvtKey.length !== 64) && homepvtKey.length >= 8)
    {
      //console.log('PassW: ', localPvtKey.current.value)
      //console.log('PassW Hex: ', Buffer.from(localPvtKey.current.value, 'utf-8').toString('hex'))
      let base = Buffer.from(localPvtKey.current.value, 'utf-8').toString('hex')
      let a = sha256(base).toString()
      for(let i = 0; i < base.length; i ++ )
      {
        a = a + base.charAt(i) + base.charAt(i)
        //console.log('a: ', a)
        a = sha256(a).toString()
      }
      //a = sha256(a)
      homepvtKey = a
      //console.log('PVT Key: ',a)
    }


    //if((localPvtKey.current.value).length === 64)
    if(homepvtKey.length === 64)
    {
      insertPVT(0);
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


      {
          props.passedData === ''?

          <div>

            <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

              <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
              
              Access Console
              
            </h2>

            <div>
                <div style={{ textAlign: 'center', paddingBottom: '20px'  }}>
                      
                      <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                        >{netbitcoin}  
                      </label>     
                      <button className="insert" onClick={net}
                        style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
                      >Switch </button>         
                </div>
            </div>

            <div>
                <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                      
                      <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                        > {addcomp} Add  
                      </label>     
                      <button className="insert" onClick={addComp}
                        style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
                      >Switch </button>
                </div>
            </div>

            <div>

              <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                    
                    <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                      >Insert a Pasword (8 char min) or Hex Private Key:  
                    </label>     
              </div>

              <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                    > 
                      {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                      <input ref={localPvtKey} type="password" name="PVTKEY1" min="1" placeholder="PassWord / 64 hex char" />
                    </label>     
              </div>
              <div style={{ display: 'inline-block', textAlign: 'center' }}>
                  
                  <button className="insert" onClick={insertPVT}
                      style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
                  >Insert</button>

              </div>

              <div>

                  <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                        
                        <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                          >Or e-mail and password; Or key file:  
                        </label>     
                  </div>

                  <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
                      <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                        > 
                          {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                          <input ref={localEmail} type="text" name="PVTKEY1" min="1" placeholder="e-mail:" />
                        </label>     
                    </div>

                  </div>


                  <div>
                    <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
                      <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                        > 
                          {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                          <input ref={localPvtKey2} type="password" name="PVTKEY1" min="1" placeholder="Password (8 char min):" />
                        </label>     
                    </div>
                  </div>

                  <div>

                  <div style={{ display: 'inline-block', textAlign: 'center', justifyContent: 'right', paddingBottom: '20px'}}>
                    <label  style={labelStyle}>
                      File
                      <input type="file" onChange={handleFileChange} />
                    </label>
                    
                  </div>

                    <div style={{ display: 'inline-block', textAlign: 'center' }}>
                        
                        <button className="insert" onClick={insertPVT2}
                            style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
                        >Insert</button>

                    </div>
              </div>

            </div>
            
          </div>
          :
          <div>

          <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

            <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
            
            Acesso Rápido
            
          </h2>

          <div>
              <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                    
                    <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                      >Insira Senha ou Chave Privada:  
                    </label>     
              </div>

              <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                    > 
                      {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                      <input ref={localPvtKey} type="password" name="PVTKEY1" min="1" placeholder="Senha / Chave Privada" />
                    </label>     
              </div>
              <div style={{ display: 'inline-block', textAlign: 'center' }}>
                  
                  <button className="insert" onClick={insertPVT}
                      style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
                  >Inserir</button>

              </div>
          </div>


        </div>

      }




      <div className="label-container" style={{display: 'flex', flexDirection: 'row', textAlign: 'center' }}>
                          <label className="responsive-label" htmlFor="output1"  
                          style={{ fontSize: '12px', paddingBottom: '20px' }}                           
                          >
                              {
                                props.passedData === ''?
                                'SEC Pub Key: '// + pubkey
                                :
                                'Chave Pública: '// + pubkey
                              } 
                          </label>
                          <span>&nbsp;</span>
                          <label className="responsive-label" htmlFor="output1" 
                          style={{ fontSize: '12px', paddingBottom: '20px', color: 'cyan' }} 
                          >
                            {pubkey}

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
                              { props.passedData === ''?
                                'Address: '
                                :
                                'Endereço: '
                              } 
                          </label>
                          <output id="output1"></output>

                          <label ref={labelRef02} style={{ fontSize: '12px', paddingBottom: '5px', color: 'lightgreen' }} 
                          >
                            {address}

                          </label>                   
        </div>

        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                          <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              { props.passedData === ''?
                                'Balance: '
                                :
                                'Saldo: '
                              }  
                          </label>
                          <output id="output1"></output>

                          <label ref={labelRef03} style={{ fontSize: '12px', paddingBottom: '5px' }} 
                          >
                            {balance} satoshis

                          </label>                   
        </div>

        { props.passedData === ''?
            <a href='https://medium.com/@cktcracker/access-console-4489593b83e3' target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '14px', paddingBottom: '5px', color: 'yellow' }}>
                Instructions of Use
            </a>
            :
            ''
        } 
    
        <div style={{ display: 'inline-block', textAlign: 'center', justifyContent: 'right', paddingBottom: '20px'}}>
             <label  style={labelStyle}>
                      MyData
             <input type="file" onChange={handleFileChangeData} />
             </label>
                    
        </div>        

        {
          setaddress.length > 10?
          <button onClick={handleCopyClick}>Copy to ClipBoard</button>:
          ""
        }                  


    </div>
  );
};

export default Home;