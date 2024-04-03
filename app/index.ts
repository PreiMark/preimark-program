import {
  web3,
  Program,
  utils,
  BN,
  Address,
  AnchorProvider,
  IdlAccounts,
  Spl,
  workspace,
} from '@project-serum/anchor'

import { ExchangeMarket } from './../target/types/exchange_market'
import { InitializeOrder, InitializeOffer, OrderAction } from './types'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'

const PROGRAM_ACCOUNTS = {
  rent: web3.SYSVAR_RENT_PUBKEY,
  systemProgram: web3.SystemProgram.programId,
  associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
  tokenProgram: utils.token.TOKEN_PROGRAM_ID,
}

export type RetailerData = IdlAccounts<ExchangeMarket>['retailer']
export type OrderData = IdlAccounts<ExchangeMarket>['order']

class ExchangeProgram {
  readonly program: Program<ExchangeMarket>
  constructor(
    readonly provider: AnchorProvider,
    readonly programId: string,
    readonly connection: Connection,
  ) {
    this.program = workspace.ExchangeMarket as Program<ExchangeMarket>
  }

  get connect() {
    return this.connection
  }

  get walletPubkey() {
    return this.provider.wallet.publicKey
  }

  get account() {
    const accProgram = this.program.account
    return {
      retailer: {
        fetch: (address: Address): Promise<RetailerData> =>
          accProgram.retailer.fetch(address),
      },
      order: {
        fetch: (address: Address): Promise<OrderData> =>
          accProgram.order.fetch(address) as any,
      },
    }
  }

  get splProgram() {
    return Spl.token(this.provider)
  }

