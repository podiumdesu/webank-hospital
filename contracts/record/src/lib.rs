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
        cas: storage::Mapping<String, ([String; 2], timestamp)>,
        cbs: storage::Mapping<String, ([String; 2], timestamp)>,
    }

    #[liquid(methods)]
    impl MedicalRecord {
        pub fn new(&mut self) {
            self.cas.initialize();
            self.cbs.initialize();
        }

        pub fn get_ca(&self, aid: String) -> ([String; 2], timestamp) {
            self.cas.get(&aid).unwrap().clone()
        }

        pub fn get_cb(&self, bid: String) -> ([String; 2], timestamp) {
            self.cbs.get(&bid).unwrap().clone()
        }

        pub fn set(&mut self, aid: String, ca: [String; 2]) {
            let now = self.env().now();
            if !self.cas.contains_key(&aid) {
                self.cas.insert(&aid, (ca, now));
            }
        }

        pub fn re_encrypt(&mut self, aid: String, bid: String, rk: String) {
            let pre = PRE::at("0x5007".parse().unwrap());
            let (key, now) = self.cas.get(&aid).unwrap();
            let cb = [key[0].clone(), pre.reEncrypt(key[1].clone(), rk).unwrap().clone()];
            self.cbs.insert(&bid, (cb, now.clone()));
        }
    }
}
