const { ethers, BigNumber } = require("ethers")
import { ChainId } from "@uniswap/sdk";
import { OPTI, ARBI, BSC } from './tokens';
import router_abi from "./router.json";

export const INIT_CODE_HASH  = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f';

const FACTORY_ADDRESS_ETH_V2    = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const FACTORY_ADDRESS_ARB_V2    = "0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9";
const FACTORY_ADDRESS_OPT_V2    = "0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf";
const FACTORY_ADDRESS_BSC_V2    = "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6";
const FACTORY_ADDRESS_ETH_V3    = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const FACTORY_ADDRESS_ARB_V3    = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const FACTORY_ADDRESS_OPT_V3    = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

export const FACTORY_ADDRESS = {}
FACTORY_ADDRESS[ChainId.MAINNET]    = FACTORY_ADDRESS_ETH_V2;
FACTORY_ADDRESS[ARBI]               = FACTORY_ADDRESS_ARB_V2;
FACTORY_ADDRESS[OPTI]               = FACTORY_ADDRESS_OPT_V2;
FACTORY_ADDRESS[BSC]                = FACTORY_ADDRESS_BSC_V2;

//QUICKNODE
const QUICKN_ARBITRUM_MAINNET   = "https://boldest-broken-thunder.arbitrum-mainnet.quiknode.pro/5a1c020b6aa209af62a2842b8c48b05287bf4d09/"
const QUICKN_Optimism_MAINNET   = "https://purple-evocative-sheet.optimism.quiknode.pro/ea62addba2164087c0134b7a5eadf60e2cc09940/"
const QUICKN_Binance_MAINNET    = "https://newest-quick-pallet.bsc.quiknode.pro/d55863923e9e09ba9d635baa05f2714478fe4eaa/"
// BSC  QN_786027639cfc494eaaade65c35c11455

//INFURA
const INFURA_ETHEREUM_MAINNET = "https://mainnet.infura.io/v3/2db519c12f574787a412ab22a36e92bb"
const INFURA_ARBITRUM_MAINNET = "https://arbitrum-mainnet.infura.io/v3/2db519c12f574787a412ab22a36e92bb"
const INFURA_ARBITRUM_SEPOLIA = "https://arbitrum-sepolia.infura.io/v3/2db519c12f574787a412ab22a36e92bb"
const INFURA_Optimism_MAINNET = "https://optimism-mainnet.infura.io/v3/2db519c12f574787a412ab22a36e92bb"
const INFURA_Optimism_SEPOLIA = "https://optimism-sepolia.infura.io/v3/2db519c12f574787a412ab22a36e92bb"

export const Infura = {}
Infura[ChainId.MAINNET] = INFURA_ETHEREUM_MAINNET;
Infura[ARBI]            = QUICKN_ARBITRUM_MAINNET;  //INFURA_ARBITRUM_MAINNET;
Infura[OPTI]            = QUICKN_Optimism_MAINNET;  //INFURA_Optimism_MAINNET;
Infura[BSC]             = QUICKN_Binance_MAINNET;

export const PROVIDERS = {}
PROVIDERS[ChainId.MAINNET] = new ethers.providers.getDefaultProvider(Infura[ChainId.MAINNET]);
PROVIDERS[ARBI] = new ethers.providers.getDefaultProvider(Infura[ARBI]);
PROVIDERS[OPTI] = new ethers.providers.getDefaultProvider(Infura[OPTI]);
PROVIDERS[BSC]  = new ethers.providers.getDefaultProvider(Infura[BSC]);

const UNISWAP_ROUTER_ETH_V2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const UNISWAP_ROUTER_ARB_V2 = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24";
const UNISWAP_ROUTER_OPT_V2 = "0x4A7b5Da61326A6379179b40d00F57E5bbDC962c2";
const UNISWAP_ROUTER_BSC_V2 = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24"

const UNISWAP_ROUTER_ETH_V3 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const UNISWAP_ROUTER_ARB_V3 = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24";
const UNISWAP_ROUTER_OPT_V3 = "0x4A7b5Da61326A6379179b40d00F57E5bbDC962c2";

export const RouterAddress = {}
RouterAddress[ChainId.MAINNET]  = UNISWAP_ROUTER_ETH_V2;   //"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
RouterAddress[ARBI]             = UNISWAP_ROUTER_ARB_V2;       //"0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24";
RouterAddress[OPTI]             = UNISWAP_ROUTER_OPT_V2; 
RouterAddress[BSC]              = UNISWAP_ROUTER_BSC_V2; 

const UNISWAP_ROUTER_ABI = router_abi;

export function getUniRouter(chain) {
    const provider  = PROVIDERS[chain];
    const address   = RouterAddress[chain];
    const contract  = new ethers.Contract(address, UNISWAP_ROUTER_ABI, provider);
    
    return contract;
}

