import * as mod from './binding';

export const BN254 = 0
export const BN381_1 = 1
export const BN381_2 = 2
export const BN462 = 3
export const BN_SNARK1 = 4
export const BLS12_381 = 5

export const SECP224K1 = 101
export const SECP256K1 = 102
export const SECP384R1 = 103
export const NIST_P192 = 105
export const NIST_P224 = 106
export const NIST_P256 = 107

export const IRTF = 5 /* MCL_MAP_TO_MODE_HASH_TO_CURVE_07 */
export const EC_PROJ = 1024 /* flag for G1/G2.getStr */

export const ethMode = true
export const ETH_MODE_DRAFT_05 = 1
export const ETH_MODE_DRAFT_06 = 2
export const ETH_MODE_DRAFT_07 = 3
const MCLBN_FP_UNIT_SIZE = 6
const MCLBN_FR_UNIT_SIZE = 4
const MCLBN_FP_SIZE = MCLBN_FP_UNIT_SIZE * 8
const MCLBN_FR_SIZE = MCLBN_FR_UNIT_SIZE * 8
const MCLBN_G1_SIZE = MCLBN_FP_SIZE * 3
const MCLBN_G2_SIZE = MCLBN_FP_SIZE * 6
const MCLBN_GT_SIZE = MCLBN_FP_SIZE * 12

const BLS_COMPILER_TIME_VAR_ADJ = ethMode ? 200 : 0
const MCLBN_COMPILED_TIME_VAR = (MCLBN_FR_UNIT_SIZE * 10 + MCLBN_FP_UNIT_SIZE) + BLS_COMPILER_TIME_VAR_ADJ
const BLS_ID_SIZE = MCLBN_FR_SIZE
const BLS_SECRETKEY_SIZE = MCLBN_FR_SIZE
const BLS_PUBLICKEY_SIZE = MCLBN_FP_SIZE * 3 * (ethMode ? 1 : 2)
const BLS_SIGNATURE_SIZE = MCLBN_FP_SIZE * 3 * (ethMode ? 2 : 1)

const _malloc = size => {
    return mod._blsMalloc(size)
}
const _free = pos => {
    mod._blsFree(pos)
}
const ptrToAsciiStr = (pos, n) => {
    let s = ''
    for (let i = 0; i < n; i++) {
        s += String.fromCharCode(mod.HEAP8[pos + i])
    }
    return s
}
const asciiStrToPtr = (pos, s) => {
    for (let i = 0; i < s.length; i++) {
        mod.HEAP8[pos + i] = s.charCodeAt(i)
    }
}
export const toHex = (a, start, n) => {
    let s = ''
    for (let i = 0; i < n; i++) {
        s += ('0' + a[start + i].toString(16)).slice(-2)
    }
    return s
}
// Uint8Array to hex string
export const toHexStr = a => {
    return toHex(a, 0, a.length)
}
// hex string to Uint8Array
export const fromHexStr = s => {
    if (s.length & 1) throw new Error('fromHexStr:length must be even ' + s.length)
    const n = s.length / 2
    const a = new Uint8Array(n)
    for (let i = 0; i < n; i++) {
        a[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16)
    }
    return a
}
///////////////////////////
const copyToUint32Array = (a, pos) => {
    a.set(mod.HEAP32.subarray(pos / 4, pos / 4 + a.length))
    //    for (let i = 0; i < a.length; i++) {
    //      a[i] = mod.HEAP32[pos / 4 + i]
    //    }
}
const copyFromUint32Array = (pos, a) => {
    mod.HEAP32.set(a, pos / 4)
    //    for (let i = 0; i < a.length; i++) {
    //      mod.HEAP32[pos / 4 + i] = a[i]
    //    }
}
//////////////////////////////////
const _wrapGetStr = (func, returnAsStr = true) => {
    return (x, ioMode = 0) => {
        const maxBufSize = 3096
        const pos = _malloc(maxBufSize)
        const n = func(pos, maxBufSize, x, ioMode)
        if (n <= 0) {
            throw new Error('err gen_str:' + x)
        }
        let s = null
        if (returnAsStr) {
            s = ptrToAsciiStr(pos, n)
        } else {
            s = new Uint8Array(mod.HEAP8.subarray(pos, pos + n))
        }
        _free(pos)
        return s
    }
}
const _wrapSerialize = func => {
    return _wrapGetStr(func, false)
}
const _wrapDeserialize = func => {
    return (x, buf) => {
        const pos = _malloc(buf.length)
        mod.HEAP8.set(buf, pos)
        const r = func(x, pos, buf.length)
        _free(pos)
        if (r === 0 || r !== buf.length) throw new Error('err _wrapDeserialize', buf)
    }
}
/*
  argNum : n
  func(x0, ..., x_(n-1), buf, ioMode)
  => func(x0, ..., x_(n-1), pos, buf.length, ioMode)
*/
const _wrapInput = (func, argNum, returnValue = false) => {
    return function () {
        const args = [...arguments]
        const buf = args[argNum]
        const typeStr = Object.prototype.toString.apply(buf)
        if (['[object String]', '[object Uint8Array]', '[object Array]'].indexOf(typeStr) < 0) {
            throw new Error(`err bad type:"${typeStr}". Use String or Uint8Array.`)
        }
        const ioMode = args[argNum + 1] // may undefined
        const pos = _malloc(buf.length)
        if (typeStr === '[object String]') {
            asciiStrToPtr(pos, buf)
        } else {
            mod.HEAP8.set(buf, pos)
        }
        const r = func(...args.slice(0, argNum), pos, buf.length, ioMode)
        _free(pos)
        if (returnValue) return r
        if (r) throw new Error('err _wrapInput ' + buf)
    }
}
const _mulVec = (func, xVec, yVec, Cstr) => {
    const n = xVec.length
    if (n != yVec.length) throw new Error(`err _mulVec bad length ${n}, ${yVec.length}`)
    const xSize = xVec[0].a_.length
    const ySize = yVec[0].a_.length
    const z = new Cstr()
    const zPos = z._alloc()
    const xPos = _malloc(xSize * n * 4)
    const yPos = _malloc(ySize * n * 4)
    let pos = xPos / 4
    for (let i = 0; i < n; i++) {
        mod.HEAP32.set(xVec[i].a_, pos)
        pos += xSize
    }
    pos = yPos / 4
    for (let i = 0; i < n; i++) {
        mod.HEAP32.set(yVec[i].a_, pos)
        pos += ySize
    }
    func(zPos, xPos, yPos, n)
    _free(yPos)
    _free(xPos)
    z._saveAndFree(zPos)
    return z
}
const mclBnFr_malloc = () => {
    return _malloc(MCLBN_FR_SIZE)
}
export const free = x => {
    _free(x)
}
const mclBnFr_setLittleEndian = _wrapInput(mod._mclBnFr_setLittleEndian, 1)
const mclBnFr_setLittleEndianMod = _wrapInput(mod._mclBnFr_setLittleEndianMod, 1)
const mclBnFr_setBigEndianMod = _wrapInput(mod._mclBnFr_setBigEndianMod, 1)
const mclBnFr_setStr = _wrapInput(mod._mclBnFr_setStr, 1)
const mclBnFr_getStr = _wrapGetStr(mod._mclBnFr_getStr)
const mclBnFr_deserialize = _wrapDeserialize(mod._mclBnFr_deserialize)
const mclBnFr_serialize = _wrapSerialize(mod._mclBnFr_serialize)
const mclBnFr_setHashOf = _wrapInput(mod._mclBnFr_setHashOf, 1)
/// ////////////////////////////////////////////////////////////
const mclBnFp_malloc = () => {
    return _malloc(MCLBN_FP_SIZE)
}
const mclBnFp_setLittleEndian = _wrapInput(mod._mclBnFp_setLittleEndian, 1)
const mclBnFp_setLittleEndianMod = _wrapInput(mod._mclBnFp_setLittleEndianMod, 1)
const mclBnFp_setBigEndianMod = _wrapInput(mod._mclBnFp_setBigEndianMod, 1)
const mclBnFp_setStr = _wrapInput(mod._mclBnFp_setStr, 1)
const mclBnFp_getStr = _wrapGetStr(mod._mclBnFp_getStr)
const mclBnFp_deserialize = _wrapDeserialize(mod._mclBnFp_deserialize)
const mclBnFp_serialize = _wrapSerialize(mod._mclBnFp_serialize)
const mclBnFp_setHashOf = _wrapInput(mod._mclBnFp_setHashOf, 1)

