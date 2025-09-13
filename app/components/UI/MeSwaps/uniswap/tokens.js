import { Token, ChainId } from "@uniswap/sdk";

export const OPTI   = 10
export const ARBI   = 42161
export const BSC    = 56

export class ExToken extends Token {
    constructor(chainId, address, decimals, symbol, name, icon, rate) {
        super(chainId, address, decimals, symbol, name);
        this.icon = icon;
        this.rate = rate;
    }
}

export const USDT_Ether = new ExToken(
    ChainId.MAINNET,
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    6,
    "USDT",
    "Tether USD",
    "l_usdt.svg",
    1,
);
export const USDT_Arbit = new ExToken(
    ARBI,
    "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    6,
    "USDT",
    "Tether USD",
    "l_usdt.svg",
    1
);
export const USDT_Optim = new ExToken(
    OPTI,
    "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    6,
    "USDT",
    "Tether USD",
    "l_usdt.svg",
    1
);
export const CATT_Ether = new ExToken(
    ChainId.MAINNET,
    "0x6B8835Baa4F0Bf1C6C08abBEaCb908F47C459901",
    18,
    "CATT",
    "CATT",
    "catt.png",
    0.0001
);
export const CATT_Arbit = new ExToken(
    ARBI,
    "0x36D5E58F99C5e1468FFD447E5f6E8B05d7DCdFa4",
    18,
    "CATT",
    "CATT",
    "catt.png",
    0.0001
);
export const CATT_Optim = new ExToken(
    OPTI,
    "0xD09D39c873B844E3f826074362775F1B761F54b6",
    18,
    "CATT",
    "CATT",
    "catt.png",
    0.0001
);

var _WETH;
export const WETH = (_WETH = {}, 
            _WETH[ChainId.MAINNET] = /*#__PURE__*/new ExToken(ChainId.MAINNET, 
                        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
                        18, 
                        'ETH', 
                        'Wrapped Ether',
                        "eth.png",
                        1975), 
            _WETH[ChainId.ROPSTEN] = /*#__PURE__*/new ExToken(ChainId.ROPSTEN, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'), 
            _WETH[ChainId.RINKEBY] = /*#__PURE__*/new ExToken(ChainId.RINKEBY, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'), 
            _WETH[ChainId.GÖRLI] = /*#__PURE__*/new ExToken(ChainId.GÖRLI, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18, 'WETH', 'Wrapped Ether'), 
            _WETH[ChainId.KOVAN] = /*#__PURE__*/new ExToken(ChainId.KOVAN, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH', 'Wrapped Ether'), 
            _WETH[ARBI] = /*#__PURE__*/new ExToken(ARBI, 
                        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', 
                        18, 
                        'ETH',  
                        'Wrapped Ether',
                        "eth.png",
                        1975),
            _WETH[OPTI] = /*#__PURE__*/new ExToken(OPTI, 
                '0x4200000000000000000000000000000000000006', 
                18, 
                'ETH',  
                'Wrapped Ether',
                "eth.png",
                1975),
            _WETH,
            _WETH[BSC] = /*#__PURE__*/new ExToken(BSC, 
                //'0x4db5a66e937a9f4473fa95b1caf1d1e1d62e29ea', 
                '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                18, 
                'ETH',  
                'Wrapped Ether',
                "eth.png",
                1975),
            _WETH);
            