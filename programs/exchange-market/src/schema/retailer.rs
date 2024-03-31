use crate::constants::*;
use crate::errors::ErrorCode;
use crate::schema::*;
use crate::utils::*;
use anchor_lang::prelude::*;
use anchor_spl::token;
use num_traits::*;

#[account]
#[derive(Copy)]
pub struct Retailer {
    pub authority: Pubkey,
    pub bid_mint: Pubkey,
    pub ask_mint: Pubkey,
    pub bid_total: u64,
    pub bid_price: u64,
    pub bid_reserve: u64,
    pub ask_received: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub metadata: [u8; 32],
}

impl Retailer {
    pub const LEN: usize =
        DISCRIMINATOR_SIZE + PUBKEY_SIZE * 3 + U64_SIZE * 4 + I64_SIZE * 2 + METADATA_SIZE;

    pub fn check_active<'a, 'b, 'c, 'info>(self) -> Result<()> {
        let current_time = current_timestamp().unwrap();
        msg!("current_time {}", current_time);
        msg!("start_time {}", self.start_time);
        msg!("end_time {}", self.end_time);
        if !(current_time >= self.start_time) {
            return err!(ErrorCode::NotActive);
        }
        if self.end_time > 0 && !(current_time < self.end_time) {
            return err!(ErrorCode::NotActive);
        }
        return Ok(());
    }

    pub fn deposit<'a, 'b, 'c, 'info>(
        &mut self,
        bid_amount: u64,
        program: AccountInfo<'info>,
        context: token::Transfer<'info>,
    ) -> Result<()> {
        // Transfer
        let transfer_ctx = CpiContext::new(program, context);
        token::transfer(transfer_ctx, bid_amount)?;
        // Update Retailer Info
        self.bid_total += bid_amount;
        self.bid_reserve += bid_amount;
        Ok(())
    }

    pub fn debit<'a, 'b, 'c, 'info>(
        &mut self,
        order: &mut Account<'info, Order>,
        program: AccountInfo<'info>,
        context: token::Transfer<'info>,
    ) -> Result<()> {
        // Deposit
        if !(self.bid_reserve > order.bid_amount) {
            let deposit_amount = order.bid_amount - self.bid_reserve;
            self.deposit(deposit_amount, program, context)?;
        }
        self.bid_reserve -= order.bid_amount;
        order.state = OrderState::Approved;
        Ok(())
    }

    pub fn pay<'a, 'b, 'c, 'info>(
        &mut self,
        order: &mut Account<'info, Order>,
        program: AccountInfo<'info>,
        context: token::Transfer<'info>,
        signer_seeds: &'a [&'b [&'c [u8]]],
    ) -> Result<()> {
        // Transfer
        let transfer_ctx = CpiContext::new_with_signer(program, context, signer_seeds);
        token::transfer(transfer_ctx, order.bid_amount)?;
        // Update Retailer Info
        order.state = OrderState::Done;
        Ok(())
    }
}
