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

    const str = utf8Decoder.decode(memory.slice(start, end - 1));
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

export const hash = (r0, r1) => copyBufferFromMemory(
    _hash(copyBufferToMemory(r0), copyBufferToMemory(r1)),
    32
);

export const prove = (r0, r1, digest) => copyStringFromMemory(
    _prove(copyBufferToMemory(r0), copyBufferToMemory(r1), copyBufferToMemory(digest))
);

export const verify = (r1, digest, proof) => !!_verify(copyBufferToMemory(r1), copyBufferToMemory(digest), copyStringToMemory(proof));