  deriveTreasurerAddress = async (ownerAddress: Address) => {
    if (typeof ownerAddress !== 'string') ownerAddress = ownerAddress.toBase58()
    const ownerPubkey = new web3.PublicKey(ownerAddress)
    const [treasurer] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('treasurer'), ownerPubkey.toBuffer()],
      this.program.programId,
    )
    return treasurer
  }

  private generateWalletPDAs = async (params: {
    bidMint: Address
    askMint: Address
  }) => {
    const authority = this.walletPubkey
    const bidMintPubkey = new web3.PublicKey(params.bidMint)
    const askMintPubkey = new web3.PublicKey(params.askMint)

    const bidTokenAccount = await utils.token.associatedAddress({
      mint: bidMintPubkey,
      owner: authority,
    })
    const askTokenAccount = await utils.token.associatedAddress({
      mint: askMintPubkey,
      owner: authority,
    })
    return {
      authority,
      bidTokenAccount,
      askTokenAccount,
    }
  }

  private generateRetailerPDAs = async (params: {
    retailer: Address
    bidMint: Address
    askMint: Address
  }) => {
    const retailer = new web3.PublicKey(params.retailer)
    const bidMint = new web3.PublicKey(params.bidMint)
    const askMint = new web3.PublicKey(params.askMint)

    const treasurer = await this.deriveTreasurerAddress(retailer)
    const bidTreasury = await utils.token.associatedAddress({
      mint: bidMint,
      owner: treasurer,
    })
    const askTreasury = await utils.token.associatedAddress({
      mint: askMint,
      owner: treasurer,
    })
    return {
      retailer,
      treasurer,
      bidMint,
      askMint,
      bidTreasury,
      askTreasury,
    }
  }

  private generateAccounts = async (order: Address, retailer?: Address) => {
    if (!retailer) {
      const orderData = await this.account.order.fetch(order)
      retailer = orderData.retailer
    }
    const { askMint, bidMint } = await this.account.retailer.fetch(retailer)
    const retailerPDAs = await this.generateRetailerPDAs({
      askMint,
      bidMint,
      retailer,
    })

    const walletPDAs = await this.generateWalletPDAs({
      askMint,
      bidMint,
    })
    return {
      order: new web3.PublicKey(order),
      ...walletPDAs,
      ...retailerPDAs,
      ...PROGRAM_ACCOUNTS,
    }
  }

  /**
   * @param retailer: Retailer keypair if needed
   * @returns
   */
  initializeOffer = async ({
    bidMint = web3.Keypair.generate(),
    askMint = web3.Keypair.generate(),
    bidTotal,
    bidPoint,
    startAfter = new BN(0),
    endAfter = new BN(0),
    sendAndConfirm = true,
    retailer = web3.Keypair.generate(),
  }: InitializeOffer) => {
    // const {
    //   bidTreasury,
    //   bidMint: _bidMint,
    //   treasurer,
    //   retailer: _retailer,
    // } = await this.generateRetailerPDAs({
    //   retailer: retailer.publicKey,
    //   askMint,
    //   bidMint,
    // })
    const treasurer = await this.deriveTreasurerAddress(retailer.publicKey)
    const bidTreasury = await utils.token.associatedAddress({
      mint: bidMint.publicKey,
      owner: treasurer,
    })
    const { authority, bidTokenAccount } = await this.generateWalletPDAs({
      askMint: askMint.publicKey,
      bidMint: bidMint.publicKey,
    })
    console.log('zo ne')
    console.log('authority', authority)
    console.log('_retailer', retailer)
    console.log('treasurer', treasurer)
    console.log('_bidMint', bidMint)
    console.log('bidTreasury', bidTreasury)
    console.log('bidTokenAccount', bidTokenAccount)
    // Add the initializeOffer method call to the transaction
    const tx = await this.program.methods
      .initializeOffer(bidTotal, bidPoint, startAfter, endAfter)
      .accounts({
        authority: this.walletPubkey,
        retailer: retailer.publicKey,
        treasurer,
        bidMint: bidMint.publicKey,
        bidTreasury,
        bidTokenAccount,
        ...PROGRAM_ACCOUNTS,
      })
      .transaction()

    tx.feePayer = authority
    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash('finalized')
    tx.feePayer = this.walletPubkey
    tx.recentBlockhash = blockhash
    tx.lastValidBlockHeight = lastValidBlockHeight
    tx.partialSign(retailer)
    await this.provider.wallet.signTransaction(tx)
    console.log('pass', tx)
    let txId = ''
    if (sendAndConfirm) {
      txId = await this.connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: true,
        preflightCommitment: 'confirmed',
      })
      await this.connection.confirmTransaction({
        signature: txId,
        blockhash,
        lastValidBlockHeight,
      })

      // this.provider.opts.skipPreflight = true
      // txId = await this.provider.sendAndConfirm(tx, [retailer, bidMint])
    }
    return { txId, tx }
  }

  /**
   * @param retailer: Retailer address
   * @returns
   */
  initializeOrder = async ({
    retailer,
    askPoint,
    askAmount,
    sendAndConfirm = true,
    order = web3.Keypair.generate(),
  }: InitializeOrder) => {
    // Build transaction
    const accounts = await this.generateAccounts(order.publicKey, retailer)

    const tx = await this.program.methods
      .initializeOrder(askPoint, askAmount)
      .accounts(accounts)
      .transaction()
    // Send transaction if needed
    let txId = ''
    if (sendAndConfirm) {
      txId = await this.provider.sendAndConfirm(tx, [order])
    }
    return { txId, tx }
  }

  /**
   * @param order: Order Address
   * @returns
   */
  claim = async ({ order, sendAndConfirm = true }: OrderAction) => {
    // Build transaction
    const accounts = await this.generateAccounts(order)
    const tx = await this.program.methods
      .claim()
      .accounts(accounts)
      .transaction()
    // Send transaction if needed
    let txId = ''
    if (sendAndConfirm) {
      txId = await this.provider.sendAndConfirm(tx, [])
    }
    return { txId, tx }
  }

  /**
   * @param order: Order Address
   * @returns
   */
  collectOrder = async ({ order, sendAndConfirm = true }: OrderAction) => {
    // Build transaction
    const accounts = await this.generateAccounts(order)
    const tx = await this.program.methods
      .collect()
      .accounts(accounts)
      .transaction()
    // Send transaction if needed
    let txId = ''
    if (sendAndConfirm) {
      txId = await this.provider.sendAndConfirm(tx, [])
    }
    return { txId, tx }
  }
}

export default ExchangeProgram
