import Web3 from 'web3'
import { Block } from 'web3-eth'
import { MongoDBConfig } from './config/mongodb.config'
import { Web3Config } from './config/web3.config'
import { MongoDB } from './database/mongodb.db'
import { TransactionReceipt, Log, Transaction } from './interfaces/transaction.interface'

const WAIT_TIME_MILLIS = 1000;

(async () => {

    const web3 = new Web3(Web3Config.url)

    // skip db writes
    const DRY_RUN = false

    const VERBOSE = false

    const database = new MongoDB(MongoDBConfig.url)

    let height = Number(process.env.START_HEIGHT) || await database.getHeight()

    // first transaction on andromeda
    // height = 39995

    if (height > 0) {
        console.info('found blockdata with height ' + height)
        if (!DRY_RUN) {
            await database.popBlocks(--height)
        } else {
            console.warn('skip database write because simulation is activated')
        }
        console.log('height adjusted to ' + height)
    }

    console.info('start sync at height ' + height)

    let parentBlock: Block = height > 0 ? await database.getBlockByNumber(height - 1) : null

    while (true) {
        try {

            console.log('process height', height)
            let block = await web3.eth.getBlock(height, true)

            // detect reorg
            if (height > 0) {
                let targetHeight = height
                if (targetHeight > 0 && block && parentBlock && parentBlock.hash !== block.parentHash) {
                    // reorg detected - search for common ancestor
                    while (targetHeight > 0 && block && parentBlock && parentBlock.hash !== block.parentHash) {
                        console.log(`block ${block.number} parent hash ${block.parentHash} does not match parent ${parentBlock.hash}`)
                        targetHeight--
                        console.log('check previous block', targetHeight)
                        block = await web3.eth.getBlock(targetHeight, true)
                        parentBlock = await database.getBlockByNumber(targetHeight - 1)
                    }
                    console.log(`reorg detected from ${height} back to ${targetHeight}. common ancestor is ${parentBlock.hash}`)
                    // apply reorg
                    if (!DRY_RUN) {
                        await database.popBlocks(targetHeight - 1)
                    }
                    height = targetHeight
                    continue
                }
            }
            console.log(`loaded block #${block.number} ${block.hash} with ${block.transactions.length} transactions`)
            if (VERBOSE) {
                console.info({ block })
            }
            if (block.transactions.length > 0) {
                let logs: Log[] = []
                const txs = await Promise.all(block.transactions.map(async (tx: Transaction) => {
                    // const tx: Transaction = await web3.eth.getTransaction(txid)
                    console.log(tx.hash)
                    tx.confirmedAt = block.timestamp
                    let receipt: TransactionReceipt | undefined
                    if (
                        [
                            '0x7221d7eae52d080d5d2a0a298abc3e841d304ac07d84cbfb7216bb0ab0d55b64',
                            '0xf4181a6f9ba3aa798941fd8123f4e3eb113d8d342d3091f904b334fb732fc0eb',
                            '0x2cab87f82737d76160c28363e6e1e74e5c93f80c6fc62c166d2b11f734666399',
                            '0xe2d421c53d31a79ac3075da148dbba5e60ce57966c006dff8e14a09095f755c2',
                            '0xf04533d11c9ab7b985dafd49d87d9dfbab61fd0ab73951786764e4f9e797dc62',
                            '0x68b1cecd06c518834b85ed403f7e368508a0b271d54b686400614ef411541209',
                            '0x39b30c4d72a717b20e6d898246cb1f2648dff45b9ccb045a80cb741d93576811',
                            '0x9c92fcb276649a281fdf11bde479160b8c709b2c3e1c9775a57b6c4bf2ac3ad7',
                            '0x11e4dcbfd51f1121e37935d5f782ee4a05abd42bcbb556c8e4f0c2fd60af338f',
                            '0xf9ecbb6da47aca577cc8113243fd45986aa42fa3508bd4eef7fd2abeb9cc7e36',
                            '0x18c39e91ff209a8b9a52ea3d65e33372fbb374bfdb0882b4abb16938f827736c',
                            '0xd27e669f4df92fcd85731b99279b2a19dfcfb790b2d1094f850c54ac0d4cff60',
                            '0x59151e6796ffd8e35ac44364fa2b3eb33f8ae797c25d32ebb9fc877863f2ab09',
                            '0xef5f65458d96d5773a84ce0eb9352c5fdcd8e90ecf39724f99d9dee4c4445ac7',
                            '0x3e53af741da2dbc6b53704157f6863de6f0ed42635e4a60983c3862f4574e6a1',
                            '0xb98470bf60f8c642a7c633c251bf44ad373ff081e2787201b4bece48239df790',
                            '0x669fee540fa536b1cde180798ace2cb3617780b007787978df2e1f9da73736eb',
                            '0x1026119560fc6e6c8c4bfabbfbb8a7c0a06f8f90d7a28740c785cbb366804ef4',
                            '0x771f6c4820fc9b5c246b7e9a995a78c40ff428fabbdf9fda194fd28ad9d114da',
                            '0xd3c3ca7c8d9b20f87d81f33c767cd5033da2292df94870e77d076f273b32e09a',
                        ].indexOf(block.hash) === -1
                        &&
                        [
                            '0xa003975aa8ba46c056f0fdb27e5441e421523bdf9b5dd6f575a53470028e5b36',
                            '0x26172d8bffb0287ffa86fc31749aa1d3cc3bf2322bd541c07dc5e66c2f847c4d',
                            '0x10eba8aad6d55a84b24a3edd81acd0de53d408e4f0f8aeccf3f7289a7df05d13',
                            '0x2ab89df29a951c7e75caa4e39f62fc866a7b1c1d90b93401e4ebb975397ec018',
                            '0xb4fcce606116a393444b4fbe0cd1ae873df227008454c826cfcfdf0d8f581141',
                            '0xb1c05c6ec54633145e30eff53e3a4661c54b4b80b372baa2b9f73ac7635090a5',
                            '0x8ee317171a0887d7f6e48d9f90888b3b4ede6a31456171f8a6f2c1eea0866ae0',
                            '0x911155ba9f4e91dc3c6c4080a32df4e5caca3b180e8cbb116844a276aa6198dc',
                        ].indexOf(tx.hash) === -1) {
                        receipt = await web3.eth.getTransactionReceipt(tx.hash)
                        logs = logs.concat(receipt.logs)
                    }
                    const txrecord = { ...tx, receipt, confirmedAt: block.timestamp }
                    if (VERBOSE) {
                        console.info({ txrecord })
                    }
                    return txrecord
                }))
                if (txs.length && !DRY_RUN) {
                    await database.storeTransactions(txs)
                    await database.storeLogs(logs)
                }
            }
            if (!DRY_RUN) {
                const b = {
                    ...block,
                    transactions: block.transactions.map(tx => tx.hash)
                }
                await database.storeBlocks([b])
            } else {
                console.warn('skip database write because simulation is activated')
            }
            height++
            parentBlock = block
            // console.log({block})
        } catch (error) {
            console.log(error.message)
            await sleep(WAIT_TIME_MILLIS)
        }
    }


})()

function sleep(millis: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(millis)
        }, millis)
    })
}
