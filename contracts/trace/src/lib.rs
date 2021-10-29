#![cfg_attr(not(feature = "std"), no_std)]

use liquid::storage;
use liquid_lang as liquid;
use liquid_lang::State;
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

#[liquid::interface(name = "Mcl")]
mod mcl {
    extern "solidity" {
        fn aggregateSig(&self, sig1: String, sig2: String) -> String;
        fn multiAggregateSig(&self, sig1: String, sig2: String, pk1: String, pk2: String) -> String;
        fn multiAggregatePK(&self, pk1: String, pk2: String) -> String;
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
    use super::{mcl::*};

    #[derive(State)]
    pub struct Node {
        data: String,
        time: timestamp,
    }

    #[liquid(storage)]
    struct DrugTraceability {
        traces: storage::Mapping<String, Vec<Node>>,
        signatures: storage::Mapping<String, (String, String)>,
        meta_addr: storage::Value<address>,
    }

    #[liquid(methods)]
    impl DrugTraceability {
        pub fn new(&mut self, meta_addr: address) {
            self.traces.initialize();
            self.signatures.initialize();
            self.meta_addr.initialize(meta_addr);
        }

        pub fn get_trace_length(&self, id: String) -> u32 {
            if !self.traces.contains_key(&id) {
                return 0;
            }
            self.traces.get(&id).unwrap().len() as u32
        }

        pub fn get_trace_item(&self, id: String, index: u32) -> (String, timestamp) {
            let node = &self.traces.get(&id).unwrap()[index as usize];
            (node.data.clone(), node.time)
        }

        pub fn get_trace_signature(&mut self, id: String) -> (String, String) {
            if !self.signatures.contains_key(&id) {
                self.signatures.insert(&id, ("c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000".parse().unwrap(), "c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000".parse().unwrap()));
            }
            self.signatures.get(&id).unwrap().clone()
        }

        pub fn set(&mut self, id: String, c: String, prev_sig: String, curr_sig: String, proof: String) {
            let now = self.env().now();
            let mcl = Mcl::at("0x5007".parse().unwrap());
            let rescue = Rescue::at("0x5008".parse().unwrap());
            let meta = Meta::at(*self.meta_addr);
            let last_block = format!("{:02x}", ByteBuf(&meta.lastBlockHash().unwrap().0));
            let digest = rescue.hash(id.clone(), last_block.clone()).unwrap();
            if rescue.verify(last_block.clone(), digest.clone(), proof).unwrap() {
                if !self.signatures.contains_key(&id) {
                    self.signatures.insert(&id, (prev_sig, curr_sig));
                } else {
                    let mut sig = self.signatures.get_mut(&id).unwrap();
                    sig.0 = mcl.aggregateSig(sig.0.clone(), prev_sig).unwrap();
                    sig.1 = curr_sig;
                }
                if !self.traces.contains_key(&id) {
                    self.traces.insert(&id, Vec::new());
                }
                self.traces.get_mut(&id).unwrap().push(Node {
                    data: c,
                    time: now,
                });
            }
        }
    }
}