const mclBnFp2_malloc = () => {
    return _malloc(MCLBN_FP_SIZE * 2)
}
const mclBnFp2_deserialize = _wrapDeserialize(mod._mclBnFp2_deserialize)
const mclBnFp2_serialize = _wrapSerialize(mod._mclBnFp2_serialize)

/// ////////////////////////////////////////////////////////////
const mclBnG1_malloc = () => {
    return _malloc(MCLBN_G1_SIZE)
}
const mclBnG1_setStr = _wrapInput(mod._mclBnG1_setStr, 1)
const mclBnG1_getStr = _wrapGetStr(mod._mclBnG1_getStr)
const mclBnG1_deserialize = _wrapDeserialize(mod._mclBnG1_deserialize)
const mclBnG1_serialize = _wrapSerialize(mod._mclBnG1_serialize)
const mclBnG1_hashAndMapTo = _wrapInput(mod._mclBnG1_hashAndMapTo, 1)

/// ////////////////////////////////////////////////////////////
const mclBnG2_malloc = () => {
    return _malloc(MCLBN_G2_SIZE)
}
const mclBnG2_setStr = _wrapInput(mod._mclBnG2_setStr, 1)
const mclBnG2_getStr = _wrapGetStr(mod._mclBnG2_getStr)
const mclBnG2_deserialize = _wrapDeserialize(mod._mclBnG2_deserialize)
const mclBnG2_serialize = _wrapSerialize(mod._mclBnG2_serialize)
const mclBnG2_hashAndMapTo = _wrapInput(mod._mclBnG2_hashAndMapTo, 1)

/// ////////////////////////////////////////////////////////////
const mclBnGT_malloc = () => {
    return _malloc(MCLBN_GT_SIZE)
}
const mclBnGT_deserialize = _wrapDeserialize(mod._mclBnGT_deserialize)
const mclBnGT_serialize = _wrapSerialize(mod._mclBnGT_serialize)
const mclBnGT_setStr = _wrapInput(mod._mclBnGT_setStr, 1)
const mclBnGT_getStr = _wrapGetStr(mod._mclBnGT_getStr)
/// ////////////////////////////////////////////////////////////

export const getCurveOrder = _wrapGetStr(mod._blsGetCurveOrder)
export const getFieldOrder = _wrapGetStr(mod._blsGetFieldOrder)

export const blsIdSetDecStr = _wrapInput(mod._blsIdSetDecStr, 1)
export const blsIdSetHexStr = _wrapInput(mod._blsIdSetHexStr, 1)
export const blsIdGetDecStr = _wrapGetStr(mod._blsIdGetDecStr)
export const blsIdGetHexStr = _wrapGetStr(mod._blsIdGetHexStr)

export const blsIdSerialize = _wrapSerialize(mod._blsIdSerialize)
export const blsSecretKeySerialize = _wrapSerialize(mod._blsSecretKeySerialize)
export const blsPublicKeySerialize = _wrapSerialize(mod._blsPublicKeySerialize)
export const blsSignatureSerialize = _wrapSerialize(mod._blsSignatureSerialize)

export const blsIdDeserialize = _wrapDeserialize(mod._blsIdDeserialize)
export const blsSecretKeyDeserialize = _wrapDeserialize(mod._blsSecretKeyDeserialize)
export const blsPublicKeyDeserialize = _wrapDeserialize(mod._blsPublicKeyDeserialize)
export const blsSignatureDeserialize = _wrapDeserialize(mod._blsSignatureDeserialize)

export const blsPublicKeySerializeUncompressed = _wrapSerialize(mod._blsPublicKeySerializeUncompressed)
export const blsSignatureSerializeUncompressed = _wrapSerialize(mod._blsSignatureSerializeUncompressed)
export const blsPublicKeyDeserializeUncompressed = _wrapDeserialize(mod._blsPublicKeyDeserializeUncompressed)
export const blsSignatureDeserializeUncompressed = _wrapDeserialize(mod._blsSignatureDeserializeUncompressed)

