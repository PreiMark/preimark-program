use anchor_lang::prelude::*;

declare_id!("CUGAajqCMMGahDnsBKDkcUcejNKB8Jq2tebyje42mtmg");

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod schema;
pub mod utils;

pub use constants::*;
pub use instructions::*;
pub use schema::*;
pub use utils::*;

#[program]
pub mod exchange_market {
    use super::*;

    pub fn initialize_offer(
        ctx: Context<InitializeOffer>,
        bid_total: u64,
        bid_point: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        initialize_offer::exec(ctx, bid_total, bid_point, start_time, end_time)
    }

    pub fn initialize_order(
        ctx: Context<InitializeOrder>,
        ask_point: u64,
        ask_amount: u64,
    ) -> Result<()> {
        initialize_order::exec(ctx, ask_point, ask_amount)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        seller_claim::exec(ctx)
    }

    pub fn collect(ctx: Context<Collect>) -> Result<()> {
        buyer_collect::exec(ctx)
    }
}
