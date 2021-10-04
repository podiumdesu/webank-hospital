#![cfg_attr(not(feature = "std"), no_std)]

use liquid::storage;
use liquid_lang as liquid;

extern crate alloc;

use alloc::format;

struct ByteBuf<'a>(&'a [u8]);

impl<'a> alloc::fmt::LowerHex for ByteBuf<'a> {
    fn fmt(&self, formatter: &mut alloc::fmt::Formatter) -> Result<(), alloc::fmt::Error> {
        for byte in self.0 {
            formatter.write_fmt(format_args!("{:02x}", byte))?;
        }
        Ok(())
    }
}

#[liquid::interface(name = "Rescue")]
mod rescue {
    extern "solidity" {
        fn hash(&self, prev_digest: String, r: String) -> String;
        fn verify(&self, r1: String, digest: String, proof: String) -> bool;
    }
}

#[liquid::interface(name = "Meta")]
mod meta {
    extern "solidity" {
        fn lastBlockHash(&self) -> bytes32;
    }
}

#[liquid::contract]
mod drug_traceability {
    use super::*;
    use super::{rescue::*};
    use super::{meta::*};

    #[liquid(storage)]
    struct DrugTraceability {
        traces: storage::Mapping<String, Vec<String>>,
        meta_addr: storage::Value<address>,
    }

    #[liquid(methods)]
    impl DrugTraceability {
        pub fn new(&mut self, meta_addr: address) {
            self.traces.initialize();
            self.meta_addr.initialize(meta_addr);
        }

        pub fn get_trace_length(&self, id: String) -> u32 {
            self.traces.get(&id).unwrap().len() as u32
        }

        pub fn get_trace_item(&self, id: String, index: u32) -> String {
            self.traces.get(&id).unwrap()[index as usize].clone()
        }

        pub fn set(&mut self, id: String, c: String, proof: String) {
            let rescue = Rescue::at("0x5008".parse().unwrap());
            let meta = Meta::at(*self.meta_addr);
            let last_block = format!("{:02x}", ByteBuf(&meta.lastBlockHash().unwrap().0));
            let digest = rescue.hash(id.clone(), last_block.clone()).unwrap();
            if rescue.verify(last_block.clone(), digest.clone(), proof).unwrap() {
                if !self.traces.contains_key(&id) {
                    let vec: Vec<String> = Vec::new();
                    self.traces.insert(&id, vec);
                }
                self.traces.get_mut(&id).unwrap().push(c);
            }
        }
    }
}