export const blsSecretKeySetLittleEndian = _wrapInput(mod._blsSecretKeySetLittleEndian, 1)
export const blsSecretKeySetLittleEndianMod = _wrapInput(mod._blsSecretKeySetLittleEndianMod, 1)
export const blsHashToSecretKey = _wrapInput(mod._blsHashToSecretKey, 1)
export const blsSign = _wrapInput(mod._blsSign, 2)
export const blsVerify = _wrapInput(mod._blsVerify, 2, true)

class Common {
    constructor(size) {
        this.a_ = new Uint32Array(size / 4)
    }
    deserializeHexStr(s) {
        this.deserialize(fromHexStr(s))
    }
    serializeToHexStr() {
        return toHexStr(this.serialize())
    }
    dump(msg = '') {
        console.log(msg + this.serializeToHexStr())
    }
    clear() {
        this.a_.fill(0)
    }
    // copy to allocated memory
    copyToMem(pos) {
        mod.HEAP32.set(this.a_, pos / 4)
    }
    // copy from allocated memory
    copyFromMem(pos) {
        this.a_.set(mod.HEAP32.subarray(pos / 4, pos / 4 + this.a_.length))
    }
    // alloc new array
    _alloc() {
        return _malloc(this.a_.length * 4)
    }
    // alloc and copy a_ to HEAP32[pos / 4]
    _allocAndCopy() {
        const pos = this._alloc()
        mod.HEAP32.set(this.a_, pos / 4)
        return pos
    }
    // save pos to a_
    _save(pos) {
        this.a_.set(mod.HEAP32.subarray(pos / 4, pos / 4 + this.a_.length))
    }
    // save and free
    _saveAndFree(pos) {
        this._save(pos)
        _free(pos)
    }
    // set parameter (p1, p2 may be undefined)
    _setter(func, p1, p2) {
        const pos = this._alloc()
        const r = func(pos, p1, p2)
        this._saveAndFree(pos)
        if (r) throw new Error('_setter err')
    }
    // getter (p1, p2 may be undefined)
    _getter(func, p1, p2) {
        const pos = this._allocAndCopy()
        const s = func(pos, p1, p2)
        _free(pos)
        return s
    }
    _isEqual(func, rhs) {
        const xPos = this._allocAndCopy()
        const yPos = rhs._allocAndCopy()
        const r = func(xPos, yPos)
        _free(yPos)
        _free(xPos)
        return r === 1
    }
    // func(y, this) and return y
    _op1(func) {
        const y = new this.constructor()
        const xPos = this._allocAndCopy()
        const yPos = y._alloc()
        func(yPos, xPos)
        y._saveAndFree(yPos)
        _free(xPos)
        return y
    }
    // func(z, this, y) and return z
    _op2(func, y, Cstr = null) {
        const z = Cstr ? new Cstr() : new this.constructor()
        const xPos = this._allocAndCopy()
        const yPos = y._allocAndCopy()
        const zPos = z._alloc()
        func(zPos, xPos, yPos)
        z._saveAndFree(zPos)
        _free(yPos)
        _free(xPos)
        return z
    }
    // devide Uint32Array a into n and chose the idx-th
    _getSubArray(idx, n) {
        const d = this.a_.length / n
        return new Uint32Array(this.a_.buffer, d * idx * 4, d)
    }
    // set array lhs to idx
    _setSubArray(lhs, idx, n) {
        const d = this.a_.length / n
        this.a_.set(lhs.a_, d * idx)
    }
}
export const Fr = class extends Common {
    constructor() {
        super(MCLBN_FR_SIZE)
    }
    setInt(x) {
        this._setter(mod._mclBnFr_setInt32, x)
    }
    deserialize(s) {
        this._setter(mclBnFr_deserialize, s)
    }
    serialize() {
        return this._getter(mclBnFr_serialize)
    }
    setStr(s, base = 0) {
        this._setter(mclBnFr_setStr, s, base)
    }
    getStr(base = 0) {
        return this._getter(mclBnFr_getStr, base)
    }
    isZero() {
        return this._getter(mod._mclBnFr_isZero) === 1
    }
    isOne() {
        return this._getter(mod._mclBnFr_isOne) === 1
    }
    isEqual(rhs) {
        return this._isEqual(mod._mclBnFr_isEqual, rhs)
    }
    setLittleEndian(s) {
        this._setter(mclBnFr_setLittleEndian, s)
    }
    setLittleEndianMod(s) {
        this._setter(mclBnFr_setLittleEndianMod, s)
    }
    setBigEndianMod(s) {
        this._setter(mclBnFr_setBigEndianMod, s)
    }
    setByCSPRNG() {
        const a = new Uint8Array(MCLBN_FR_SIZE)
        crypto.getRandomValues(a)
        this.setLittleEndian(a)
    }
    setHashOf(s) {
        this._setter(mclBnFr_setHashOf, s)
    }
}
export const deserializeHexStrToFr = s => {
    const r = new Fr()
    r.deserializeHexStr(s)
    return r
}
export const Fp = class extends Common {
    constructor() {
        super(MCLBN_FP_SIZE)
    }
    setInt(x) {
        this._setter(mod._mclBnFp_setInt32, x)
    }
    deserialize(s) {
        this._setter(mclBnFp_deserialize, s)
    }
    serialize() {
        return this._getter(mclBnFp_serialize)
    }
    setStr(s, base = 0) {
        this._setter(mclBnFp_setStr, s, base)
    }
    getStr(base = 0) {
        return this._getter(mclBnFp_getStr, base)
    }
    isEqual(rhs) {
        return this._isEqual(mod._mclBnFp_isEqual, rhs)
    }
    setLittleEndian(s) {
        this._setter(mclBnFp_setLittleEndian, s)
    }
    setLittleEndianMod(s) {
        this._setter(mclBnFp_setLittleEndianMod, s)
    }
    setBigEndianMod(s) {
        this._setter(mclBnFp_setBigEndianMod, s)
    }
    setByCSPRNG() {
        const a = new Uint8Array(MCLBN_FP_SIZE)
        crypto.getRandomValues(a)
        this.setLittleEndian(a)
    }
    setHashOf(s) {
        this._setter(mclBnFp_setHashOf, s)
    }
    mapToG1() {
        const y = new G1()
        const xPos = this._allocAndCopy()
        const yPos = y._alloc()
        mod._mclBnFp_mapToG1(yPos, xPos)
        y._saveAndFree(yPos)
        _free(xPos)
        return y
    }
}
export const deserializeHexStrToFp = s => {
    const r = new Fp()
    r.deserializeHexStr(s)
    return r
}
export const Fp2 = class extends Common {
    constructor() {
        super(MCLBN_FP_SIZE * 2)
    }
    setInt(x, y) {
        const v = new Fp()
        v.setInt(x)
        this.set_a(v)
        v.setInt(y)
        this.set_b(v)
    }
    deserialize(s) {
        this._setter(mclBnFp2_deserialize, s)
    }
    serialize() {
        return this._getter(mclBnFp2_serialize)
    }
    isEqual(rhs) {
        return this._isEqual(mod._mclBnFp2_isEqual, rhs)
    }
    /*
      x = a + bi where a, b in Fp and i^2 = -1
    */
    get_a() {
        const r = new Fp()
        r.a_ = this._getSubArray(0, 2)
        return r
    }
    get_b() {
        const r = new Fp()
        r.a_ = this._getSubArray(1, 2)
        return r
    }
    set_a(v) {
        this._setSubArray(v, 0, 2)
    }
    set_b(v) {
        this._setSubArray(v, 1, 2)
    }
    mapToG2() {
        const y = new G2()
        const xPos = this._allocAndCopy()
        const yPos = y._alloc()
        mod._mclBnFp2_mapToG2(yPos, xPos)
        y._saveAndFree(yPos)
        _free(xPos)
        return y
    }
}
export const deserializeHexStrToFp2 = s => {
    const r = new Fp2()
    r.deserializeHexStr(s)
    return r
}
export const G1 = class extends Common {
    constructor() {
        super(MCLBN_G1_SIZE)
    }
    deserialize(s) {
        this._setter(mclBnG1_deserialize, s)
    }
    serialize() {
        return this._getter(mclBnG1_serialize)
    }
    setStr(s, base = 0) {
        this._setter(mclBnG1_setStr, s, base)
    }
    getStr(base = 0) {
        return this._getter(mclBnG1_getStr, base)
    }
    normalize() {
        this.a_ = normalize(this).a_
    }
    getX() {
        const r = new Fp()
        r.a_ = this._getSubArray(0, 3)
        return r
    }
    getY() {
        const r = new Fp()
        r.a_ = this._getSubArray(1, 3)
        return r
    }
    getZ() {
        const r = new Fp()
        r.a_ = this._getSubArray(2, 3)
        return r
    }
    setX(v) {
        this._setSubArray(v, 0, 3)
    }
    setY(v) {
        this._setSubArray(v, 1, 3)
    }
    setZ(v) {
        this._setSubArray(v, 2, 3)
    }
    isZero() {
        return this._getter(mod._mclBnG1_isZero) === 1
    }
    isValid() {
        return this._getter(mod._mclBnG1_isValid) === 1
    }
    isValidOrder() {
        return this._getter(mod._mclBnG1_isValidOrder) === 1
    }
    isEqual(rhs) {
        return this._isEqual(mod._mclBnG1_isEqual, rhs)
    }
    setHashOf(s) {
        this._setter(mclBnG1_hashAndMapTo, s)
    }
}
export const deserializeHexStrToG1 = s => {
    const r = new G1()
    r.deserializeHexStr(s)
    return r
}
export const setETHserialization = (ETHserialization) => {
    mod._mclBn_setETHserialization(ETHserialization ? 1 : 0)
}
// mode = mcl.IRTF for Ethereum 2.0 spec
export const setMapToMode = (mode) => {
    mod._mclBn_setMapToMode(mode)
}
export const verifyOrderG1 = (doVerify) => {
    mod._mclBn_verifyOrderG1(doVerify ? 1 : 0)
}
export const verifyOrderG2 = (doVerify) => {
    mod._mclBn_verifyOrderG2(doVerify ? 1 : 0)
}
export const getBasePointG1 = () => {
    const x = new G1()
    const xPos = x._alloc()
    mod._mclBnG1_getBasePoint(xPos)
    x._saveAndFree(xPos)
    if (x.isZero()) {
        throw new Error('not supported for pairing curves')
    }
    return x
}
export const G2 = class extends Common {
    constructor() {
        super(MCLBN_G2_SIZE)
    }
    deserialize(s) {
        this._setter(mclBnG2_deserialize, s)
    }
    serialize() {
        return this._getter(mclBnG2_serialize)
    }
    setStr(s, base = 0) {
        this._setter(mclBnG2_setStr, s, base)
    }
    getStr(base = 0) {
        return this._getter(mclBnG2_getStr, base)
    }
    normalize() {
        this.a_ = normalize(this).a_
    }
    getX() {
        const r = new Fp2()
        r.a_ = this._getSubArray(0, 3)
        return r
    }
    getY() {
        const r = new Fp2()
        r.a_ = this._getSubArray(1, 3)
        return r
    }
    getZ() {
        const r = new Fp2()
        r.a_ = this._getSubArray(2, 3)
        return r
    }
    setX(v) {
        this._setSubArray(v, 0, 3)
    }
    setY(v) {
        this._setSubArray(v, 1, 3)
    }
    setZ(v) {
        this._setSubArray(v, 2, 3)
    }
    isZero() {
        return this._getter(mod._mclBnG2_isZero) === 1
    }
    isValid() {
        return this._getter(mod._mclBnG2_isValid) === 1
    }
    isValidOrder() {
        return this._getter(mod._mclBnG2_isValidOrder) === 1
    }
    isEqual(rhs) {
        return this._isEqual(mod._mclBnG2_isEqual, rhs)
    }
    setHashOf(s) {
        this._setter(mclBnG2_hashAndMapTo, s)
    }
}
export const deserializeHexStrToG2 = s => {
    const r = new G2()
    r.deserializeHexStr(s)
    return r
}
export const GT = class extends Common {
    constructor() {
        super(MCLBN_GT_SIZE)
    }
    setInt(x) {
        this._setter(mod._mclBnGT_setInt32, x)
    }
    deserialize(s) {
        this._setter(mclBnGT_deserialize, s)
    }
    serialize() {
        return this._getter(mclBnGT_serialize)
    }
    setStr(s, base = 0) {
        this._setter(mclBnGT_setStr, s, base)
    }
    getStr(base = 0) {
        return this._getter(mclBnGT_getStr, base)
    }
    isZero() {
        return this._getter(mod._mclBnGT_isZero) === 1
    }
    isOne() {
        return this._getter(mod._mclBnGT_isOne) === 1
    }
    isEqual(rhs) {
        return this._isEqual(mod._mclBnGT_isEqual, rhs)
    }
}
export const deserializeHexStrToGT = s => {
    const r = new GT()
    r.deserializeHexStr(s)
    return r
}
export const PrecomputedG2 = class {
    constructor(Q) {
        if (!(Q instanceof G2)) throw new Error('PrecomputedG2:bad type')
        const byteSize = mod._mclBn_getUint64NumToPrecompute() * 8
        this.p = _malloc(byteSize)
        const Qpos = Q._allocAndCopy()
        mod._mclBn_precomputeG2(this.p, Qpos)
        _free(Qpos)
    }
    /*
      call destroy if PrecomputedG2 is not necessary
      to avoid memory leak
    */
    destroy() {
        _free(this.p)
        this.p = null
    }
}
export const neg = x => {
    if (x instanceof Fr) {
        return x._op1(mod._mclBnFr_neg)
    }
    if (x instanceof Fp) {
        return x._op1(mod._mclBnFp_neg)
    }
    if (x instanceof G1) {
        return x._op1(mod._mclBnG1_neg)
    }
    if (x instanceof G2) {
        return x._op1(mod._mclBnG2_neg)
    }
    if (x instanceof GT) {
        return x._op1(mod._mclBnGT_neg)
    }
    if (x instanceof Fp2) {
        return x._op1(mod._mclBnFp2_neg)
    }
    throw new Error('neg:bad type')
}
export const sqr = x => {
    if (x instanceof Fp) {
        return x._op1(mod._mclBnFp_sqr)
    }
    if (x instanceof Fr) {
        return x._op1(mod._mclBnFr_sqr)
    }
    if (x instanceof GT) {
        return x._op1(mod._mclBnGT_sqr)
    }
    if (x instanceof Fp2) {
        return x._op1(mod._mclBnFp2_sqr)
    }
    throw new Error('sqr:bad type')
}
export const inv = x => {
    if (x instanceof Fp) {
        return x._op1(mod._mclBnFp_inv)
    }
    if (x instanceof Fr) {
        return x._op1(mod._mclBnFr_inv)
    }
    if (x instanceof GT) {
        return x._op1(mod._mclBnGT_inv)
    }
    if (x instanceof Fp2) {
        return x._op1(mod._mclBnFp2_inv)
    }
    throw new Error('inv:bad type')
}
export const normalize = x => {
    if (x instanceof G1) {
        return x._op1(mod._mclBnG1_normalize)
    }
    if (x instanceof G2) {
        return x._op1(mod._mclBnG2_normalize)
    }
    throw new Error('normalize:bad type')
}
export const add = (x, y) => {
    if (x.constructor !== y.constructor) throw new Error('add:mismatch type')
    if (x instanceof Fp) {
        return x._op2(mod._mclBnFp_add, y)
    }
    if (x instanceof Fr) {
        return x._op2(mod._mclBnFr_add, y)
    }
    if (x instanceof G1) {
        return x._op2(mod._mclBnG1_add, y)
    }
    if (x instanceof G2) {
        return x._op2(mod._mclBnG2_add, y)
    }
    if (x instanceof GT) {
        return x._op2(mod._mclBnGT_add, y)
    }
    if (x instanceof Fp2) {
        return x._op2(mod._mclBnFp2_add, y)
    }
    throw new Error('add:bad type')
}
export const sub = (x, y) => {
    if (x.constructor !== y.constructor) throw new Error('sub:mismatch type')
    if (x instanceof Fp) {
        return x._op2(mod._mclBnFp_sub, y)
    }
    if (x instanceof Fr) {
        return x._op2(mod._mclBnFr_sub, y)
    }
    if (x instanceof G1) {
        return x._op2(mod._mclBnG1_sub, y)
    }
    if (x instanceof G2) {
        return x._op2(mod._mclBnG2_sub, y)
    }
    if (x instanceof GT) {
        return x._op2(mod._mclBnGT_sub, y)
    }
    if (x instanceof Fp2) {
        return x._op2(mod._mclBnFp2_sub, y)
    }
    throw new Error('sub:bad type')
}
/*
  Fr * Fr
  G1 * Fr ; scalar mul
  G2 * Fr ; scalar mul
  GT * GT
*/
export const mul = (x, y) => {
    if (x instanceof Fp && y instanceof Fp) {
        return x._op2(mod._mclBnFp_mul, y)
    }
    if (x instanceof Fr && y instanceof Fr) {
        return x._op2(mod._mclBnFr_mul, y)
    }
    if (x instanceof G1 && y instanceof Fr) {
        return x._op2(mod._mclBnG1_mul, y)
    }
    if (x instanceof G2 && y instanceof Fr) {
        return x._op2(mod._mclBnG2_mul, y)
    }
    if (x instanceof GT && y instanceof GT) {
        return x._op2(mod._mclBnGT_mul, y)
    }
    if (x instanceof Fp2 && y instanceof Fp2) {
        return x._op2(mod._mclBnFp2_mul, y)
    }
    throw new Error('mul:mismatch type')
}
/*
  sum G1 * Fr ; scalar mul
  sum G2 * Fr ; scalar mul
*/
export const mulVec = (xVec, yVec) => {
    if (xVec.length == 0) throw new Error('mulVec:zero array')
    if (xVec[0] instanceof G1 && yVec[0] instanceof Fr) {
        return _mulVec(mod._mclBnG1_mulVec, xVec, yVec, G1)
    }
    if (xVec[0] instanceof G2 && yVec[0] instanceof Fr) {
        return _mulVec(mod._mclBnG2_mulVec, xVec, yVec, G2)
    }
    throw new Error('mulVec:mismatch type')
}
export const div = (x, y) => {
    if (x.constructor !== y.constructor) throw new Error('div:mismatch type')
    if (x instanceof Fp) {
        return x._op2(mod._mclBnFp_div, y)
    }
    if (x instanceof Fr) {
        return x._op2(mod._mclBnFr_div, y)
    }
    if (x instanceof GT) {
        return x._op2(mod._mclBnGT_div, y)
    }
    if (x instanceof Fp2) {
        return x._op2(mod._mclBnFp2_div, y)
    }
    throw new Error('div:bad type')
}
export const dbl = x => {
    if (x instanceof G1) {
        return x._op1(mod._mclBnG1_dbl)
    }
    if (x instanceof G2) {
        return x._op1(mod._mclBnG2_dbl)
    }
    throw new Error('dbl:bad type')
}
export const hashToFr = s => {
    const x = new Fr()
    x.setHashOf(s)
    return x
}
export const hashAndMapToG1 = s => {
    const x = new G1()
    x.setHashOf(s)
    return x
}
export const hashAndMapToG2 = s => {
    const x = new G2()
    x.setHashOf(s)
    return x
}
// pow(GT x, Fr y)
export const pow = (x, y) => {
    if (x instanceof GT && y instanceof Fr) {
        return x._op2(mod._mclBnGT_pow, y)
    }
    throw new Error('pow:bad type')
}
// pairing(G1 P, G2 Q)
export const pairing = (P, Q) => {
    if (P instanceof G1 && Q instanceof G2) {
        return P._op2(mod._mclBn_pairing, Q, GT)
    }
    throw new Error('pairing:bad type')
}
// millerLoop(G1 P, G2 Q)
export const millerLoop = (P, Q) => {
    if (P instanceof G1 && Q instanceof G2) {
        return P._op2(mod._mclBn_millerLoop, Q, GT)
    }
    throw new Error('millerLoop:bad type')
}
export const precomputedMillerLoop = (P, Qcoeff) => {
    if (!(P instanceof G1 && Qcoeff instanceof PrecomputedG2)) throw new Error('precomputedMillerLoop:bad type')
    const e = new GT()
    const PPos = P._allocAndCopy()
    const ePos = e._alloc()
    mod._mclBn_precomputedMillerLoop(ePos, PPos, Qcoeff.p)
    e._saveAndFree(ePos)
    _free(PPos)
    return e
}
// millerLoop(P1, Q1coeff) * millerLoop(P2, Q2coeff)
export const precomputedMillerLoop2 = (P1, Q1coeff, P2, Q2coeff) => {
    if (!(P1 instanceof G1 && Q1coeff instanceof PrecomputedG2 && P2 instanceof G1 && Q2coeff instanceof PrecomputedG2)) throw new Error('precomputedMillerLoop2mixed:bad type')
    const e = new GT()
    const P1Pos = P1._allocAndCopy()
    const P2Pos = P2._allocAndCopy()
    const ePos = e._alloc()
    mod._mclBn_precomputedMillerLoop2(ePos, P1Pos, Q1coeff.p, P2Pos, Q2coeff.p)
    e._saveAndFree(ePos)
    _free(P1Pos)
    _free(P2Pos)
    return e
}
// millerLoop(P1, Q1) * millerLoop(P2, Q2coeff)
export const precomputedMillerLoop2mixed = (P1, Q1, P2, Q2coeff) => {
    if (!(P1 instanceof G1 && Q1 instanceof G2 && P2 instanceof G1 && Q2coeff instanceof PrecomputedG2)) throw new Error('precomputedMillerLoop2mixed:bad type')
    const e = new GT()
    const P1Pos = P1._allocAndCopy()
    const Q1Pos = Q1._allocAndCopy()
    const P2Pos = P2._allocAndCopy()
    const ePos = e._alloc()
    mod._mclBn_precomputedMillerLoop2mixed(ePos, P1Pos, Q1Pos, P2Pos, Q2coeff.p)
    e._saveAndFree(ePos)
    _free(P1Pos)
    _free(Q1Pos)
    _free(P2Pos)
    return e
}
export const finalExp = x => {
    if (x instanceof GT) {
        return x._op1(mod._mclBn_finalExp)
    }
    throw new Error('finalExp:bad type')
}

