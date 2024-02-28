import React, { useState } from 'react'
import { useSDK } from '@metamask/sdk-react';
function MetaMask() {
    const [account, setAccount] = useState<string>();
  const { sdk, connected, connecting, provider, chainId,error,status } = useSDK();
  const connect = async () => {
    try {
      console.log("sdk:",sdk);
      
      const accounts: any = await sdk?.connect();
      console.log(accounts)
      setAccount(accounts?.[0]);
    } catch (err) {
      console.warn(`failed to connect..`, err);
    }
  };
  const sendTransaction = ()=>{
    const params = [
      {
        from: account, // The user's active address.
        to: "0x3c7FBE06e3031a75e4Ee55F4CDA92EC6aF4eE779",
        value: "1000", //in wei
        gasLimit: '0x5028', // Customizable by the user during MetaMask confirmation.
        maxPriorityFeePerGas: '0x3b9aca00', // Customizable by the user during MetaMask confirmation.
        maxFeePerGas: '0x2540be400', // Customizable by the user during MetaMask confirmation.
      },
    ];
    debugger;
    window.ethereum?.request({method:"eth_sendTransaction",params}).then((txHash) => console.log("hash:",txHash))
    .catch((error) => console.error(error));
  }
  return (
    <div>
        <h1>Meta Mask</h1>
        <button style={{ padding: 10, margin: 10 }} onClick={connect}>
          Connect
        </button>
        {
            error &&
            <div>{error.message}</div>
        }
        {
            status && 
            <div>{status.connectionStatus}</div>
        }
        {connected && (
          <div>
            <>
              {chainId && `Connected chain: ${chainId}`}
              <p></p>
              {account && `Connected account: ${account}`}
              <button onClick={sendTransaction}>send transaction</button>
            </>
          </div>
        )}
      </div>
  )
}

export default MetaMask