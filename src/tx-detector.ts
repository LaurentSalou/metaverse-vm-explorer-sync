import { ethers, BigNumber } from "ethers"
import { Interface } from 'ethers/lib/utils'
import { MongoDBConfig } from './config/mongodb.config'
import { ABI_DNA_TOKEN } from './contracts/dna'
import { ABI_GENE_TOKEN } from './contracts/gene'
import { ABI_SWAP_FACTORY } from './contracts/gene-finance/swap-factory.contract'
import { ABI_SWAP_MASTERCHEF } from './contracts/gene-finance/swap-masterchef.contract'
import { ABI_SWAP_PAIR } from './contracts/gene-finance/swap-pair.contract'
import { ABI_SWAP_ROUTER_V2 } from './contracts/gene-finance/swap-router-v2.contract'
import { ABI_USDT_TOKEN } from './contracts/usdt.contract'
import { ABI_WETP_TOKEN } from './contracts/wetp.contract'
import { MongoDB, TransactionModel, } from './database/mongodb.db'

interface TokenContractDefinition {
    id: string
    abi: any
    type: string
    metadata: TokenInfo
}

export interface TokenInfo {
    decimals: number
    symbol: string
    name: string
}

interface SwapRouterContractDefinition {
    id: string
    abi: any
    type: 'router',
    metadata: {
        name: string
    }
}

interface SwapContractDefinition {
    id: string
    abi: any
    type: string
    metadata: {
        token0: TokenInfo
        token1: TokenInfo
    }
}

interface SwapFactoryContractDefinition {
    id: string
    abi: any
    type: 'factory',
    metadata: {}
}

interface DefaultContractDefinition {
    id: string
    abi: any
    type: string,
    metadata: {}
}

export const TOKEN_CONTRACTS: { [contractId: string]: TokenContractDefinition | SwapContractDefinition | SwapRouterContractDefinition | SwapFactoryContractDefinition | DefaultContractDefinition } = {
    '0x196D99F873411f2b68F16EeAdA6eFFA6eaA2d924':{
        id: '0x196D99F873411f2b68F16EeAdA6eFFA6eaA2d924',
        type: 'masterchef',
        abi: ABI_SWAP_MASTERCHEF,
        metadata: {
            name: 'gene.finance masterchef'
        }
    },
    '0xcFe83d92B1dC366BE2d03F4baF5b23e30427394b':{
        id: '0xcFe83d92B1dC366BE2d03F4baF5b23e30427394b',
        type: 'factory',
        abi: ABI_SWAP_FACTORY,
        metadata: {
            name: 'gene.finance factory'
        }
    },
    '0xa61258EC3A0f0c99461Ea2F3458930a1dBEacF16':{
        id: '0xa61258EC3A0f0c99461Ea2F3458930a1dBEacF16',
        type: 'router',
        abi: ABI_SWAP_ROUTER_V2,
        metadata: {
            name: 'gene.finance router v2'
        }
    },
    '0x662B1B37EB45925adCdc76437ad9f1865fcEcBC8': {
        id: '0x662B1B37EB45925adCdc76437ad9f1865fcEcBC8',
        abi: ABI_SWAP_PAIR,
        type: 'swap',
        metadata: {
            token0: {
                decimals: 6,
                symbol: 'USDT',
                name: 'Metaverse-peg USDT Token',
            },
            token1: {
                decimals: 18,
                symbol: 'WETP',
                name: 'Wrapped ETP',
            },
        }
    },
    '0x527678F2B807b6d57fAd27651344Cc72B0d68F8f': {
        id: '0x527678F2B807b6d57fAd27651344Cc72B0d68F8f',
        abi: ABI_SWAP_PAIR,
        type: 'swap',
        metadata: {
            token0: {
                decimals: 6,
                symbol: 'USDT',
                name: 'Metaverse-peg USDT Token',
            },
            token1: {
                decimals: 18,
                symbol: 'GENE',
                name: 'Gene Token',
            },
        }
    },
    '0xCA1C0bB48640c0d654a7eCE5c895281fE68eA0AF': {
        id: '0xCA1C0bB48640c0d654a7eCE5c895281fE68eA0AF',
        abi: ABI_SWAP_PAIR,
        type: 'swap',
        metadata: {
            token0: {
                decimals: 6,
                symbol: 'USDT',
                name: 'Metaverse-peg USDT Token',
            },
            token1: {
                decimals: 4,
                symbol: 'DNA',
                name: 'Metaverse DNA Chain Token',
            },
        }
    },
    '0x623761F60D677addBD5A07385e037105A13201EF': {
        id: '0x623761F60D677addBD5A07385e037105A13201EF',
        abi: ABI_USDT_TOKEN,
        type: 'token',
        metadata: {
            decimals: 6,
            symbol: 'USDT',
            name: 'Metaverse-peg USDT Token',
        }
    },
    '0xD2aEE12b53895ff8ab99F1B7f73877983729888f': {
        id: '0xD2aEE12b53895ff8ab99F1B7f73877983729888f',
        abi: ABI_GENE_TOKEN,
        type: 'token',
        metadata: {
            decimals: 18,
            symbol: 'GENE',
            name: 'Gene Token',
        },
    },
    '0xC35F4BFA9eA8946a3740AdfEb4445396834aDF62': {
        id: '0xC35F4BFA9eA8946a3740AdfEb4445396834aDF62',
        abi: ABI_DNA_TOKEN,
        type: 'token',
        metadata: {
            decimals: 4,
            symbol: 'DNA',
            name: 'Metaverse DNA Chain Token',
        },
    },
    '0x757938BBD9a3108Ab1f29628C15d9c8715d2F481': {
        id: '0x757938BBD9a3108Ab1f29628C15d9c8715d2F481',
        abi: ABI_WETP_TOKEN,
        type: 'token',
        metadata: {
            decimals: 18,
            symbol: 'WETP',
            name: 'Wrapped ETP',
        },
    },
}