const callSetter = (func, a, p1, p2) => {
    const pos = _malloc(a.length * 4)
    func(pos, p1, p2) // p1, p2 may be undefined
    copyToUint32Array(a, pos)
    _free(pos)
}
const callGetter = (func, a, p1, p2) => {
    const pos = _malloc(a.length * 4)
    mod.HEAP32.set(a, pos / 4)
    const s = func(pos, p1, p2)
    _free(pos)
    return s
}
const callShare = (func, a, size, vec, id) => {
    const pos = a._allocAndCopy()
    const idPos = id._allocAndCopy()
    const vecPos = _malloc(size * vec.length)
    for (let i = 0; i < vec.length; i++) {
        copyFromUint32Array(vecPos + size * i, vec[i].a_)
    }
    func(pos, vecPos, vec.length, idPos)
    _free(vecPos)
    _free(idPos)
    a._saveAndFree(pos)
}
const callRecover = (func, a, size, vec, idVec) => {
    const n = vec.length
    if (n != idVec.length) throw ('recover:bad length')
    const secPos = a._alloc()
    const vecPos = _malloc(size * n)
    const idVecPos = _malloc(BLS_ID_SIZE * n)
    for (let i = 0; i < n; i++) {
        copyFromUint32Array(vecPos + size * i, vec[i].a_)
        copyFromUint32Array(idVecPos + BLS_ID_SIZE * i, idVec[i].a_)
    }
    const r = func(secPos, vecPos, idVecPos, n)
    _free(idVecPos)
    _free(vecPos)
    a._saveAndFree(secPos)
    if (r) throw ('callRecover')
}

