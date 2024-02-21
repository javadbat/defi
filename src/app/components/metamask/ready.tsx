import { MetaMaskButton, useAccount, useSDK, useSignMessage} from '@metamask/sdk-react-ui';
import React, { useState } from "react";
export function MetaMaskUi() {
    const {
        data: signData,
        isError: isSignError,
        isLoading: isSignLoading,
        isSuccess: isSignSuccess,
        signMessage,
      } = useSignMessage({
        message: 'gm wagmi frens',
      });
      const { isConnected } = useAccount();
    return (
        <div className="App">
      <header className="App-header">
        <MetaMaskButton theme={'light'} color="white"></MetaMaskButton>
        {isConnected && (
          <>
            <div style={{ marginTop: 20 }}>
              <button disabled={isSignLoading} onClick={() => signMessage()}>
                Sign message
              </button>
              {isSignSuccess && <div>Signature: {signData}</div>}
              {isSignError && <div>Error signing message</div>}
            </div>
          </>
        )}
      </header>
    </div>
    )
}