import {
  web3,
  Program,
  utils,
  BN,
  Address,
  AnchorProvider,
  IdlAccounts,
  Spl,
} from '@project-serum/anchor'

import { IDL, ExchangeMarket } from './../target/types/exchange_market'

const PROGRAM_ACCOUNTS = {
  rent: web3.SYSVAR_RENT_PUBKEY,
  systemProgram: web3.SystemProgram.programId,
  associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
  tokenProgram: utils.token.TOKEN_PROGRAM_ID,
}

export type RetailerData = IdlAccounts<ExchangeMarket>['retailer']
export type OrderData = IdlAccounts<ExchangeMarket>['order']

const METADATA_SIZE = 32

class ExchangeProgram {
  readonly program: Program<ExchangeMarket>
  constructor(readonly provider: AnchorProvider, readonly programId: string) {
    this.program = new Program<ExchangeMarket>(
      IDL,
      this.programId,
      this.provider,
    )
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

  validMetadata = (metadata?: Buffer | Uint8Array | number[]) => {
    if (!metadata) {
      const defaultMetadata = []
      for (let i = 0; i < METADATA_SIZE; i++) defaultMetadata.push(0)
      return defaultMetadata
    }
    if (metadata.length !== METADATA_SIZE)
      throw new Error('Invalid metadata path')
    return Array.from(metadata)
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

  generateWalletPDAs = async (params: {
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

  generateRetailerPDAs = async (params: {
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
    return {
      retailer,
      treasurer,
      bidMint,
      askMint,
      bidTreasury,
    }
  }

  generateOrderPDAs = async (params: {
    order: Address
    bidMint: Address
    askMint: Address
  }) => {
    const order = new web3.PublicKey(params.order)
    const bidMint = new web3.PublicKey(params.bidMint)
    const askMint = new web3.PublicKey(params.askMint)

    // Retailer Accounts
    const treasurer = await this.deriveTreasurerAddress(order)
    const askTreasury = await utils.token.associatedAddress({
      mint: askMint,
      owner: treasurer,
    })
    return {
      order,
      treasurer,
      bidMint,
      askMint,
      askTreasury,
    }
  }

  generateAccountsWithOrder = async (order: Address) => {
    const { retailer } = await this.account.order.fetch(order)
    const { askMint, bidMint } = await this.account.retailer.fetch(retailer)
    const retailerPDAs = await this.generateRetailerPDAs({
      askMint,
      bidMint,
      retailer,
    })
    const orderPDAs = await this.generateOrderPDAs({
      askMint,
      bidMint,
      order: order,
    })
    const walletPDAs = await this.generateWalletPDAs({
      askMint,
      bidMint,
    })
    return {
      ...orderPDAs,
      ...walletPDAs,
      ...retailerPDAs,
      ...PROGRAM_ACCOUNTS,
    }
  }

  getRetailerReserve = async (retailer: Address) => {
    const { bidMint, askMint } = await this.account.retailer.fetch(retailer)
    const treasurer = await this.deriveTreasurerAddress(retailer)
    const bidTreasury = await utils.token.associatedAddress({
      mint: bidMint,
      owner: treasurer,
    })
    const askTreasury = await utils.token.associatedAddress({
      mint: askMint,
      owner: treasurer,
    })
    const tokenAccounts = await this.splProgram.account.token.fetchMultiple([
      bidTreasury,
      askTreasury,
    ])
    return tokenAccounts.map((e: any) => e?.amount?.toString())
  }

  getOrderReserve = async (order: Address) => {
    const { retailer } = await this.account.order.fetch(order)
    const { bidMint, askMint } = await this.account.retailer.fetch(retailer)
    const treasurer = await this.deriveTreasurerAddress(order)
    const bidTreasury = await utils.token.associatedAddress({
      mint: bidMint,
      owner: treasurer,
    })
    const askTreasury = await utils.token.associatedAddress({
      mint: askMint,
      owner: treasurer,
    })
    const tokenAccounts = await this.splProgram.account.token.fetchMultiple([
      bidTreasury,
      askTreasury,
    ])
    return tokenAccounts.map((e: any) => e?.amount?.toString())
  }

  parseRetailerData = (data: Buffer): RetailerData => {
    return this.program.coder.accounts.decode('retailer', data)
  }

  initializeRetailer = async ({
    bidMint,
    askMint,
    bidTotal,
    bidPrice,
    startAfter = new BN(0),
    endAfter = new BN(0),
    sendAndConfirm = true,
    metadata,
    retailer = web3.Keypair.generate(),
  }: {
    bidMint: Address
    askMint: Address
    bidTotal: BN
    bidPrice: BN
    startAfter?: BN
    endAfter?: BN
    metadata?: Buffer | Uint8Array | number[]
    sendAndConfirm?: boolean
    retailer?: web3.Keypair
  }) => {
    const retailerPDAs = await this.generateRetailerPDAs({
      retailer: retailer.publicKey,
      askMint,
      bidMint,
    })
    const walletPDAs = await this.generateWalletPDAs({
      askMint,
      bidMint,
    })
    const tx = await this.program.methods
      .initializeRetailer(
        bidTotal,
        bidPrice,
        startAfter,
        endAfter,
        this.validMetadata(metadata),
      )
      .accounts({
        ...retailerPDAs,
        ...walletPDAs,
        ...PROGRAM_ACCOUNTS,
      })
      .transaction()

    let txId = ''
    if (sendAndConfirm) {
      txId = await this.provider.sendAndConfirm(tx, [retailer])
    }
    return { txId, tx }
  }

  initializeOrder = async ({
    retailer,
    bidAmount,
    bidPrice,
    metadata,
    sendAndConfirm = true,
    order = web3.Keypair.generate(),
  }: {
    retailer: web3.PublicKey
    bidAmount: BN
    bidPrice: BN
    metadata?: Buffer | Uint8Array | number[]
    sendAndConfirm?: boolean
    order?: web3.Keypair
  }) => {
    const { askMint, bidMint } = await this.account.retailer.fetch(retailer)
    const orderPDAs = await this.generateOrderPDAs({
      askMint,
      bidMint,
      order: order.publicKey,
    })
    const walletPDAs = await this.generateWalletPDAs({
      askMint,
      bidMint,
    })
    const tx = await this.program.methods
      .initializeOrder(bidAmount, bidPrice, this.validMetadata(metadata))
      .accounts({
        retailer,
        ...orderPDAs,
        ...walletPDAs,
        ...PROGRAM_ACCOUNTS,
      })
      .transaction()

    let txId = ''
    if (sendAndConfirm) {
      txId = await this.provider.sendAndConfirm(tx, [order])
    }
    return { txId, tx }
  }

  approveOrder = async ({
    order,
    sendAndConfirm = true,
  }: {
    order: web3.PublicKey
    sendAndConfirm?: boolean
  }) => {
    const accounts = await this.generateAccountsWithOrder(order)
    const tx = await this.program.methods
      .approveOrder()
      .accounts(accounts)
      .transaction()

    let txId = ''
    if (sendAndConfirm) {
      txId = await this.provider.sendAndConfirm(tx, [])
    }
    return { txId, tx }
  }

  claim = async ({
    order,
    sendAndConfirm = true,
  }: {
    order: web3.PublicKey
    sendAndConfirm?: boolean
  }) => {
    const accounts = await this.generateAccountsWithOrder(order)
    const tx = await this.program.methods
      .claim()
      .accounts(accounts)
      .transaction()

    let txId = ''
    if (sendAndConfirm) {
      txId = await this.provider.sendAndConfirm(tx, [])
    }
    return { txId, tx }
  }
}

export default ExchangeProgram