export const Id = class extends Common {
    constructor() {
        super(BLS_ID_SIZE)
    }
    setInt(x) {
        this._setter(mod._blsIdSetInt, x)
    }
    isEqual(rhs) {
        return this._isEqual(mod._blsIdIsEqual, rhs)
    }
    deserialize(s) {
        this._setter(blsIdDeserialize, s)
    }
    serialize() {
        return this._getter(blsIdSerialize)
    }
    setStr(s, base = 10) {
        switch (base) {
            case 10:
                this._setter(blsIdSetDecStr, s)
                return
            case 16:
                this._setter(blsIdSetHexStr, s)
                return
            default:
                throw ('BlsId.setStr:bad base:' + base)
        }
    }
    getStr(base = 10) {
        switch (base) {
            case 10:
                return this._getter(blsIdGetDecStr)
            case 16:
                return this._getter(blsIdGetHexStr)
            default:
                throw ('BlsId.getStr:bad base:' + base)
        }
    }
    setLittleEndian(s) {
        this._setter(blsSecretKeySetLittleEndian, s)
    }
    setLittleEndianMod(s) {
        this._setter(blsSecretKeySetLittleEndianMod, s)
    }
    setByCSPRNG() {
        const a = new Uint8Array(BLS_ID_SIZE)
        crypto.getRandomValues(a)
        this.setLittleEndian(a)
    }
}
export const deserializeHexStrToId = s => {
    const r = new Id()
    r.deserializeHexStr(s)
    return r
}

