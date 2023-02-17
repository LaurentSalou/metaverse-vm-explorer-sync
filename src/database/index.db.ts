import { Log } from 'web3-core'
import { Block, BlockTransactionString, TransactionReceipt } from 'web3-eth'

export interface VMLog extends Log {
    id?: string
}

export interface VMDB {
    storeBlocks: (blocks: BlockTransactionString[]) => Promise<unknown>
    storeTransactions: (txs: TransactionReceipt[]) => Promise<unknown>
    storeLogs: (logs: VMLog[]) => Promise<unknown>
    getHeight: () => Promise<number>
    getBlockByNumber: (number: number) => Promise<Block>
    getBlockByHash: (hash: string) => Promise<Block>
    popBlocks: (targetHeight: number) => Promise<number>
}