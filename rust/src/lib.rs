mod air;
mod utils;
mod rescue;
use air::{build_trace, PublicInputs, RescueAir};
use std::ffi::CStr;
use std::mem;
use std::ffi::CString;
use std::os::raw::{c_char, c_void};
use winterfell::{
    math::{fields::f128::BaseElement},
    FieldExtension, HashFunction, ProofOptions, StarkProof,
};
use std::slice;
extern crate base64;

#[no_mangle]
pub extern "C" fn alloc(size: usize) -> *mut c_void {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    mem::forget(buf);
    return ptr as *mut c_void;
}

#[no_mangle]
pub extern "C" fn dealloc_buffer(ptr: *mut u8, length: usize) {
    unsafe {
        let _ = slice::from_raw_parts(ptr, length);
    }
}
#[no_mangle]
pub extern "C" fn dealloc_str(ptr: *mut c_char) {
    unsafe {
        let _ = CString::from_raw(ptr);
    }
}

#[no_mangle]
pub fn hash(prev_digest_ptr: *const u8, r_ptr: *const u8) -> *mut u8 {
    let prev_digest_raw = unsafe { slice::from_raw_parts(prev_digest_ptr as *const u128, 2) };
    let r_raw = unsafe { slice::from_raw_parts(r_ptr as *const u128, 2) };
    let mut result = [prev_digest_raw[0], prev_digest_raw[1], r_raw[0], r_raw[1]].map(BaseElement::from);
    rescue::hash(&mut result);
    Box::into_raw(Box::new(result)) as *mut _
}

#[no_mangle]
pub fn prove(r0_ptr: *const u8, r1_ptr: *const u8, result_ptr: *const u8) -> *mut c_char {
    let r0_raw = unsafe { slice::from_raw_parts(r0_ptr as *const u128, 2) };
    let r1_raw = unsafe { slice::from_raw_parts(r1_ptr as *const u128, 2) };
    let result_raw = unsafe { slice::from_raw_parts(result_ptr as *const u128, 2) };
    let r0 = [BaseElement::from(r0_raw[0]), BaseElement::from(r0_raw[1])];
    let r1 = [BaseElement::from(r1_raw[0]), BaseElement::from(r1_raw[1])];
    let result = [BaseElement::from(result_raw[0]), BaseElement::from(result_raw[1])];
    let trace = build_trace(r0, r1);

    let pub_inputs = PublicInputs {
        r1,
        result,
    };
    let options = ProofOptions::new(
        42, // number of queries
        4,  // blowup factor
        16,  // grinding factor
        HashFunction::Blake3_256,
        FieldExtension::None,
        8,   // FRI folding factor
        256, // FRI max remainder length
    );
    CString::new(base64::encode(winterfell::prove::<RescueAir>(trace, pub_inputs, options).unwrap().to_bytes())).unwrap().into_raw()
}

#[no_mangle]
pub fn verify(r1_ptr: *const u8, result_ptr: *const u8, proof_ptr: *const c_char) -> bool {
    let r1_raw = unsafe { slice::from_raw_parts(r1_ptr as *const u128, 2) };
    let result_raw = unsafe { slice::from_raw_parts(result_ptr as *const u128, 2) };
    let proof_raw = unsafe { CStr::from_ptr(proof_ptr) };
    let r1 = [BaseElement::from(r1_raw[0]), BaseElement::from(r1_raw[1])];
    let result = [BaseElement::from(result_raw[0]), BaseElement::from(result_raw[1])];
    let proof = base64::decode(proof_raw.to_bytes()).unwrap();
    let pub_inputs = PublicInputs {
        r1,
        result,
    };
    match winterfell::verify::<RescueAir>(StarkProof::from_bytes(&proof).unwrap(), pub_inputs) {
        Ok(_) => true,
        Err(_) => false,
    }
}

