import { resolve } from "path";
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
    privateKey = "12345"; // Your wallet's private key. NEVER SHARE THIS WITH ANYONE!
    //
    broadcastApiUrl = "https://api.1inch.dev/tx-gateway/v1.1/" + this.chainId + "/broadcast";
    apiBaseUrl = "https://api.1inch.dev/swap/v5.2/" + this.chainId;
    web3 = new Web3(this.web3RpcUrl);
    token = "Bearer Vncokq93atdcSGlOtx6BdMa8gp3DbTr2"
    headers = { headers: { Authorization: this.token, accept: "application/json" } };
    swapParams: swapParams;
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
    doTheJob() {
        // this.doTheAllowance().then((res)=>{
        this.doTheSwap();
        // });
        // // this.doTheAllowance().then(() => {
        //     this.checkAllowance().then(console.log)
        // // })
    }
    async doTheAllowance() {
        const transactionForSign = await this.createSignForTransactionAllowance();
        const approveTxHash = await this.signAndSendTransaction(transactionForSign);
        console.log("Approve tx hash: ", approveTxHash);
    }
    async doTheSwap() {
        const swapTransaction = await this.buildTxForSwap();
        const swapTxHash = await this.signAndSendTransaction(swapTransaction);
        console.log("Swap tx hash: ", swapTxHash);
    }
    // Sign and post a transaction, return its hash
    async signAndSendTransaction(transaction: any) {
        const { rawTransaction } = await this.web3.eth.accounts.signTransaction(transaction, this.privateKey);
        return await this.broadCastRawTransaction(rawTransaction);
    }
    apiRequestUrl(methodName: string, queryParams: any) {
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
    async buildTxForApproveTradeWithRouter(tokenAddress: string, amount?: string) {
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
    async checkAllowance() {
        const url = this.apiRequestUrl("/approve/allowance", { "tokenAddress": this.swapParams.src, "walletAddress": this.walletAddress })

        return fetch(url, this.headers)
            .then((res) => res.json())
            .then((res) => res.allowance);
    }
    async getQuote(srcToken = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", dstToken = "0x1d43697d67cb5d0436cc38d583ca473a1bfebc7a", amount = "10000000000000000") {
        return new Promise((resolve, reject) => {
            let endpoint = `https://api.1inch.dev/swap/v5.2/${this.chainId}/quote`;
            const quoteParams = {
                src: srcToken, // Token address of fantom
                dst: dstToken, // Token address of RIP(Fantom Doge)
                amount: amount, // Amount of ftm to swap (in wei) = 1FTM see:https://ftmscan.com/unitconverter
                includeTokensInfo: true,
                includeProtocols: true,
                includeGas: true,
                disableEstimate: true,
            };
            //@ts-ignore
            endpoint += '?' + new URLSearchParams(quoteParams)
            fetch(endpoint, {
                method: "get",
                headers: this.headers.headers
            })
                .then((res) => res.json())
                .then((res) => {
                    resolve(res);
                });
        })
    }
    getSpenderAddress(): Promise<{ address: `0x${string}` }> {
        return new Promise((resolve, reject) => {
                // fetch('https://api.1inch.dev/swap/v5.2/250/approve/spender', {
                //     method: "get",
                //     headers: this.headers.headers
                // })
                //     .then((res) => res.json())
                //     .then((res) => {
                //         resolve(res) ;
                //     }).catch((err)=>{
                //         console.error(err);
                //     })
            //i called it once and get this. dont call it due to api call limit
            resolve({ address: '0x1111111254eeb25477b68fb85ed929f73a960582' })
        })
    }
    async generateCallDataForSwap(srcToken: string, dstToken: string, amount: string, from: string) {
        return new Promise<`0x${string}`>((resolve, reject) => {
            const url = `https://api.1inch.dev/swap/v5.2/${this.chainId}/swap`;
            const params = {
                src: srcToken,
                dst: dstToken,
                amount: amount,
                from: from,
                slippage: "50",
                includeProtocols: "true",
                includeTokensInfo: "true",
                disableEstimate: "true",
            }
            const endpoint = url + '?' + new URLSearchParams(params);
            fetch(endpoint, { headers: this.headers.headers }).then((res) => res.json()).then((res) => {
                resolve(res.tx.data);
            }).catch((err) => {
                debugger;
                console.log(err);
            });
        });
    }
}