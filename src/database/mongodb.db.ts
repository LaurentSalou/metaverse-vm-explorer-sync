import { BlockTransactionString, } from 'web3-eth'
import { VMLog, VMDB } from './index.db'
import { Schema, connect, model, Mongoose } from 'mongoose'

export const BlockSchema = new Schema({
    number: {
        type: Number,
        index: true,
    },
    hash: {
        type: String,
        unique: true,
    },
    size: Number,
    transactions: [String],
    parentHash: String,
    timestamp: Number,
    gasUsed: Number,
    miner: String,
}, {
    collection: 'block',
})



export const LogSchema = new Schema({
    id: {
        type: String,
    },
    transactionHash: {
        type: String,
        index: true,
    },
    transactionIndex: Number,
    logIndex: Number,
    address: String,
    blockNumber: Number,
    blockHash: String,
    data: String,
    gas: Number,
    gasPrice: Number,
    creates: String,
    removed: Boolean,
    topics: [String],
}, {
    collection: 'log',
}).index({
    transactionHash: 1,
    logIndex: 1,
}, { unique: true })

export const TransactionLogSchema = new Schema({
    id: {
        type: String,
    },
    transactionHash: {
        type: String,
    },
    transactionIndex: Number,
    logIndex: Number,
    address: String,
    blockNumber: Number,
    blockHash: String,
    data: String,
    gas: Number,
    gasPrice: Number,
    creates: String,
    removed: Boolean,
    topics: [String],
})

export const TransactionReceiptSchema = new Schema({
    status: Boolean,
    transactionHash: String,
    transactionIndex: Number,
    blockHash: String,
    blockNumber: Number,
    from: String,
    to: String,
    contractAddress: String,
    cumulativeGasUsed: Number,
    gasUsed: Number,
    logs: [TransactionLogSchema],
    logsBloom: String,
})


export const TransactionSchema = new Schema({
    hash: {
        type: String,
        unique: true,
    },
    blockHash: {
        type: String,
    },
    blockNumber: Number,
    from: {
        type: String,
        index: true,
    },
    to: {
        type: String,
        index: true,
    },
    value: String,
    gas: Number,
    nonce: Number,
    publicKey: String,
    raw: String,
    input: String,
    type: String,
    gasPrice: Number,
    creates: {
        type: String,
        index: true,
    },
    receipt: TransactionReceiptSchema,
    confirmedAt: {
        type: Number,
        index: true,
    },
    details: Object,
}, {
    collection: 'tx',
})

export const BlockModel = model('Block', BlockSchema)
export const TransactionModel = model('Tx', TransactionSchema)
export const LogModel = model('Log', LogSchema)

export class MongoDB implements VMDB {
    db: Promise<Mongoose>
    constructor(url: string) {
        this.db = connect(url, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    }
    async disconnect(){
        if(this.db){
            const db = await this.db
            db.disconnect()
        }
    }
    storeBlocks(blocks: BlockTransactionString[]) {
        return BlockModel.bulkWrite(blocks.map(block => ({
            updateOne: {
                filter: { hash: block.hash },
                update: block,
                upsert: true,
            }
        })))
    }
    storeTransactions(txs: any[]) {
        return TransactionModel.bulkWrite(txs.map(tx => ({
            updateOne: {
                filter: { hash: tx.hash },
                update: tx,
                upsert: true,
            }
        })))
    }
    storeLogs(logs: VMLog[]) {
        return LogModel.bulkWrite(logs.map(log => ({
            updateOne: {
                filter: { transactionHash: log.transactionHash, logIndex: log.logIndex },
                update: log,
                upsert: true,
            }
        })))
    }
    async getBlockByNumber(number: number) {
        return await BlockModel.findOne({number})
    }
    async getBlockByHash(hash: string) {
        return await BlockModel.findOne({hash})
    }
    async getHeight() {
        const latestBlock = await BlockModel.findOne({}, {hash: 1, number: 1}, {sort: {number: -1}})
        return latestBlock ? latestBlock.number : 0
    }
    async removeHeightData(height: number) {
        if(height<=0) return height
        await BlockModel.deleteMany({number: height})
        await TransactionModel.deleteMany({blockNumber: height})
        await LogModel.deleteMany({blockNumber: height})
        return height
    }
    async popBlocks(targetHeight: number) {
        if(targetHeight<=0) return targetHeight
        await BlockModel.deleteMany({number: {$gt: targetHeight}})
        await TransactionModel.deleteMany({blockNumber: {$gt: targetHeight}})
        await LogModel.deleteMany({blockNumber: {$gt: targetHeight}})
        return targetHeight
    }
}



