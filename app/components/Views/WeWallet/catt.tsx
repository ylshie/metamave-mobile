import { chain } from "lodash"

const chain_arb = '0xa4b1'
const chain_bsc = '0x38'
const address_arb = '0x36D5E58F99C5e1468FFD447E5f6E8B05d7DCdFa4'
const address_bsc = '0xAd2a02235a8872b39aaD8C760B3830714507AcbC'

const Catt_Arb: {
    chain: `${number}`,
    chainid: `0x${string}`,
    address: `0x${string}`,
    symbol: string,
    decimals: number,
    image: string,
    name: string,
} = {
    chain: chain_arb,
    chainid: chain_arb,
    address: address_arb,
    symbol: 'Catt',
    decimals: 18,
    image: '',
    name: 'Catt'
}

const Catt_Bsc: {
    chain: `${number}`,
    chainid: `0x${string}`,
    address: `0x${string}`,
    symbol: string,
    decimals: number,
    image: string,
    name: string,
} = {
    chain: chain_bsc,
    chainid: chain_bsc,
    address: address_bsc,
    symbol: 'Catt',
    decimals: 18,
    image: '',
    name: 'Catt'
}

export const Catt = Catt_Bsc
