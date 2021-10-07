#![cfg_attr(not(feature = "std"), no_std)]

use liquid::storage;
use liquid_lang as liquid;

#[liquid::interface(name = "PRE")]
mod pre {
    extern "solidity" {
        fn reEncrypt(&self, ca1: String, rk: String) -> String;
    }
}

#[liquid::contract]
mod medical_record {
    use super::*;
    use super::{pre::*};
    #[liquid(storage)]
    struct MedicalRecord {
        cas: storage::Mapping<String, [String; 2]>,
        timestamps: storage::Mapping<String, timestamp>,
    }

    #[liquid(methods)]
    impl MedicalRecord {
        pub fn new(&mut self) {
            self.cas.initialize();
            self.timestamps.initialize();
        }

        pub fn get(&self, id: String) -> [String; 2] {
            self.cas.get(&id).unwrap().clone()
        }

        pub fn get_timestamp(&self, id: String) -> timestamp {
            self.timestamps.get(&id).unwrap().clone()
        }

        pub fn set(&mut self, id: String, key: [String; 2]) {
            if !self.cas.contains_key(&id) {
                self.cas.insert(&id, key);
                self.timestamps.insert(&id, self.env().now());
            }
        }

        pub fn re_encrypt(&self, id: String, rk: String) -> [String; 2] {
            let pre = PRE::at("0x5007".parse().unwrap());
            let key = self.cas.get(&id).unwrap();
            [key[0].clone(), pre.reEncrypt(key[1].clone(), rk).unwrap().clone()]
        }
    }
}
