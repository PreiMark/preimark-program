use crate::constants::*;
use crate::schema::*;
use anchor_lang::prelude::*;
use anchor_spl::token;

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
pub struct Order {
    pub authority: Pubkey,
    pub retailer: Pubkey,
    pub ask_point: u64,
    pub ask_amount: u64,
    pub state: OrderState,
}

impl Order {
    pub const LEN: usize =
        DISCRIMINATOR_SIZE + PUBKEY_SIZE * 2 + U64_SIZE * 2 + I64_SIZE + U8_SIZE + METADATA_SIZE;

    pub fn auto_approve<'a, 'b, 'c, 'info>(
        &mut self,
        retailer: Account<'info, Retailer>,
    ) -> Option<bool> {
        if retailer.bid_total != self.ask_amount {
            return Some(false);
        }
        if retailer.bid_point != self.ask_point {
            return Some(false);
        }
        self.state = OrderState::Approved;
        return Some(true);
    }

    pub fn deposit<'a, 'b, 'c, 'info>(
        &mut self,
        ask_amount: u64,
        ask_point: u64,
        program: AccountInfo<'info>,
        context: token::Transfer<'info>,
    ) -> Result<()> {
        // Transfer
        let transfer_ctx = CpiContext::new(program, context);
        token::transfer(transfer_ctx, ask_amount)?;
        // Update order info
        self.ask_amount += ask_amount;
        self.ask_point += ask_point;
        Ok(())
    }
}