export const SecretKey = class extends Common {
    constructor() {
        super(BLS_SECRETKEY_SIZE)
    }
    setInt(x) {
        this._setter(mod._blsIdSetInt, x) // same as Id
    }
    isZero() {
        return this._getter(mod._blsSecretKeyIsZero) === 1
    }
    isEqual(rhs) {
        return this._isEqual(mod._blsSecretKeyIsEqual, rhs)
    }
    deserialize(s) {
        this._setter(blsSecretKeyDeserialize, s)
    }
    serialize() {
        return this._getter(blsSecretKeySerialize)
    }
    add(rhs) {
        this._update(mod._blsSecretKeyAdd, rhs)
    }
    share(msk, id) {
        callShare(mod._blsSecretKeyShare, this, BLS_SECRETKEY_SIZE, msk, id)
    }
    recover(secVec, idVec) {
        callRecover(mod._blsSecretKeyRecover, this, BLS_SECRETKEY_SIZE, secVec, idVec)
    }
    setHashOf(s) {
        this._setter(blsHashToSecretKey, s)
    }
    setLittleEndian(s) {
        this._setter(blsSecretKeySetLittleEndian, s)
    }
    setLittleEndianMod(s) {
        this._setter(blsSecretKeySetLittleEndianMod, s)
    }
    setByCSPRNG() {
        const a = new Uint8Array(BLS_SECRETKEY_SIZE)
        crypto.getRandomValues(a)
        this.setLittleEndian(a)
    }
    getPublicKey() {
        const pub = new PublicKey()
        const secPos = this._allocAndCopy()
        const pubPos = pub._alloc()
        mod._blsGetPublicKey(pubPos, secPos)
        pub._saveAndFree(pubPos)
        _free(secPos)
        return pub
    }
    /*
      input
      m : message (string or Uint8Array)
      return
      BlsSignature
    */
    sign(m) {
        const sig = new Signature()
        const secPos = this._allocAndCopy()
        const sigPos = sig._alloc()
        blsSign(sigPos, secPos, m)
        sig._saveAndFree(sigPos)
        _free(secPos)
        return sig
    }
}
export const deserializeHexStrToSecretKey = s => {
    const r = new SecretKey()
    r.deserializeHexStr(s)
    return r
}

