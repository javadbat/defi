import Web3 from "web3";
type swapParams = {
    src: string, // Token address of fantom
    dst: string, // Token address of RIP(Fantom Doge)
    amount: string, // Amount of ftm to swap (in wei) = 1FTM see:https://ftmscan.com/unitconverter
    from: string,
    slippage: number, // Maximum acceptable slippage percentage for the swap (e.g., 1 for 1%)
    disableEstimate: boolean, // Set to true to disable estimation of swap details
    allowPartialFill: boolean // Set to true to allow partial filling of the swap order

};
export class OneInchHelper {
    //https://portal.1inch.dev/documentation/swap/quick-start
    //chain-id for fantom FTM 
    chainId = 250;
    web3RpcUrl = "https://rpc.ftm.tools";// rpc url of fantom
    walletAddress = "0xDB5058aC383570b5c4D38f40DD4653473bb9803b"; // Your wallet address
    privateKey = "f3e91592be42d0def0e8b58437182cd5d48ce7a8ebc45093936a021d102fd0fe"; // Your wallet's private key. NEVER SHARE THIS WITH ANYONE!
    //
    broadcastApiUrl = "https://api.1inch.dev/tx-gateway/v1.1/" + this.chainId + "/broadcast";
    apiBaseUrl = "https://api.1inch.dev/swap/v5.2/" + this.chainId;
    web3 = new Web3(this.web3RpcUrl);
    headers = { headers: { Authorization: "Bearer Vncokq93atdcSGlOtx6BdMa8gp3DbTr2", accept: "application/json" } };
    swapParams:swapParams;
    constructor() {
        this.swapParams = {
            src: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Token address of fantom
            dst: "0x1d43697d67cb5d0436cc38d583ca473a1bfebc7a", // Token address of RIP(Fantom Doge)
            amount: "10000000000000000", // Amount of ftm to swap (in wei) = 1FTM see:https://ftmscan.com/unitconverter
            from: this.walletAddress,
            slippage: 1, // Maximum acceptable slippage percentage for the swap (e.g., 1 for 1%)
            disableEstimate: false, // Set to true to disable estimation of swap details
            allowPartialFill: false // Set to true to allow partial filling of the swap order
        };
    }
    doTheJob(){
        // this.doTheAllowance().then((res)=>{
             this.doTheSwap();
        // });
        // // this.doTheAllowance().then(() => {
        //     this.checkAllowance().then(console.log)
        // // })
    }
    async doTheAllowance(){
        const transactionForSign = await this.createSignForTransactionAllowance();
        const approveTxHash = await this.signAndSendTransaction(transactionForSign);
        console.log("Approve tx hash: ", approveTxHash);
    }
    async doTheSwap(){
        const swapTransaction = await this.buildTxForSwap();
        const swapTxHash = await this.signAndSendTransaction(swapTransaction);
        console.log("Swap tx hash: ", swapTxHash);
    }
    // Sign and post a transaction, return its hash
    async signAndSendTransaction(transaction:any) {
        const { rawTransaction } = await this.web3.eth.accounts.signTransaction(transaction, this.privateKey);
        return await this.broadCastRawTransaction(rawTransaction);
    }
    apiRequestUrl(methodName:string, queryParams:any) {
        return this.apiBaseUrl + methodName + "?" + new URLSearchParams(queryParams).toString();
    }
    // Post raw transaction to the API and return transaction hash
    async broadCastRawTransaction(rawTransaction: string) {
        return fetch(this.broadcastApiUrl, {
            method: "post",
            body: JSON.stringify({ rawTransaction }),
            headers: { "Content-Type": "application/json", Authorization: "Bearer Vncokq93atdcSGlOtx6BdMa8gp3DbTr2" }
        })
            .then((res) => res.json())
            .then((res) => {
                return res.transactionHash;
            });
    }
    // checkAllowance(){
    //     const allowance = await checkAllowance(swapParams.src, walletAddress);
    //     console.log("Allowance: ", allowance);
    // }
    async buildTxForApproveTradeWithRouter(tokenAddress: string, amount?:string) {
        const url = this.apiRequestUrl("/approve/transaction", amount ? { tokenAddress, amount } : { tokenAddress, amount: 0 });

        const transaction = await fetch(url, this.headers).then((res) => res.json());

        const gasLimit = await this.web3.eth.estimateGas({
            ...transaction,
            from: this.walletAddress
        });

        return {
            ...transaction,
            gas: gasLimit,
            from: this.walletAddress
        };
    }
    async createSignForTransactionAllowance() {
        const transactionForSign = await this.buildTxForApproveTradeWithRouter(this.swapParams.src);
        console.log("Transaction for approve: ", transactionForSign);
        return transactionForSign;
    }
    //
    async buildTxForSwap() {
        const url = this.apiRequestUrl("/swap", this.swapParams);
      
        // Fetch the swap transaction details from the API
        return fetch(url, this.headers)
          .then((res) => res.json())
          .then((res) => res.tx);
      }
    async checkAllowance(){
        const url = this.apiRequestUrl("/approve/allowance", {"tokenAddress": this.swapParams.src, "walletAddress": this.walletAddress})

        return fetch(url, this.headers)
          .then((res) => res.json())
          .then((res) => res.allowance);
    }
}