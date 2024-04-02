use crate::errors::ErrorCode;
use crate::schema::*;
use crate::utils::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};

#[derive(Accounts)]
pub struct InitializeOffer<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority, space = Retailer::LEN)]
    pub retailer: Account<'info, Retailer>,
    #[account(seeds = [b"treasurer", &retailer.key().to_bytes()], bump)]
    /// CHECK: Just a pure account
    pub treasurer: AccountInfo<'info>,

    // Bid info
    #[account(mut)]
    pub bid_mint: Account<'info, token::Mint>,
    #[account(
    init_if_needed,
    payer = authority,
    associated_token::mint = bid_mint,
    associated_token::authority = treasurer
  )]
    pub bid_treasury: Box<Account<'info, token::TokenAccount>>,
    #[account(
    init_if_needed,
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
    ctx: Context<InitializeOffer>,
    bid_total: u64,
    bid_point: u64,
    start_after: i64,
    end_after: i64,
) -> Result<()> {
    let current_time = current_timestamp().ok_or(ErrorCode::InvalidCurrentDate)?;
    let retailer = &mut ctx.accounts.retailer;
    retailer.authority = ctx.accounts.authority.key();
    retailer.bid_mint = ctx.accounts.bid_mint.key();

    // Initialize retailer's info
    retailer.bid_total += 0;
    retailer.bid_point += 0;

    retailer.start_time = current_time + start_after;
    retailer.end_time = current_time + end_after;
    // Never End
    if end_after == 0 {
        retailer.end_time = 0;
    }

    // retailer.deposit(
    //     bid_total,
    //     bid_point,
    //     ctx.accounts.token_program.to_account_info(),
    //     token::Transfer {
    //         from: ctx.accounts.bid_token_account.to_account_info(),
    //         to: ctx.accounts.bid_treasury.to_account_info(),
    //         authority: ctx.accounts.authority.to_account_info(),
    //     },
    // )?;

    Ok(())
}
