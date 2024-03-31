use anchor_lang::prelude::*;

declare_id!("FUX1aekLunpnej1mCiWv5DeJMwGt7upLB4C9uCCjcVZD");

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

    pub fn initialize_retailer(
        ctx: Context<InitializeSellOrder>,
        bid_received: u64,
        bid_total: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        initialize_sell_order::exec(ctx, bid_total, bid_received, start_time, end_time)
    }

    pub fn initialize_order(
        ctx: Context<InitializeBuyOrder>,
        ask_total: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        initialize_buy_order::exec(ctx, ask_total, start_time, end_time)
    }

    // pub fn approve_order(ctx: Context<ApproveOrder>) -> Result<()> {
    //     approve_order::exec(ctx)
    // }

    // pub fn claim(ctx: Context<Claim>) -> Result<()> {
    //     claim::exec(ctx)
    // }
}
