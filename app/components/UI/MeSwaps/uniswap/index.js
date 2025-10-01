const { ethers, BigNumber } = require("ethers")
const { Token, Pair, Fetcher, Route, Trade, TokenAmount, TradeType, Percent} = require("@uniswap/sdk");
import { getAddress, getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';

import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';

import { USDT_Arbit, CATT_Arbit, WETH, BSC } from './tokens';
import { INIT_CODE_HASH, FACTORY_ADDRESS, getUniRouter, PROVIDERS } from './constant';
import { safeBNToHex } from '../../../../util/number';

async function fetchPairData(target, source, provider) {
    const tokens    = target.sortsBefore(source) ? [target, source] : [source, target];
    const create    = getCreate2Address(FACTORY_ADDRESS[target.chainId], 
                            keccak256(['bytes'], [pack(['address', 'address'], [tokens[0].address, tokens[1].address])]), 
                            INIT_CODE_HASH)
    //console.log("estimateOut", "address", address, "create", create);
    const xxx       = new ethers.Contract(create, IUniswapV2Pair.abi, provider);
    console.log("pair address=", create);
    const reserve   = await xxx.getReserves();
    console.log("reserve", reserve);

    const reserves0 = reserve[0];
    const reserves1 = reserve[1];
    const balances  = target.sortsBefore(source) ? [reserves0, reserves1] : [reserves1, reserves0];
    const pair      = new Pair( new TokenAmount(target, balances[0]), 
                                new TokenAmount(source, balances[1]));
    pair.liquidityToken.address = create;
    return pair;
}

export async function estimateOut(target, source, amount, slippage = "50") {
    if (target.chainId != source.chainId) return false;
    if (amount == 0) return 0;

    const native    = WETH[source.chainId];
    const ether2T   = native.address == source.address;
    const provider  = PROVIDERS[source.chainId];

    console.log("Fetcher.fetchPairData", target, source);
    
    const pair = await fetchPairData(target, source, provider);

    console.log("new Route", [pair], source);
    console.log("Pair", pair, "\n", "liquidity", pair.liquidityToken, 
                "token0=", pair.token0, "reserve0", pair.reserve0.toExact(), "\n",
                "token1=", pair.token1, "reserve1", pair.reserve1.toExact(), "\n")
    
    const swap  = (target.address != pair.token0.address);
    console.log("swap=", swap, "target=", target.address, "reserve0=", pair.token0.address);
    const reserveT = swap? pair.reserve1.toExact(): pair.reserve0.toExact(); // Target
    const reserveS = swap? pair.reserve0.toExact(): pair.reserve1.toExact(); // Source
    
    const route = new Route([pair], source); // a fully specified path from input token to output token
    let amountIn = ether2T? ethers.utils.parseEther(amount.toString()): amount * (10 ** source.decimals);
    amountIn = amountIn.toString()

    console.log("new Percent");
    const slippageTolerance = new Percent(slippage, "10000"); // 50 bips, or 0.50% - Slippage tolerance

    console.log("new Trade");
    const trade = new Trade( //information necessary to create a swap transaction.
        route,
        new TokenAmount(source, amountIn),
        TradeType.EXACT_INPUT
    );

    console.log("trade.minimumAmountOut");
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
    
    const out = amountOutMin / (10 ** target.decimals)
    const amountB = 1.0 * amount * reserveT / reserveS;
    const amountA = 1.0 * amountOutMin * reserveS / reserveT;
    console.log("in", amount, "out", out, "\n",
                "reserve1", reserveS, "reserve0", reserveT, "\n",
                "amountA", amountA, "amountB", amountB, "\n");

    //return amountOutMin / (10 ** (target.decimals));
    return amountOutMin;
}

export async function swapTokensV2(account, token1, token2, amount, slippage = "50") {
    if (token1.chainId != token2.chainId) return false;

    //await requestNetwork("0x"+token2.chainId.toString(16));

    //const ether     = isMeta? window.web3.currentProvider: window.okxwallet;
    //const wallet    = new ethers.providers.Web3Provider(ether);
    const native    = WETH[token2.chainId];
    const router    = getUniRouter(token2.chainId);
    const provider  = PROVIDERS[token2.chainId];
    const ether2T   = native.address == token2.address;
    const T2T       = (native.address != token1.address) && (native.address != token2.address)
	
    try {
        console.log("Fetcher.fetchPairData", token1, token2);
		const pair = await fetchPairData(token1, token2, provider); 

        console.log("new Route", [pair], token2);
        const route     = new Route([pair], token2); // a fully specified path from input token to output token
		const amountInB = ether2T? ethers.utils.parseEther(amount.toString()): amount * (10 ** token2.decimals);
        const amountIn  = amountInB.toString()

        console.log("new Percent");
		const slippageTolerance = new Percent(slippage, "10000"); // 50 bips, or 0.50% - Slippage tolerance

        console.log("new Trade");
		const trade = new Trade(route, new TokenAmount(token2, amountIn), TradeType.EXACT_INPUT);

        console.log("trade.minimumAmountOut");
		const amountOutMin    = trade.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
		const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();
		console.log("in=", amountIn, "out=", amountOutMin);

        const path = [token2.address, token1.address]; //An array of token addresses
		//const to = wallet.address; // should be a checksummed recipient address
		const to        = account;
        const deadline  = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
		const value     = trade.inputAmount.raw; // // needs to be converted to e.g. hex
		const valueHex  = ethers.BigNumber.from(value.toString()).toHexString(); //convert to hex string

        console.log("UNISWAP_ROUTER_CONTRACT.swapExactETHForTokens", 
                    "amountOutMin", amountOutMin, 
                    "path", path, 
                    "to", to, 
                    "deadline", deadline,
                    "value", value);
		//Return a copy of transactionRequest, 
		//The default implementation calls checkTransaction and resolves to if it is an ENS name, 
		//adds gasPrice, nonce, gasLimit and chainId based on the related operations on Signer.
		//const rawTxn = await UNISWAP_ROUTER_CONTRACT.populateTransaction.swapExactETHForTokens(amountOutMinHex, path, to, deadline, {
		//	value: valueHex
		//})
        const rawTxn = T2T
                        ? await router.populateTransaction.swapExactTokensForTokens(amount * (10 ** token2.decimals), amountOutMinHex, path, to, deadline)
                        : ether2T
                        ? await router.populateTransaction.swapExactETHForTokens(amountOutMinHex, path, to, deadline, {
                            value: valueHex
                          })
                        : await router.populateTransaction.swapExactTokensForETH(amount * (10 ** token2.decimals), amountOutMinHex, path, to, deadline)

        console.log("wallet.sendTransaction", rawTxn);
		console.log(" from=", account);
        console.log("   to=", rawTxn.to);
        console.log("value=", rawTxn.value);
        console.log(" data=", rawTxn.data);
    //  Convert to Metamask
        const nonce     = Math.round(Math.random() * 10000); //Math.random()
        rawTxn.from     = account;
    //  rawTxn.nonce    = safeBNToHex(nonce);
    //  rawTxn.type     = '0x2';    // TransactionEnvelopeType
        //rawTxn.type   = '0x0'; 
        rawTxn.chainId  = token2.chainId;
        rawTxn.value    = valueHex;
        //rawTxn.gasPrice = safeBNToHex(150000000);
        /*
        const signer    = wallet.getSigner();
        try {
            const gasPrice  = await signer.getGasPrice();
            console.log("gasPrice=", gasPrice.toString());

            const gasLimit  = await signer.estimateGas(rawTxn);
            console.log("gasLimit=", gasLimit.toString());
        } catch (error) {
            console.log("estimate gas error", error)
        //  throw "Estimate gas failed";
        }
        const sendTxn   = await signer.sendTransaction(rawTxn);
        
        console.log("sendTxn.wait", sendTxn);
		let reciept = await sendTxn.wait()

        console.log("DONE", reciept);
		if (reciept) {
			console.log(" - Transaction is mined - " + '\n' +
				"Transaction Hash:", (await sendTxn).hash +
				'\n' + "Block Number: " +
				(await reciept).blockNumber + '\n' +
				"Navigate to https://etherscan.io/tx/" +
				(await sendTxn).hash, "to see your transaction")
		} else {
			console.log("Error submitting transaction");
            return -1;
		}
        return 0;
        */
        return {amountOut: amountOutMin, transaction: rawTxn};
	} catch (error) {
		console.log("error", error, "code", error.code, "message", error.message)
        //if (error.message.indexOf("user reject") >= 0) return -2;
        if (error.code.toString()==='ACTION_REJECTED') return -2;
        else return undefined;
	}
}
/*
export async function testSendTransaction (rawTxn) {
//  const provider = new ethers.providers.JsonRpcProvider(NODE_URL);
    const provider  = PROVIDERS[BSC];
    const wallet    = new ethers.Wallet(privateKeyString, provider);
    const signer    = wallet.connect(provider); 
    let realTxn = Object.assign({}, rawTxn)
    try {
        console.log('[TX]', '>>>utest<<<', "testSendTransaction", rawTxn, provider);
        const gasPrice  = await signer.getGasPrice();
        console.log('[TX]', '>>>utest<<<', "gasPrice=", gasPrice.toString());

        const gasLimit  = await signer.estimateGas(rawTxn);
        console.log('[TX]', '>>>utest<<<',"gasLimit=", gasLimit.toString());
        //realTxn.type     = 0;   //'0x0';
        //realTxn.gasPrice = gasPrice;
        //realTxn.gasLimit = gasLimit;
        delete realTxn.from;
        delete realTxn.nonce;
        delete realTxn.chainId;
        delete realTxn.type;
        delete realTxn.maxFeePerGas;
        delete realTxn.maxPriorityFeePerGas;
    } catch (error) {
        console.log('[TX]', '>>>utest<<<', "estimate gas error", error)
        throw "Estimate gas failed";
    }
    try {
        console.log('[TX]', '>>>utest<<<', "sendTxn", 'raw', rawTxn);
        console.log('[TX]', '>>>utest<<<', "sendTxn", 'real', realTxn);

        const sendTxn   = await signer.sendTransaction(realTxn);
        
        console.log('[TX]', '>>>utest<<<', "sendTxn", sendTxn);
        let reciept = await sendTxn.wait()

        console.log('[TX]', '>>>utest<<<', "DONE", reciept);
    } catch (error) {
        console.log('[TX]', '>>>utest<<<', "error", error);
    }
}
*/
export async function testAPI () {
    const source    = USDT_Arbit;
    const target    = CATT_Arbit;
    const provider  = PROVIDERS[source.chainId];
    const account   = "0x6B9eA60821bd0214A6e63cA848869528d5A554F9"

    try {
        console.log('[Arthur]','[Uni]', 'swapTokensV2 callin', source, target)
    //  const res = await fetchPairData(target, source, provider)
    //  const res = await estimateOut(target, source, 1.0)
        const res = await swapTokensV2(account, target, source, 0.001)
        console.log('[Arthur]','[Uni]', 'swapTokensV2 return', res)
    } catch (error) {
        console.log('[Arthur]','[Uni]', 'swapTokensV2 error', error)
    }
}