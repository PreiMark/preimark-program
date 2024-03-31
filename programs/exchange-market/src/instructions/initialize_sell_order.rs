use crate::errors::ErrorCode;
use crate::schema::*;
use crate::utils::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};

#[derive(Accounts)]
pub struct InitializeSellOrder<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority, space = SellOrder::LEN)]
    pub sell_order: Account<'info, SellOrder>,
    #[account(seeds = [b"treasurer", &sell_order.key().to_bytes()], bump)]
    /// CHECK: Just a pure account
    pub treasurer: AccountInfo<'info>,

    // Bid info
    #[account(mut)]
    pub bid_mint: Account<'info, token::Mint>,
    #[account(
    init,
    payer = authority,
    associated_token::mint = bid_mint,
    associated_token::authority = treasurer
  )]
    pub bid_treasury: Box<Account<'info, token::TokenAccount>>,
    #[account(
    init,
    payer = authority,
    associated_token::mint = bid_mint,
    associated_token::authority = authority
  )]
    pub bid_token_account: Box<Account<'info, token::TokenAccount>>,

    // Programs
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(
    ctx: Context<InitializeSellOrder>,
    bid_total: u64,
    bid_received: u64,
    start_after: i64,
    end_after: i64,
) -> Result<()> {
    let current_time = current_timestamp().ok_or(ErrorCode::InvalidCurrentDate)?;
    let seller = &mut ctx.accounts.sell_order;
    seller.authority = ctx.accounts.authority.key();
    // seller.bid_mint = ctx.accounts.bid_mint.key();
    seller.bid_mint = ctx.accounts.bid_mint.key();

    // Initialize seller's info
    // seller.bid_total = 0;
    // seller.bid_reserve = 0;
    // seller.bid_price = bid_price;

    seller.bid_received = 0;
    seller.bid_total = bid_total;

    seller.start_time = current_time + start_after;
    seller.end_time = current_time + end_after;

    if end_after == 0 {
        seller.end_time = 0;
    }

    seller.deposit(
        bid_received,
        ctx.accounts.token_program.to_account_info(),
        token::Transfer {
            from: ctx.accounts.bid_token_account.to_account_info(),
            to: ctx.accounts.bid_treasury.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    )?;

    Ok(())
}