export const PublicKey = class extends Common {
    constructor() {
        super(BLS_PUBLICKEY_SIZE)
    }
    isZero() {
        return this._getter(mod._blsPublicKeyIsZero) === 1
    }
    isEqual(rhs) {
        return this._isEqual(mod._blsPublicKeyIsEqual, rhs)
    }
    deserialize(s) {
        this._setter(blsPublicKeyDeserialize, s)
    }
    serialize() {
        return this._getter(blsPublicKeySerialize)
    }
    deserializeUncompressed(s) {
        this._setter(blsPublicKeyDeserializeUncompressed, s)
    }
    serializeUncompressed() {
        return this._getter(blsPublicKeySerializeUncompressed)
    }
    add(rhs) {
        this._update(mod._blsPublicKeyAdd, rhs)
    }
    share(msk, id) {
        callShare(mod._blsPublicKeyShare, this, BLS_PUBLICKEY_SIZE, msk, id)
    }
    recover(secVec, idVec) {
        callRecover(mod._blsPublicKeyRecover, this, BLS_PUBLICKEY_SIZE, secVec, idVec)
    }
    isValidOrder() {
        return this._getter(mod._blsPublicKeyIsValidOrder)
    }
    verify(sig, m) {
        const pubPos = this._allocAndCopy()
        const sigPos = sig._allocAndCopy()
        const r = blsVerify(sigPos, pubPos, m)
        _free(sigPos)
        _free(pubPos)
        return r != 0
    }
    multiAggregate(pubVec) {
        const n = pubVec.length
        const aggPubPos = this._allocAndCopy()
        const pubVecPos = _malloc(BLS_PUBLICKEY_SIZE * n)
        for (let i = 0; i < n; i++) {
            mod.HEAP32.set(pubVec[i].a_, (pubVecPos + BLS_PUBLICKEY_SIZE * i) / 4)
        }
        const r = mod._blsMultiAggregatePublicKey(aggPubPos, pubVecPos, n)
        _free(pubVecPos)
        this._saveAndFree(aggPubPos)
        return r == 1
    }
}
export const deserializeHexStrToPublicKey = s => {
    const r = new PublicKey()
    r.deserializeHexStr(s)
    return r
}

