import init from './rescue.wasm';

const {
    memory: _memory,
    alloc,
    dealloc_str,
    dealloc_buffer,
    hash: _hash,
    prove: _prove,
    verify: _verify,
} = await init();

const utf8Decoder = new TextDecoder("UTF-8");
const utf8Encoder = new TextEncoder("UTF-8");

function copyStringFromMemory(start) {
    const memory = new Uint8Array(_memory.buffer);
    let end = start;
    while (memory[end++]) { }

    const str = utf8Decoder.decode(memory.slice(start, end));
    dealloc_str(start);
    return str;
}

function copyBufferFromMemory(start, length) {
    const memory = new Uint8Array(_memory.buffer);
    const str = memory.slice(start, start + length);
    dealloc_buffer(start, length);
    return str;
}

function copyBufferToMemory(buffer) {
    const memory = new Uint8Array(_memory.buffer);
    const ptr = alloc(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
        memory[ptr + i] = buffer[i];
    }
    return ptr;
}

function copyStringToMemory(str) {
    const memory = new Uint8Array(_memory.buffer);
    let buffer = utf8Encoder.encode(str);
    const ptr = copyBufferToMemory(buffer);
    memory[ptr + buffer.length] = 0;
    return ptr;
}

const ROUNDS = 128;

export const hash = (value, seed) => copyBufferFromMemory(
    _hash(copyBufferToMemory(value), copyBufferToMemory(seed), ROUNDS),
    32
);

export const prove = (value, seed, digest) => copyStringFromMemory(
    _prove(copyBufferToMemory(value), copyBufferToMemory(seed), copyBufferToMemory(digest), ROUNDS)
);

export const verify = (seed, digest, proof) => !!_verify(copyBufferToMemory(seed), copyBufferToMemory(digest), copyStringToMemory(proof));
