use crate::errors::ErrorCode;
use crate::schema::*;
use crate::utils::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};

#[derive(Accounts)]
pub struct InitializeBuyOrder<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority, space = BuyOrder::LEN)]
    pub buy_order: Account<'info, BuyOrder>,
    #[account(seeds = [b"treasurer", &buy_order.key().to_bytes()], bump)]
    /// CHECK: Just a pure account
    pub treasurer: AccountInfo<'info>,

    // Bid info
    #[account(mut)]
    pub ask_mint: Account<'info, token::Mint>,
    #[account(
    init,
    payer = authority,
    associated_token::mint = ask_mint,
    associated_token::authority = treasurer
  )]
    pub bid_treasury: Box<Account<'info, token::TokenAccount>>,
    #[account(
    init,
    payer = authority,
    associated_token::mint = ask_mint,
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
    ctx: Context<InitializeBuyOrder>,
    ask_total: u64,
    start_after: i64,
    end_after: i64,
) -> Result<()> {
    let current_time = current_timestamp().ok_or(ErrorCode::InvalidCurrentDate)?;
    let buyer = &mut ctx.accounts.buy_order;
    buyer.authority = ctx.accounts.authority.key();
    buyer.ask_mint = ctx.accounts.ask_mint.key();
    buyer.ask_total = ask_total;

    buyer.start_time = current_time + start_after;
    buyer.end_time = current_time + end_after;

    if end_after == 0 {
        buyer.end_time = 0;
    }

    buyer.deposit(
        ask_total,
        ctx.accounts.token_program.to_account_info(),
        token::Transfer {
            from: ctx.accounts.bid_token_account.to_account_info(),
            to: ctx.accounts.bid_treasury.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    )?;

    Ok(())
}
