# Premark Program

The project is in exchange for accumulated points from useful organizations use Wormhole

## Specs & Features

The premark program provides the following instructions:

* Create offer buy/sell 
* Create order 
* Claim for buyer/seller

Each owner public key has its own weight (0~1000). Any authorized instruction requires the total signature weight to be at least 1000.

## Quick Start

The following dependencies are required to build and run this example,
depending on your OS, they may already be installed:

- Install node
- Install npm
- Install the latest Rust stable from https://rustup.rs/
- Install Solana v1.17.15 or later from https://docs.solana.com/cli/install-solana-cli-tools
- Install anchor-cli 0.29.0 

### Start local Solana cluster

This example connects to a local Solana cluster by default.

Enable on-chain program logs:
```bash
$ export RUST_LOG=solana_runtime::system_instruction_processor=trace,solana_runtime::message_processor=debug,solana_bpf_loader=debug,solana_rbpf=debug
```
Start a local Solana cluster:
```bash
$ solana-test-validator  
```

## Pointing to a public Solana cluster

Solana maintains three public clusters:
- `devnet` - Development cluster with airdrops enabled
- `testnet` - Tour De Sol test cluster without airdrops enabled
- `mainnet-beta` -  Main cluster
  
Use scripts to configure which cluster.

To point to `localhost` when run cluster local:
```bash
$ anchor build && anchor test --skip-local-validator
```

To point to `devnet`:
```bash
$ anchor build && anchor test --provider.cluster devnet
```

To deploy to `local`:
```bash
$ anchor deploy
```

To deploy to `devnet`:
```bash
$ anchor deploy --provider.cluster devnet
```

## Information about Solana

For more information about programming on Solana, visit [Solana Docs](https://docs.solana.com/developing/programming-model/overview)
