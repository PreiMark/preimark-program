use crate::errors::ErrorCode;
use crate::schema::*;
use crate::utils::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};

#[derive(Accounts)]
pub struct Claim<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(mut)]
  pub retailer: Account<'info, Retailer>,
  #[account(seeds = [b"treasurer", &retailer.key().to_bytes()], bump)]
  /// CHECK: Just a pure account
  pub treasurer: AccountInfo<'info>,
  #[account(mut, has_one = authority, has_one = retailer )]
  pub order: Account<'info, Order>,

  // Bid info
  #[account(mut)]
  pub bid_mint: Box<Account<'info, token::Mint>>,
  #[account(
    mut,
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

  // Programs
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, token::Token>,
  pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn exec(ctx: Context<Claim>) -> Result<()> {
  let retailer = &mut ctx.accounts.retailer;
  let order = &mut ctx.accounts.order;
  let current_time = current_timestamp().ok_or(ErrorCode::InvalidCurrentDate)?;
  // Validate
  if order.state != OrderState::Approved {
    return err!(ErrorCode::NotApproved);
  }
  if !(current_time > order.lock_time) {
    return err!(ErrorCode::NotUnlocked);
  }
  // Claim
  let seeds: &[&[&[u8]]] = &[&[
    "treasurer".as_ref(),
    &retailer.key().to_bytes(),
    &[*ctx.bumps.get("treasurer").unwrap()],
  ]];

  retailer.pay(
    order,
    ctx.accounts.token_program.to_account_info(),
    token::Transfer {
      from: ctx.accounts.bid_treasury.to_account_info(),
      to: ctx.accounts.bid_token_account.to_account_info(),
      authority: ctx.accounts.treasurer.to_account_info(),
    },
    seeds,
  )?;
  Ok(())
}
