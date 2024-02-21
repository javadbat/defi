import React, { useState } from 'react'
import { MetaMaskProvider} from '@metamask/sdk-react';
import MetaMask from '@/app/components/metamask/meta-mask';
import { MetaMaskUi } from '@/app/components/metamask/ready';



function Defi() {
  

  return (
    <MetaMaskProvider debug={true} sdkOptions={{
      dappMetadata: {
        name: "defi React Dapp",
        url: "http://localhost:3000",
      },
      checkInstallationImmediately:true,
      enableDebug:true,

    }}>
      <div>
        <h1>defi app</h1>
        <MetaMask></MetaMask>
        {/* <MetaMaskUi></MetaMaskUi> */}
      </div>
    </MetaMaskProvider>
  )
}

export default Defi;