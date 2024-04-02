import { web3, BN, Address } from '@project-serum/anchor'

export type InitializeOffer = {
  bidMint: Address
  askMint: Address
  bidTotal: BN
  bidPoint: BN
  startAfter?: BN
  endAfter?: BN
  metadata?: Buffer | Uint8Array | number[]
  sendAndConfirm?: boolean
  retailer?: web3.Keypair
}

export type InitializeOrder = {
  retailer: web3.PublicKey
  askPoint: BN
  askAmount: BN
  sendAndConfirm?: boolean
  order?: web3.Keypair
}

export type OrderAction = {
  order: Address
  sendAndConfirm?: boolean
}
