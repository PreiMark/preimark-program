use crate::errors::ErrorCode;
use crate::schema::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};

#[derive(Accounts)]
pub struct InitializeOrder<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub retailer: Account<'info, Retailer>,
    #[account(seeds = [b"treasurer", &retailer.key().to_bytes()], bump)]
    /// CHECK: Just a pure account
    pub treasurer: AccountInfo<'info>,
    #[account(init, payer = authority, space = Order::LEN)]
    pub order: Account<'info, Order>,

    // Token muon order
    #[account(mut)]
    pub ask_mint: Box<Account<'info, token::Mint>>,
    #[account(
    init_if_needed,
    payer = authority,
    associated_token::mint = ask_mint,
    associated_token::authority = treasurer
  )]
    pub ask_treasury: Box<Account<'info, token::TokenAccount>>,
    #[account(
    mut,
    associated_token::mint = ask_mint,
    associated_token::authority = authority
  )]
    pub ask_token_account: Box<Account<'info, token::TokenAccount>>,

    // Programs
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(ctx: Context<InitializeOrder>, ask_point: u64, ask_amount: u64) -> Result<()> {
    let retailer = ctx.accounts.retailer.clone();
    let order = &mut ctx.accounts.order;
    // Initialize order's info
    order.authority = ctx.accounts.authority.key();
    order.retailer = retailer.key();
    order.ask_point = 0;
    order.ask_amount = 0;
    order.state = OrderState::Open;

    // Collect Deposit
    order.deposit(
        ask_amount,
        ask_point,
        ctx.accounts.token_program.to_account_info(),
        token::Transfer {
            from: ctx.accounts.ask_token_account.to_account_info(),
            to: ctx.accounts.ask_treasury.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    )?;

    // Automatically approve if both parties are satisfied
    let approved = order.auto_approve(retailer);
    if approved.ok_or(ErrorCode::Overflow)? {
        return Ok(());
    }
    Ok(())
}
