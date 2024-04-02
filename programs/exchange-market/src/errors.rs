use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Operation overflowed")]
    Overflow,
    #[msg("Not have permission!")]
    InvalidPermission,
    #[msg("Invalid treasury address!")]
    AccountTreasury,
    #[msg("Invalid mint address!")]
    AccountMint,
    #[msg("Cannot get current date")]
    InvalidCurrentDate,
    #[msg("State is not active!")]
    NotActive,
    #[msg("insufficient funds")]
    InsufficientFunds,
}
