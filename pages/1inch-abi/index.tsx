import { OneInchHelper } from '@/app/components/inch/1inch-helper';
import { createSwapContract } from '@/app/components/metamask/meta-mask-helper';
import React, { useCallback, useEffect } from 'react'
const helper = new OneInchHelper();
function Index() {
    const job = useCallback(()=>{
        // helper.getQuote().then((quote)=>{
        //     console.log(quote);
            createSwapContract();
        //});
        
    },[])
  return (
    <div>
        <button onClick={job}>Click me</button>
    </div>
  )
}

export default Index