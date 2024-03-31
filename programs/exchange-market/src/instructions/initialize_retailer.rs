use crate::errors::ErrorCode;
use crate::schema::*;
use crate::utils::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};

#[derive(Accounts)]
pub struct InitializeRetailer<'info> {
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

    // Ask info
    pub ask_mint: Account<'info, token::Mint>,

    // Programs
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(
    ctx: Context<InitializeRetailer>,
    bid_total: u64,
    bid_price: u64,
    start_after: i64,
    end_after: i64,
    metadata: [u8; 32],
) -> Result<()> {
    let current_time = current_timestamp().ok_or(ErrorCode::InvalidCurrentDate)?;
    let retailer = &mut ctx.accounts.retailer;
    retailer.authority = ctx.accounts.authority.key();
    retailer.bid_mint = ctx.accounts.bid_mint.key();
    retailer.ask_mint = ctx.accounts.ask_mint.key();

    // Initialize retailer's info
    retailer.bid_total = 0;
    retailer.bid_reserve = 0;
    retailer.bid_price = bid_price;

    retailer.ask_received = 0;

    retailer.start_time = current_time + start_after;
    retailer.end_time = current_time + end_after;
    retailer.metadata = metadata;

    if end_after == 0 {
        retailer.end_time = 0;
    }

    if bid_total > 0 {
        retailer.deposit(
            bid_total,
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.bid_token_account.to_account_info(),
                to: ctx.accounts.bid_treasury.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        )?;
    }

    Ok(())
}