async function getContractInterface(contractId: string): Promise<Interface | undefined> {
    return TOKEN_CONTRACTS[contractId] ? new ethers.utils.Interface(TOKEN_CONTRACTS[contractId].abi) : undefined
}

async function isToken(contractId: string) {
    return TOKEN_CONTRACTS[contractId] ? TOKEN_CONTRACTS[contractId].type === 'token' : false
}

async function getContractMetadata(contractId: string) {
    return TOKEN_CONTRACTS[contractId]?.metadata
}

async function getContractIds() {
    return Object.keys(TOKEN_CONTRACTS)
}

(async () => {

    // const web3 = new Web3(Web3Config.url)

    const database = new MongoDB(MongoDBConfig.url)

    let done = false

    const STOP_WHEN_DONE = false

    while (!done) {

        const transactions = await TransactionModel.find({
            to: { $in: await getContractIds() },
            // hash: '0xb1c05c6ec54633145e30eff53e3a4661c54b4b80b372baa2b9f73ac7635090a5'
            details: { '$exists': false },
        }, {
            hash: 1,
            input: 1,
            from: 1,
            to: 1,
            receipt: 1,
            value: 1,
        }, {
            limit: 1000,
        })

        if (STOP_WHEN_DONE && transactions.length === 0) {
            done = true
        }


        for (let transaction of transactions) {
            if([
                '0xf74deba916d49d4456a7db0721b6095eb2030b8d557ee318bf8dd9f1d606f403',
                '0x3ceb950c044882d191d1b95f9b865cc08cea07b3af72d62db6aa5a3a3dfbb0bd',
            ].indexOf(transaction.hash)!==-1){
                continue
            }
            try {
                const details = await parseTransactionDetails({ to: transaction.to, from: transaction.from, data: transaction.input, value: transaction.value, logs: transaction.receipt?.logs })

                await TransactionModel.updateOne({ hash: transaction.hash }, { $set: { details } })
                console.log(`updated transaction ${transaction.hash}`)
            } catch (error) {
                console.error(`could not decode transaction data for transaction ${transaction.hash} to contract ${transaction.to}: ${error.message}`)
            }
        }

        console.log(`processed ${transactions.length} transactions`)

        await sleepSeconds(10)
    }

    await database.disconnect()

})()

function sleepSeconds(seconds: number) {
    return new Promise(resolve => {
        setTimeout(() => resolve(seconds), seconds * 1000)
    })
}

export interface TransactionData {
    data: string
    from: string
    value?: any,
    to: string
    logs: LogData[]
}

export interface LogData {
    topics: string[]
    data: string
    address: string
}

export async function parseTransactionDetails(tx: TransactionData): Promise<TransactionDetails> {
    const details: TransactionDetails = {
        call: tx.data !== '0x' ? await parseTransactionData(tx) : undefined,
        logs: await Promise.all(tx.logs?.map(log => parseLog(log)) || []),
        contract_metadata: await getContractMetadata(tx.to),
    }
    if (await isToken(tx.to) && details.call && details.call.name === 'transfer') {
        details.type = 'token_transfer'
        details.metadata = {
            from: tx.from,
            to: details.call.inputs[0].value,
            value: details.call.inputs[1].value,
            decimals: details.contract_metadata.decimals,
            name: details.contract_metadata.name,
            symbol: details.contract_metadata.symbol,
            contract: tx.to,
        }
    }
    return details
}

interface TransactionDetails {
    call: TransactionCallData | undefined
    logs: Array<TransactionDetailLogData | LogData>
    type?: string
    contract_metadata: any
    metadata?: {
        from: string
        to: string
        value: string
        decimals: string
        name: string
        symbol: string
        contract: string
    },
}

export async function parseLog(_log: LogData): Promise<TransactionDetailLogData | LogData> {
    const abi = await getContractInterface(_log.address)
    if (abi === undefined) {
        return _log
    }
    const log = abi.parseLog(_log)
    return {
        args: log.eventFragment.inputs.map((input, index) => ({
            name: input.name,
            type: input.type,
            value: BigNumber.isBigNumber(log.args[index]) ? log.args[index].toString() : log.args[index],
        })),
        address: _log.address,
        data: _log.data,
        name: log.name,
        signature: log.signature,
        topic: log.topic,
    }
}

export interface TransactionDetailLogData {
    args: {
        name: string
        type: string
        value: any
    }[]
    address: string
    data: string
    name: string
    signature: string
    topic: string
}

export interface TransactionCallData {
    name: string
    inputs: {
        name: string
        type: string
        value: any
    }[]
    outputs: { type: string }[] | undefined
    payable: boolean
    stateMutability: string
}

export async function parseTransactionData(tx: TransactionData): Promise<TransactionCallData> {
    const abi = await getContractInterface(tx.to)
    if (abi === undefined) {
        throw Error(`contract ${tx.to} is missing abi`)
    }
    const r = abi.parseTransaction(tx)
    return {
        name: r.functionFragment.name,
        inputs: r.functionFragment.inputs?.map((input, index) => ({
            name: input.name,
            type: input.type,
            value: input.type === 'uint256' ? r.args[index].toString() : r.args[index],
        })),
        outputs: r?.functionFragment?.outputs?.map(output => ({ type: output.type })),
        payable: r.functionFragment.payable,
        stateMutability: r.functionFragment.stateMutability,
    }
}