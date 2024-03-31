use crate::constants::*;
use crate::errors::ErrorCode;
use crate::schema::*;
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
pub struct Order {
    pub authority: Pubkey,
    pub retailer: Pubkey,
    pub bid_price: u64,
    pub bid_amount: u64,
    pub lock_time: i64,
    pub state: OrderState,
    pub metadata: [u8; 32],
}

impl Order {
    pub const LEN: usize =
        DISCRIMINATOR_SIZE + PUBKEY_SIZE * 2 + U64_SIZE * 2 + I64_SIZE + U8_SIZE + METADATA_SIZE;

    pub fn auto_approve<'a, 'b, 'c, 'info>(
        &mut self,
        retailer: Account<'info, Retailer>,
    ) -> Option<bool> {
        if retailer.bid_price != self.bid_price {
            return Some(false);
        }
        if retailer.bid_reserve < self.bid_amount {
            return Some(false);
        }
        self.state = OrderState::Approved;
        return Some(true);
    }

    pub fn deposit<'a, 'b, 'c, 'info>(
        &mut self,
        program: AccountInfo<'info>,
        context: token::Transfer<'info>,
    ) -> Result<()> {
        // Transfer
        let paid_amount = self.calc_paid_amount().ok_or(ErrorCode::Overflow)?;
        let transfer_ctx = CpiContext::new(program, context);
        token::transfer(transfer_ctx, paid_amount)?;
        // Update order info
        Ok(())
    }

    pub fn calc_paid_amount<'a, 'b, 'c, 'info>(self) -> Option<u64> {
        let price = self.bid_price;
        let bid_amount = self.bid_amount;
        if !(price > 0) {
            return Some(0);
        }
        let bid_amount_128 = bid_amount.to_u128()?;
        let price_128 = price.to_u128()?;

        let paid_amount = bid_amount_128
            .checked_mul(price_128)?
            .checked_div(PRECISION)?;

        return Some(paid_amount.to_u64()?);
    }
}
