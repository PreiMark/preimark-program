use crate::constants::*;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use anchor_spl::token;
use num_traits::*;

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum OrderState {
    Uninitialized,
    Open,
    Approved,
    Done,
    Rejected,
    Canceled,
}

impl Default for OrderState {
    fn default() -> Self {
        OrderState::Uninitialized
    }
}

#[account]
#[derive(Copy)]
pub struct BuyOrder {
    pub authority: Pubkey,
    pub ask_mint: Pubkey,
    pub ask_reserve: u64,
    pub ask_total: u64,
    pub point_received: u64,
    pub point_total: u64,
    pub start_time: i64,
    pub end_time: i64,
}

impl BuyOrder {
    pub const LEN: usize = DISCRIMINATOR_SIZE
        + PUBKEY_SIZE * 2
        + U64_SIZE * 4
        + I64_SIZE * 4
        + U8_SIZE
        + METADATA_SIZE;

    pub fn deposit<'a, 'b, 'c, 'info>(
        &mut self,
        ask_reserve: u64,
        program: AccountInfo<'info>,
        context: token::Transfer<'info>,
    ) -> Result<()> {
        // Transfer
        let transfer_ctx = CpiContext::new(program, context);
        token::transfer(transfer_ctx, ask_reserve)?;
        // Update order info
        Ok(())
    }
}
