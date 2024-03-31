import * as anchor from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
import { ExchangeMarket } from '../target/types/exchange_market'
import ExchangeProgram from '../app'
import { createMintAndMintTo } from '@sen-use/web3'
import { expect } from 'chai'

const getPrice = (price: number) => {
  return new anchor.BN(price * 10 ** 9)
}

describe('exchange-market', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const program = anchor.workspace.ExchangeMarket as Program<ExchangeMarket>

  const LibraryProgram = new ExchangeProgram(
    provider,
    program.programId.toBase58(),
  )
  // Context
  const BID_TOTAL = new anchor.BN(100)
  const BID_PRICE = getPrice(2) // 2 ask Mint
  const START_AFTER = new anchor.BN(0)
  const END_AFTER = new anchor.BN(10000)

  let BID_MINT: anchor.web3.Keypair // SOL = 1$
  let ASK_MINT: anchor.web3.Keypair // USDC
  let RETAILER = anchor.web3.Keypair.generate()
  let ORDER = anchor.web3.Keypair.generate()

  const viewData = (obj: any) => {
    const result: any = {}
    for (const key in obj) {
      result[key] = obj[key].toString()
      if (key === 'state') result[key] = JSON.stringify(obj[key])
    }
    return result
  }

  before('Is generate data!', async () => {
    BID_MINT = anchor.web3.Keypair.generate()
    ASK_MINT = anchor.web3.Keypair.generate()

    await createMintAndMintTo(provider, {
      amount: new anchor.BN(10000000000),
      mint: BID_MINT,
    })
    await createMintAndMintTo(provider, {
      amount: new anchor.BN(10000000000),
      mint: ASK_MINT,
    })
  })

  it('Is initialized retailer!', async () => {
    const { txId } = await LibraryProgram.initializeRetailer({
      askMint: ASK_MINT.publicKey,
      bidMint: BID_MINT.publicKey,
      retailer: RETAILER,
      bidPrice: BID_PRICE,
      bidTotal: BID_TOTAL,
      endAfter: END_AFTER,
      startAfter: START_AFTER,
    })
    console.log('Your transaction signature', txId)
  })

  it('Retailer data after initialize!', async () => {
    const retailerData = await program.account.retailer.fetch(
      RETAILER.publicKey,
    )
    const retailerReserve = await LibraryProgram.getRetailerReserve(
      RETAILER.publicKey,
    )
    console.log('retailerData', viewData(retailerData))
    console.log('retailerReserve', retailerReserve)
  })

  it('Is initialize order!', async () => {
    const { txId } = await LibraryProgram.initializeOrder({
      retailer: RETAILER.publicKey,
      bidAmount: new anchor.BN(10),
      bidPrice: BID_PRICE.div(new anchor.BN(2)),
      order: ORDER,
    })
  })

  it('ORDER DATA - AFTER INIT!', async () => {
    const orderData = await program.account.order.fetch(ORDER.publicKey)
    const orderReserve = await LibraryProgram.getOrderReserve(ORDER.publicKey)
    console.log('orderData', viewData(orderData))
    console.log('orderReserve', orderReserve)
    expect(!!orderData.state['open']).true
  })

  it('Is approve order!', async () => {
    const txId = await LibraryProgram.approveOrder({ order: ORDER.publicKey })
  })

  it('RETAILER DATA - AFTER APPROVE!', async () => {
    const retailerData = await program.account.retailer.fetch(
      RETAILER.publicKey,
    )
    const retailerReserve = await LibraryProgram.getRetailerReserve(
      RETAILER.publicKey,
    )
    console.log('retailerData', viewData(retailerData))
    console.log('retailerReserve', retailerReserve)
  })

  it('ORDER DATA - AFTER APPROVE!', async () => {
    const orderData = await program.account.order.fetch(ORDER.publicKey)
    const orderReserve = await LibraryProgram.getOrderReserve(ORDER.publicKey)
    console.log('orderData', viewData(orderData))
    console.log('orderReserve', orderReserve)
    expect(!!orderData.state['approved']).true
  })

  it('Is claim order!', async () => {
    const txId = await LibraryProgram.claim({ order: ORDER.publicKey })
  })

  it('RETAILER DATA - AFTER CLAIM!', async () => {
    const retailerData = await program.account.retailer.fetch(
      RETAILER.publicKey,
    )
    const retailerReserve = await LibraryProgram.getRetailerReserve(
      RETAILER.publicKey,
    )
    console.log('retailerData', viewData(retailerData))
    console.log('retailerReserve', retailerReserve)
  })

  it('ORDER DATA - AFTER CLAIM!', async () => {
    const orderData = await program.account.order.fetch(ORDER.publicKey)
    const orderReserve = await LibraryProgram.getOrderReserve(ORDER.publicKey)
    console.log('orderData', viewData(orderData))
    console.log('orderReserve', orderReserve)
    expect(!!orderData.state['done']).true
  })
})
