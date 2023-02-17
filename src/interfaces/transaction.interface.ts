export interface Transaction {
    hash: string
    blockHash?: string | null
    blockNumber?: number | null
    from: string
    to: string | null
    value: string
    gas: number
    nonce: number
    input: string
    gasPrice: string
    creates?: string
    receipt?: TransactionReceipt
    confirmedAt?: number | string
}

export interface TransactionReceipt {
    status: boolean
    transactionHash: string
    transactionIndex: number
    blockHash: String,
    blockNumber: number
    from: string
    to: string
    contractAddress?: string
    cumulativeGasUsed: number
    gasUsed: number
    logs: Log[],
    logsBloom: string,
}

export interface Log {
    address: string;
    data: string;
    topics: string[];
    logIndex: number;
    transactionIndex: number;
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
}