export const Signature = class extends Common {
    constructor() {
        super(BLS_SIGNATURE_SIZE)
    }
    isZero() {
        return this._getter(mod._blsSignatureIsZero) === 1
    }
    isEqual(rhs) {
        return this._isEqual(mod._blsSignatureIsEqual, rhs)
    }
    deserialize(s) {
        this._setter(blsSignatureDeserialize, s)
    }
    serialize() {
        return this._getter(blsSignatureSerialize)
    }
    deserializeUncompressed(s) {
        this._setter(blsSignatureDeserializeUncompressed, s)
    }
    serializeUncompressed() {
        return this._getter(blsSignatureSerializeUncompressed)
    }
    add(rhs) {
        this._update(mod._blsSignatureAdd, rhs)
    }
    recover(secVec, idVec) {
        callRecover(mod._blsSignatureRecover, this, BLS_SIGNATURE_SIZE, secVec, idVec)
    }
    isValidOrder() {
        return this._getter(mod._blsSignatureIsValidOrder)
    }
    // this = aggSig
    aggregate(sigVec) {
        const n = sigVec.length
        const aggSigPos = this._allocAndCopy()
        const sigVecPos = _malloc(BLS_SIGNATURE_SIZE * n)
        for (let i = 0; i < n; i++) {
            mod.HEAP32.set(sigVec[i].a_, (sigVecPos + BLS_SIGNATURE_SIZE * i) / 4)
        }
        const r = mod._blsAggregateSignature(aggSigPos, sigVecPos, n)
        _free(sigVecPos)
        this._saveAndFree(aggSigPos)
        return r == 1
    }
    // this = aggSig
    fastAggregateVerify(pubVec, msg) {
        const n = pubVec.length
        const msgSize = msg.length
        const aggSigPos = this._allocAndCopy()
        const pubVecPos = _malloc(BLS_PUBLICKEY_SIZE * n)
        const msgPos = _malloc(msgSize)
        for (let i = 0; i < n; i++) {
            mod.HEAP32.set(pubVec[i].a_, (pubVecPos + BLS_PUBLICKEY_SIZE * i) / 4)
        }
        mod.HEAP8.set(msg, msgPos)
        const r = mod._blsFastAggregateVerify(aggSigPos, pubVecPos, n, msgPos, msgSize)
        _free(msgPos)
        _free(pubVecPos)
        _free(aggSigPos)
        return r == 1
    }
    // this = aggSig
    // msgVec = (32 * pubVec.length)-size Uint8Array
    aggregateVerifyNoCheck(pubVec, msgVec) {
        const n = pubVec.length
        const msgSize = 32
        if (n == 0 || msgVec.length != msgSize * n) {
            return false
        }
        const aggSigPos = this._allocAndCopy()
        const pubVecPos = _malloc(BLS_PUBLICKEY_SIZE * n)
        const msgPos = _malloc(msgVec.length)
        for (let i = 0; i < n; i++) {
            mod.HEAP32.set(pubVec[i].a_, (pubVecPos + BLS_PUBLICKEY_SIZE * i) / 4)
        }
        mod.HEAP8.set(msgVec, msgPos)
        const r = mod._blsAggregateVerifyNoCheck(aggSigPos, pubVecPos, msgPos, msgSize, n)
        _free(msgPos)
        _free(pubVecPos)
        _free(aggSigPos)
        return r == 1
    }
    multiAggregate(sigVec, pubVec) {
        const n = sigVec.length
        if (n === 0 || pubVec.length !== n) {
            return false;
        }
        const aggSigPos = this._allocAndCopy()
        const sigVecPos = _malloc(BLS_SIGNATURE_SIZE * n)
        const pubVecPos = _malloc(BLS_PUBLICKEY_SIZE * n)
        for (let i = 0; i < n; i++) {
            mod.HEAP32.set(sigVec[i].a_, (sigVecPos + BLS_SIGNATURE_SIZE * i) / 4)
            mod.HEAP32.set(pubVec[i].a_, (pubVecPos + BLS_PUBLICKEY_SIZE * i) / 4)
        }
        const r = mod._blsMultiAggregateSignature(aggSigPos, sigVecPos, pubVecPos, n)
        _free(sigVecPos)
        _free(pubVecPos)
        this._saveAndFree(aggSigPos)
        return r == 1
    }
}
export const deserializeHexStrToSignature = s => {
    const r = new Signature()
    r.deserializeHexStr(s)
    return r
}
// 1 (draft-05) 2 (draft-06) 3 (draft-07)
export const setETHmode = (mode) => {
    if (mod._blsSetETHmode(mode) != 0) throw new Error(`bad setETHmode ${mode}`)
}
// make setter check the correctness of the order if doVerify
export const verifySignatureOrder = (doVerify) => {
    mod._blsSignatureVerifyOrder(doVerify)
}
// make setter check the correctness of the order if doVerify
export const verifyPublicKeyOrder = (doVerify) => {
    mod._blsPublicKeyVerifyOrder(doVerify)
}
export const areAllMsgDifferent = (msgs, msgSize) => {
    const n = msgs.length / msgSize
    if (msgs.length != n * msgSize) return false
    const h = {}
    for (let i = 0; i < n; i++) {
        const m = msgs.subarray(i * msgSize, (i + 1) * msgSize)
        if (m in h) return false
        h[m] = true
    }
    return true
}
/*
  return true if all pub[i].verify(sigs[i], msgs[i])
  msgs is a concatenation of arrays of 32-byte Uint8Array
*/
export const multiVerify = (pubs, sigs, msgs) => {
    const MSG_SIZE = 32
    const RAND_SIZE = 8 // 64-bit rand
    const threadNum = 0 // not used
    const n = sigs.length
    if (pubs.length != n || msgs.length != n) return false
    for (let i = 0; i < n; i++) {
        if (msgs[i].length != MSG_SIZE) return false
    }
    const sigPos = _malloc(BLS_SIGNATURE_SIZE * n)
    const pubPos = _malloc(BLS_PUBLICKEY_SIZE * n)
    const msgPos = _malloc(MSG_SIZE * n)
    const randPos = _malloc(RAND_SIZE * n)

    // getRandomValues accepts only Uint8Array
    const rai = mod.HEAP8.subarray(randPos, randPos + RAND_SIZE * n)
    const rau = new Uint8Array(rai.buffer, randPos, rai.length)
    crypto.getRandomValues(rau)
    for (let i = 0; i < n; i++) {
        mod.HEAP32.set(sigs[i].a_, (sigPos + BLS_SIGNATURE_SIZE * i) / 4)
        mod.HEAP32.set(pubs[i].a_, (pubPos + BLS_PUBLICKEY_SIZE * i) / 4)
        mod.HEAP8.set(msgs[i], msgPos + MSG_SIZE * i)
    }
    const r = mod._blsMultiVerify(sigPos, pubPos, msgPos, MSG_SIZE, randPos, RAND_SIZE, n, threadNum)

    _free(randPos)
    _free(msgPos)
    _free(pubPos)
    _free(sigPos)
    return r == 1
}


// export const init = (curveType = BLS12_381) => {
//     const r = mod._mclBn_init(curveType, MCLBN_COMPILED_TIME_VAR)
//     if (r) throw new Error('_mclBn_init err ' + r);
// }

// change curveType
export const init = (curveType = ethMode ? BLS12_381 : BN254) => {
    const r = mod._blsInit(curveType, MCLBN_COMPILED_TIME_VAR)
    if (r) throw ('blsInit err ' + r)
}

init(BLS12_381);

if (ethMode) {
    setETHmode(ETH_MODE_DRAFT_07)
}
