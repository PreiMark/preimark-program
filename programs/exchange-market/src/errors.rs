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
  // Claim
  #[msg("Order isn't not approved yet!")]
  NotApproved,
  #[msg("Invalid Order state!")]
  InvalidOrderState,
  #[msg("Order isn't not unlocked yet!")]
  NotUnlocked,
  #[msg("State is not active!")]
  NotActive,
}
