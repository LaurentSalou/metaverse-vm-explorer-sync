import { MongoDBConfig } from './config/mongodb.config'
import { Web3Config } from './config/web3.config'
import { MongoDB, TransactionModel } from './database/mongodb.db'
import ora from 'ora'
import { uniq } from 'lodash'
import { Command } from 'commander'

const GENE_FINANCE_ROUTER_V2_CONTRACT_ID = '0xa61258EC3A0f0c99461Ea2F3458930a1dBEacF16'

const program = new Command('mvs-explorer-cli')
program.version('0.0.1')

program
    .command('config')
    .description('show current config')
    .action(() => {
        console.log(JSON.stringify({
            db: MongoDBConfig,
            web3: Web3Config,
        }))
    })

program
    .command('pop-blocks <height>')
    .description('remove blocks')
    .action(async (height: number) => {
        const spinner = ora('Connect database').start()
        const database = new MongoDB(MongoDBConfig.url)
        const result = await database.popBlocks(height)
        spinner.stop()
        console.log(JSON.stringify(result))
        await database.disconnect()
    })

program
    .command('tokentxs')
    .option('--from', 'from address')
    .option('--to', 'to address')
    .option('--limit', 'number of transactions to show (default: 100)')
    .description('list txs')
    .action(async () => {
        const spinner = ora('Connect database').start()
        const database = new MongoDB(MongoDBConfig.url)
        const txs = await TransactionModel.find({ details: { $exists: true }, 'details.type': 'token_transfer' }, { hash: 1, 'details.metadata': 1 }, { limit: 100 })
        spinner.stop()
        console.log(JSON.stringify(txs))
        await database.disconnect()
    })

program
    .command('listcontractusers <contractId>')
    .option('--limit <limit>', 'number of transactions to show', "100")
    .description('list accounts that called a contract')
    .action(async (contractId: string, options) => {
        const spinner = ora('Connect database').start()
        const database = new MongoDB(MongoDBConfig.url)
        const txs = await TransactionModel.find({ to: contractId }, { from: 1 }, { limit: parseInt(options.limit) })
        spinner.stop()
        console.log(JSON.stringify(uniq(txs.map((tx:any)=>tx.from))))
        await database.disconnect()
    })

program
    .command('listswaps')
    .option('--from', 'from address')
    .option('--to', 'to address')
    .option('--limit', 'number of transactions to show (default: 100)')
    .description('list txs')
    .action(async () => {
        const spinner = ora('Connect database').start()
        const database = new MongoDB(MongoDBConfig.url)
        const txs = await TransactionModel.find(
            {
                //hash: '0x4cbb1aeca3b41da6d38352b05bd108f94fe276cc4e7ce1343398e4b0aba20d43',
                details: { $exists: true },
                to: GENE_FINANCE_ROUTER_V2_CONTRACT_ID,
                'details.call.name': {
                    $in: [
                        'swapExactTokensForETH',
                        'swapExactTokensForTokens',
                        'swapExactETHForTokens',
                    ]
                },
                'receipt.status': true, // only successful
            },
            {
                _id: false,
                hash: 1,
                from: 1,
                'details.call': 1,
                'details.logs': 1,
            }, {
            limit: 10,
        })

        spinner.stop()
        console.log(JSON.stringify(txs.map(({ hash, from, details }: { hash: string, from: string, details: any }) => {
            const [tokenSwapLog] = details.logs?.filter((e: any) => e.signature == "Swap(address,uint256,uint256,uint256,uint256,address)")
            const [sender, amount0In, amount1In, amount0Out, amount1Out, to] = tokenSwapLog?.args
            const swapEvent = { sender: sender.value, amount0In: amount0In.value, amount1In: amount1In.value, amount0Out: amount0Out.value, amount1Out: amount1Out.value, to: to.value }
            const path = details?.call?.inputs.filter((input: any) => input.name==='path')[0]?.value
            const functionName = details?.call?.name
            let fromSymbol = functionName == 'swapExactETHForTokens' ? 'ETP' : path[0]
            let toSymbol = functionName == 'swapExactTokensForETH' ? 'ETP' : path[path.length-1]
            return {
                hash,
                user: from,
                type: details.call.name,
                fromSymbol,
                ...swapEvent,
                fromAmount: swapEvent.amount0Out,
                toSymbol,
                toAmount: swapEvent.amount1In,
                // path: details?.call?.inputs.filter((input: any) => input.name==='path')[0]?.value,
                // swapEvent,
            }
        }), null, 2))
        await database.disconnect()
    })

program
    .command('block <hash>')
    .description('show block info')
    .action(async (hash: string) => {
        const spinner = ora('Connect database').start()
        const database = new MongoDB(MongoDBConfig.url)
        spinner.text = 'Fetch block'
        const block = await database.getBlockByHash(hash)
        spinner.stop()
        console.log(JSON.stringify(block))
        await database.disconnect()
    })

program
    .command('verify-blocks')
    .description('verify block headers')
    .action(async (hash: string) => {
        let parentHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
        const database = new MongoDB(MongoDBConfig.url)
        let height = 0
        while (true) {
            const block = await database.getBlockByNumber(height)
            if (block.parentHash !== parentHash) {
                console.log(`error found at height ${height} blockHash ${block.hash}`)
                break
            } else {
                console.debug(`block ${height} ok`)
                height++
                parentHash = block.hash
            }
        }
        await database.disconnect()
    })


program.parse(process.argv)