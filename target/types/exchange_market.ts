export type ExchangeMarket = {
  "version": "0.1.0",
  "name": "exchange_market",
  "instructions": [
    {
      "name": "initializeRetailer",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "retailer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bidMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "askMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bidTotal",
          "type": "u64"
        },
        {
          "name": "bidPrice",
          "type": "u64"
        },
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "metadata",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "initializeOrder",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "retailer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "order",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "askMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "askTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "askTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bidAmount",
          "type": "u64"
        },
        {
          "name": "bidPrice",
          "type": "u64"
        },
        {
          "name": "metadata",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "approveOrder",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "retailer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "retailer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "retailer",
            "type": "publicKey"
          },
          {
            "name": "bidPrice",
            "type": "u64"
          },
          {
            "name": "bidAmount",
            "type": "u64"
          },
          {
            "name": "lockTime",
            "type": "i64"
          },
          {
            "name": "state",
            "type": {
              "defined": "OrderState"
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "retailer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bidMint",
            "type": "publicKey"
          },
          {
            "name": "askMint",
            "type": "publicKey"
          },
          {
            "name": "bidTotal",
            "type": "u64"
          },
          {
            "name": "bidPrice",
            "type": "u64"
          },
          {
            "name": "bidReserve",
            "type": "u64"
          },
          {
            "name": "askReceived",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OrderState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Uninitialized"
          },
          {
            "name": "Open"
          },
          {
            "name": "Approved"
          },
          {
            "name": "Done"
          },
          {
            "name": "Rejected"
          },
          {
            "name": "Canceled"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Overflow",
      "msg": "Operation overflowed"
    },
    {
      "code": 6001,
      "name": "InvalidPermission",
      "msg": "Not have permission!"
    },
    {
      "code": 6002,
      "name": "AccountTreasury",
      "msg": "Invalid treasury address!"
    },
    {
      "code": 6003,
      "name": "AccountMint",
      "msg": "Invalid mint address!"
    },
    {
      "code": 6004,
      "name": "InvalidCurrentDate",
      "msg": "Cannot get current date"
    },
    {
      "code": 6005,
      "name": "NotApproved",
      "msg": "Order isn't not approved yet!"
    },
    {
      "code": 6006,
      "name": "InvalidOrderState",
      "msg": "Invalid Order state!"
    },
    {
      "code": 6007,
      "name": "NotUnlocked",
      "msg": "Order isn't not unlocked yet!"
    },
    {
      "code": 6008,
      "name": "NotActive",
      "msg": "State is not active!"
    }
  ]
};

export const IDL: ExchangeMarket = {
  "version": "0.1.0",
  "name": "exchange_market",
  "instructions": [
    {
      "name": "initializeRetailer",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "retailer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bidMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "askMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bidTotal",
          "type": "u64"
        },
        {
          "name": "bidPrice",
          "type": "u64"
        },
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "metadata",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "initializeOrder",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "retailer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "order",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "askMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "askTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "askTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bidAmount",
          "type": "u64"
        },
        {
          "name": "bidPrice",
          "type": "u64"
        },
        {
          "name": "metadata",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "approveOrder",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "retailer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "retailer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasurer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bidTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "retailer",
            "type": "publicKey"
          },
          {
            "name": "bidPrice",
            "type": "u64"
          },
          {
            "name": "bidAmount",
            "type": "u64"
          },
          {
            "name": "lockTime",
            "type": "i64"
          },
          {
            "name": "state",
            "type": {
              "defined": "OrderState"
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "retailer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bidMint",
            "type": "publicKey"
          },
          {
            "name": "askMint",
            "type": "publicKey"
          },
          {
            "name": "bidTotal",
            "type": "u64"
          },
          {
            "name": "bidPrice",
            "type": "u64"
          },
          {
            "name": "bidReserve",
            "type": "u64"
          },
          {
            "name": "askReceived",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OrderState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Uninitialized"
          },
          {
            "name": "Open"
          },
          {
            "name": "Approved"
          },
          {
            "name": "Done"
          },
          {
            "name": "Rejected"
          },
          {
            "name": "Canceled"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Overflow",
      "msg": "Operation overflowed"
    },
    {
      "code": 6001,
      "name": "InvalidPermission",
      "msg": "Not have permission!"
    },
    {
      "code": 6002,
      "name": "AccountTreasury",
      "msg": "Invalid treasury address!"
    },
    {
      "code": 6003,
      "name": "AccountMint",
      "msg": "Invalid mint address!"
    },
    {
      "code": 6004,
      "name": "InvalidCurrentDate",
      "msg": "Cannot get current date"
    },
    {
      "code": 6005,
      "name": "NotApproved",
      "msg": "Order isn't not approved yet!"
    },
    {
      "code": 6006,
      "name": "InvalidOrderState",
      "msg": "Invalid Order state!"
    },
    {
      "code": 6007,
      "name": "NotUnlocked",
      "msg": "Order isn't not unlocked yet!"
    },
    {
      "code": 6008,
      "name": "NotActive",
      "msg": "State is not active!"
    }
  ]
};
