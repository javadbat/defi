import Web3 from "web3";
import { OneInchHelper } from "../inch/1inch-helper";
import { oneInchSwapABI } from './constants';
import { MetaMaskSDK } from "@metamask/sdk";
// import { ethers } from "ethers";
import { createWalletClient, custom, createPublicClient, http, publicActions, getContract } from 'viem'
import { fantom } from 'viem/chains'
import { parseUnits } from 'viem'
import { read } from "fs";
import { ethers } from "ethers";

const recipient = '0xRecipientAddress'; // Replace with recipient's address
const amount = '1000000000000000000'; // 1 ETH in wei
const srcTokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as `0x${string}`;
const dstTokenAddress = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83" as `0x${string}`;
const inputAmount = "1000000000000000000";
const outputAmount = "22960816433800034";
const goodUntilTimestamp = Math.floor(Date.now() / 1000) + 3600; // Example: 1 hour from now
const r = '0xYOUR_R_VALUE'; // Replace with actual value
const sv = '0'; // spend base on input mean convert input amount to maximum output amount 1 is reverse
export async function createSwapContract() {
    const oneInchHelper = new OneInchHelper();
    //@ts-ignore
    if (window.ethereum) {
        const myWalletAddress = "0xDB5058aC383570b5c4D38f40DD4653473bb9803b"
        const spender: { address: `0x${string}` } = await oneInchHelper.getSpenderAddress();
        const spenderAddress: `0x${string}` = spender.address;
        const contractAddress = spenderAddress;
        const contract = await createFantomContract(contractAddress);
        const oneInchData = await oneInchHelper.generateCallDataForSwap(srcTokenAddress,dstTokenAddress,inputAmount,myWalletAddress);
        if (contract === undefined || !oneInchData ) {
            return;
        }
        const swapAmount = BigInt(inputAmount);
        debugger;
        // what i first found for aggregator address for fantom
        // "0x8b01d28F4fDDD89322711d832325f7eB1f122FB2" is used in all swap function call in scanners so i changed it to it
        const firstTest = '0x1111111254EEB25477B68fb85Ed929f73A960582'
        contract.write.swap([
            "0x8b01d28F4fDDD89322711d832325f7eB1f122FB2",
            {
                //@ts-ignore
                srcToken: srcTokenAddress,
                dstToken: dstTokenAddress,
                srcReceiver: "0x8b01d28F4fDDD89322711d832325f7eB1f122FB2",
                dstReceiver: myWalletAddress,
                amount: swapAmount,
                //@ts-ignore
                minReturnAmount: BigInt(100),
                //@ts-ignore
                flags: BigInt(0),
            },
            "0x",
            // i see all contract send this data for swap as data arg
            oneInchData
        ])
            .then((res) => {
                console.log(res);
            }).catch((err) => {
                console.error(err)
            })
    }
}
// export async function createEtherSwapContract() {
//     const oneInchHelper = new OneInchHelper();
//     //@ts-ignore
//     const spender: { address: string } = await oneInchHelper.getSpenderAddress();
//     const spenderAddress: string = spender.address;
//     debugger;
//     if (window.ethereum) {
//         const contractAddress = spenderAddress;
//         const abi = oneInchSwapABI;
//         const web3 = createWeb3();
//         // const provider = createMetaMaskProvider();
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         const accounts = await provider.send("eth_requestAccounts",[]);
//         if(!Array.isArray(accounts) || !(typeof accounts[0] == "string")){
//             return;
//         }
//         const account = accounts[0];
//         const signer = await provider.getSigner();
//         const tokenContractReadonly = new ethers.Contract(contractAddress, [abi], provider);
//         const tokenContract = tokenContractReadonly.connect(signer);
//         debugger;
//         tokenContract.methods.clipperSwap(
//             clipperExchangeAddress,
//             srcTokenAddress,
//             dstTokenAddress,
//             inputAmount,
//             outputAmount,
//             goodUntilTimestamp,
//             r,
//             vs
//           )
//         debugger;
//         try {
//             await tokenContract.methods.swap(recipient, amount).send({ from: sender });
//             console.log('Swap transaction successful!');
//         } catch (error) {
//             console.error('Error sending swap transaction:', error);
//         }
//     }
// }
export async function createCalcGasContract() {
    const oneInchHelper = new OneInchHelper();
    const spender: { address: `0x${string}` } = await oneInchHelper.getSpenderAddress();
    const spenderAddress: `0x${string}` = spender.address;
    const contractAddress = spenderAddress;
    const contract = await createFantomContract(contractAddress);
    if (contract === undefined) {
        return;
    }
    const swapAmount = BigInt(10000000000000000000);
    const firstTest = '0x1111111254EEB25477B68fb85Ed929f73A960582';
    const oneInchRouter5Aggregator = "0x8b01d28F4fDDD89322711d832325f7eB1f122FB2";
    contract.estimateGas.swap([
        oneInchRouter5Aggregator,
        {
            srcToken: srcTokenAddress,
            dstToken: dstTokenAddress,
            srcReceiver: oneInchRouter5Aggregator,
            dstReceiver: spenderAddress,
            amount: swapAmount,
            minReturnAmount: BigInt(100),
            flags: BigInt(0x4),
        },
        "0x",
        // i see all contract send this data for swap as data arg
        "0x"
    ],{ value: BigInt("10000000000000000000") } // Send money with the transaction
        ).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.error(err)
        })

}
async function createFantomContract(contractAddress: `0x${string}`) {
    const abi = oneInchSwapABI;
    //@ts-ignore
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    if (!Array.isArray(accounts) || !(typeof accounts[0] == "string")) {
        return;
    }

    const account = accounts[0] as `0x${string}`;
    const client = createWalletClient({
        account,
        chain: fantom,
        //@ts-ignore
        transport: custom(window.ethereum)
    }).extend(publicActions);
    const contract = getContract({
        abi,
        address: contractAddress,
        client
    })
    return contract
}
function createWeb3() {
    const web3RpcUrl = "https://rpc.ftm.tools";// rpc url of fantom
    const web3 = new Web3(web3RpcUrl);
    return web3;
}
function createMetaMaskProvider() {
    const MMSDK = new MetaMaskSDK();
    debugger;
    // You can also access via window.ethereum
    const provider = MMSDK.getProvider();
    return provider;
}