use anchor_lang::prelude::*;

declare_id!("FUX1aekLunpnej1mCiWv5DeJMwGt7upLB4C9uCCjcVZD");

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod schema;
pub mod utils;

pub use constants::*;
pub use errors::*;
pub use instructions::*;
pub use schema::*;
pub use utils::*;

#[program]
pub mod exchange_market {
    use super::*;

    pub fn initialize_retailer(
        ctx: Context<InitializeRetailer>,
        bid_total: u64,
        bid_price: u64,
        start_time: i64,
        end_time: i64,
        metadata: [u8; 32],
    ) -> Result<()> {
        initialize_retailer::exec(ctx, bid_total, bid_price, start_time, end_time, metadata)
    }

    pub fn initialize_order(
        ctx: Context<InitializeOrder>,
        bid_amount: u64,
        bid_price: u64,
        metadata: [u8; 32],
    ) -> Result<()> {
        initialize_order::exec(ctx, bid_amount, bid_price, metadata)
    }

    pub fn approve_order(ctx: Context<ApproveOrder>) -> Result<()> {
        approve_order::exec(ctx)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        claim::exec(ctx)
    }
}
