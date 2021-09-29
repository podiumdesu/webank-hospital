#![cfg_attr(not(feature = "std"), no_std)]

use liquid::storage;
use liquid_lang as liquid;

#[liquid::interface(name = "PRE")]
mod pre {
    extern "solidity" {
        fn generatorGen(&self, g: String, h: String) -> (String, String);
        fn reEncrypt(&self, ca1: String, rk: String) -> String;
    }
}

#[liquid::contract]
mod medical_record {
    use super::*;
    use super::{pre::*};
    #[liquid(storage)]
    struct MedicalRecord {
        keys: storage::Mapping<String, [String; 2]>,
    }

    /// Defines the methods of your contract.
    #[liquid(methods)]
    impl MedicalRecord {
        pub fn new(&mut self) {
            self.keys.initialize();
        }

        pub fn get(&self, id: String) -> [String; 2] {
            self.keys.get(&id).unwrap().clone()
        }

        pub fn set(&mut self, id: String, key: [String; 2]) {
            if !self.keys.contains_key(&id) {
                self.keys.insert(&id, key);
            }
        }

        pub fn re_encrypt(&self, id: String, rk: String) -> [String; 2] {
            let pre = PRE::at("0x5007".parse().unwrap());
            let key = self.keys.get(&id).unwrap();
            [key[0].clone(), pre.reEncrypt(key[1].clone(), rk).unwrap().clone()]
        }
    }
}
