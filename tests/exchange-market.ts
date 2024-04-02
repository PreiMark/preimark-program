import * as anchor from '@project-serum/anchor'
import { Address, AnchorProvider, Program } from '@project-serum/anchor'
import { ExchangeMarket } from '../target/types/exchange_market'
import ExchangeProgram from '../app'
import { createMintAndMintTo } from '@sen-use/web3'
import { expect } from 'chai'
import { Connection } from '@solana/web3.js'
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet'

describe('exchange-market', () => {
  // Configure the client to use the local cluster.

  const connection = new Connection('http://localhost:8899', 'confirmed')
  const options = AnchorProvider.defaultOptions()
  const wallet = NodeWallet.local()
  const provider = new AnchorProvider(connection, wallet, options)
  anchor.setProvider(provider)
  provider.opts.skipPreflight = true

  const program = anchor.workspace.ExchangeMarket as Program<ExchangeMarket>

  const LibraryProgram = new ExchangeProgram(
    provider,
    program.programId.toBase58(),
    connection,
  )

  const getRetailerReserve = async (retailer: Address): Promise<string[]> => {
    const { bidMint, askMint } = await LibraryProgram.account.retailer.fetch(
      retailer,
    )
    const treasurer = await LibraryProgram.deriveTreasurerAddress(retailer)
    const bidTreasury = await anchor.utils.token.associatedAddress({
      mint: bidMint,
      owner: treasurer,
    })
    const askTreasury = await anchor.utils.token.associatedAddress({
      mint: askMint,
      owner: treasurer,
    })
    const tokenAccounts =
      await LibraryProgram.splProgram.account.token.fetchMultiple([
        bidTreasury,
        askTreasury,
      ])
    return tokenAccounts.map((e: any) => e?.amount?.toString())
  }

  // Context
  const BID_TOTAL = new anchor.BN(0)
  const BID_POINT = new anchor.BN(1000)
  const START_AFTER = new anchor.BN(0)
  const END_AFTER = new anchor.BN(10000)
  // Order
  const ASK_AMOUNT = new anchor.BN(100)
  const BID_AMOUNT = new anchor.BN(100)

  let BID_MINT: anchor.web3.Keypair // SNTR = 2$
  let ASK_MINT: anchor.web3.Keypair // USDC
  let RETAILER = anchor.web3.Keypair.generate()
  let ORDER = anchor.web3.Keypair.generate()

  before('Is generate data!', async () => {
    console.log(1)
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

  it('Is initialized offer!', async () => {
    console.log(2)
    console.log('bid', BID_MINT.publicKey)
    console.log('RETAILER', RETAILER.publicKey)
    console.log('BID_POINT', BID_POINT)
    console.log('END_AFTER', END_AFTER)
    const { tx } = await LibraryProgram.initializeOffer({
      askMint: BID_MINT.publicKey,
      bidMint: BID_MINT.publicKey,
      retailer: RETAILER,
      bidPoint: BID_POINT,
      bidTotal: BID_TOTAL,
      endAfter: END_AFTER,
      startAfter: START_AFTER,
    })

    console.log('txId', tx)
    // Validate retailer data
    const retailerData = await program.account.retailer.fetch(
      RETAILER.publicKey,
    )
    expect(retailerData.bidPoint.eq(BID_POINT)).true
    // Validate retailer reserve
    const retailerReserve = await getRetailerReserve(RETAILER.publicKey)
    expect(retailerReserve[0] === BID_TOTAL.toString()).true
    console.log('retailerReserve', retailerReserve)
  })

  it('Is initialize order!', async () => {
    console.log(3)
    const { txId } = await LibraryProgram.initializeOrder({
      retailer: RETAILER.publicKey,
      askPoint: BID_AMOUNT,
      askAmount: ASK_AMOUNT,
      order: ORDER,
    })

    // Validate retailer data
    const retailerData = await program.account.retailer.fetch(
      RETAILER.publicKey,
    )
    expect(retailerData.askPoint.eq(BID_TOTAL)).true
    // Validate retailer reserve
    const retailerReserve = await getRetailerReserve(RETAILER.publicKey)
    expect(retailerReserve[0] === BID_TOTAL.toString()).true
    expect(retailerReserve[1] === ASK_AMOUNT.toString()).true
    console.log('retailerReserve', retailerReserve)
    // Validate order
    const orderData = await program.account.order.fetch(ORDER.publicKey)
    expect(!!orderData.state['open']).true
  })

  // it('Is approve order!', async () => {
  //   const txId = await LibraryProgram.approveOrder({ order: ORDER.publicKey })

  //   // Validate retailer data
  //   const retailerData = await program.account.retailer.fetch(
  //     RETAILER.publicKey,
  //   )
  //   expect(retailerData.askTotal.eq(BID_TOTAL)).true
  //   // Validate retailer reserve
  //   const retailerReserve = await getRetailerReserve(RETAILER.publicKey)
  //   expect(retailerReserve[0] === BID_AMOUNT.toString()).true
  //   expect(retailerReserve[1] === ASK_AMOUNT.toString()).true
  //   console.log('retailerReserve', retailerReserve)
  //   // Validate order
  //   const orderData = await program.account.order.fetch(ORDER.publicKey)
  //   expect(!!orderData.state['approved']).true
  // })

  it('Is claim order!', async () => {
    const txId = await LibraryProgram.claim({ order: ORDER.publicKey })
    // Validate retailer data
    const retailerData = await program.account.retailer.fetch(
      RETAILER.publicKey,
    )
    expect(retailerData.askAmount.eq(BID_TOTAL)).true
    // Validate retailer reserve
    const retailerReserve = await getRetailerReserve(RETAILER.publicKey)
    expect(retailerReserve[0] === '0').true
    expect(retailerReserve[1] === ASK_AMOUNT.toString()).true
    console.log('retailerReserve', retailerReserve)
    // Validate order
    const orderData = await program.account.order.fetch(ORDER.publicKey)
    expect(!!orderData.state['done']).true
  })
})
