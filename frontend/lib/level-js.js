'use strict'

module.exports = Level

const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
const inherits = require('inherits')
const AbstractIterator = require('abstract-leveldown').AbstractIterator
const noop = function () { }
const Buffer = require('buffer').Buffer
const str2bin = (function () {
    const encoder = new TextEncoder('utf-8')
    return encoder.encode.bind(encoder)
})()

const serialize = function (data, asBuffer) {
    if (asBuffer) {
        return Buffer.isBuffer(data) ? data : str2bin(String(data))
    } else {
        return String(data)
    }
}
const ta2str = (function () {
    const decoder = new TextDecoder('utf-8')
    return decoder.decode.bind(decoder)
})()

const ab2str = (function () {
    const decoder = new TextDecoder('utf-8')
    return decoder.decode.bind(decoder)
})()

function ta2buf(ta) {
    const buf = Buffer.from(ta.buffer)

    if (ta.byteLength === ta.buffer.byteLength) {
        return buf
    } else {
        return buf.slice(ta.byteOffset, ta.byteOffset + ta.byteLength)
    }
}

const deserialize = function (data, asBuffer) {
    if (data instanceof Uint8Array) {
        return asBuffer ? ta2buf(data) : ta2str(data)
    } else if (data instanceof ArrayBuffer) {
        return asBuffer ? Buffer.from(data) : ab2str(data)
    } else {
        return asBuffer ? Buffer.from(String(data)) : String(data)
    }
}

function test(key) {
    return function test(impl) {
        try {
            impl.cmp(key, 0)
            return true
        } catch (err) {
            return false
        }
    }
}

// Detect binary key support (IndexedDB Second Edition)
const support = {
    bufferKeys: test(Buffer.alloc(0))
}

const ltgt = require('ltgt')
const NONE = Symbol('none')

function clear(db, location, keyRange, options, callback) {
    if (options.limit === 0) return db._nextTick(callback)

    const transaction = db.db.transaction([location], 'readwrite')
    const store = transaction.objectStore(location)
    let count = 0

    transaction.oncomplete = function () {
        callback()
    }

    transaction.onabort = function () {
        callback(transaction.error || new Error('aborted by user'))
    }

    // A key cursor is faster (skips reading values) but not supported by IE
    const method = store.openKeyCursor ? 'openKeyCursor' : 'openCursor'
    const direction = options.reverse ? 'prev' : 'next'

    store[method](keyRange, direction).onsuccess = function (ev) {
        const cursor = ev.target.result

        if (cursor) {
            // Wait for a request to complete before continuing, saving CPU.
            store.delete(cursor.key).onsuccess = function () {
                if (options.limit <= 0 || ++count < options.limit) {
                    cursor.continue()
                }
            }
        }
    }
}

function createKeyRange(options) {
    const lower = ltgt.lowerBound(options, NONE)
    const upper = ltgt.upperBound(options, NONE)
    const lowerOpen = ltgt.lowerBoundExclusive(options, NONE)
    const upperOpen = ltgt.upperBoundExclusive(options, NONE)

    if (lower !== NONE && upper !== NONE) {
        return IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen)
    } else if (lower !== NONE) {
        return IDBKeyRange.lowerBound(lower, lowerOpen)
    } else if (upper !== NONE) {
        return IDBKeyRange.upperBound(upper, upperOpen)
    } else {
        return null
    }
}

function Iterator(db, location, options) {
    AbstractIterator.call(this, db)

    this._limit = options.limit
    this._count = 0
    this._callback = null
    this._cache = []
    this._completed = false
    this._aborted = false
    this._error = null
    this._transaction = null

    this._keys = options.keys
    this._values = options.values
    this._keyAsBuffer = options.keyAsBuffer
    this._valueAsBuffer = options.valueAsBuffer

    if (this._limit === 0) {
        this._completed = true
        return
    }

    let keyRange

    try {
        keyRange = createKeyRange(options)
    } catch (e) {
        // The lower key is greater than the upper key.
        // IndexedDB throws an error, but we'll just return 0 results.
        this._completed = true
        return
    }

    this.createIterator(location, keyRange, options.reverse)
}

inherits(Iterator, AbstractIterator)

Iterator.prototype.createIterator = function (location, keyRange, reverse) {
    const transaction = this.db.db.transaction([location], 'readonly')
    const store = transaction.objectStore(location)
    const req = store.openCursor(keyRange, reverse ? 'prev' : 'next')

    req.onsuccess = (ev) => {
        const cursor = ev.target.result
        if (cursor) this.onItem(cursor)
    }

    this._transaction = transaction

    // If an error occurs (on the request), the transaction will abort.
    transaction.onabort = () => {
        this.onAbort(this._transaction.error || new Error('aborted by user'))
    }

    transaction.oncomplete = () => {
        this.onComplete()
    }
}

Iterator.prototype.onItem = function (cursor) {
    this._cache.push(cursor.key, cursor.value)

    if (this._limit <= 0 || ++this._count < this._limit) {
        cursor.continue()
    }

    this.maybeNext()
}

Iterator.prototype.onAbort = function (err) {
    this._aborted = true
    this._error = err
    this.maybeNext()
}

Iterator.prototype.onComplete = function () {
    this._completed = true
    this.maybeNext()
}

Iterator.prototype.maybeNext = function () {
    if (this._callback) {
        this._next(this._callback)
        this._callback = null
    }
}

Iterator.prototype._next = function (callback) {
    if (this._aborted) {
        // The error should be picked up by either next() or end().
        const err = this._error
        this._error = null
        this._nextTick(callback, err)
    } else if (this._cache.length > 0) {
        let key = this._cache.shift()
        let value = this._cache.shift()

        if (this._keys && key !== undefined) {
            key = this._deserializeKey(key, this._keyAsBuffer)
        } else {
            key = undefined
        }

        if (this._values && value !== undefined) {
            value = this._deserializeValue(value, this._valueAsBuffer)
        } else {
            value = undefined
        }

        this._nextTick(callback, null, key, value)
    } else if (this._completed) {
        this._nextTick(callback)
    } else {
        this._callback = callback
    }
}

// Exposed for the v4 to v5 upgrade utility
Iterator.prototype._deserializeKey = deserialize
Iterator.prototype._deserializeValue = deserialize

Iterator.prototype._end = function (callback) {
    if (this._aborted || this._completed) {
        return this._nextTick(callback, this._error)
    }

    // Don't advance the cursor anymore, and the transaction will complete
    // on its own in the next tick. This approach is much cleaner than calling
    // transaction.abort() with its unpredictable event order.
    this.onItem = noop
    this.onAbort = callback
    this.onComplete = callback
}

const DEFAULT_PREFIX = 'level-js-'

function Level(location, opts) {
    if (!(this instanceof Level)) return new Level(location, opts)

    AbstractLevelDOWN.call(this, {
        bufferKeys: support.bufferKeys(indexedDB),
        snapshots: true,
        permanence: true,
        clear: true
    })

    opts = opts || {}

    if (typeof location !== 'string') {
        throw new Error('constructor requires a location string argument')
    }

    this.location = location
    this.prefix = opts.prefix == null ? DEFAULT_PREFIX : opts.prefix
    this.version = parseInt(opts.version || 1, 10)
}

inherits(Level, AbstractLevelDOWN)

Level.prototype.type = 'level-js'

Level.prototype._open = function (options, callback) {
    const req = indexedDB.open(this.prefix + this.location, this.version)

    req.onerror = function () {
        callback(req.error || new Error('unknown error'))
    }

    req.onsuccess = () => {
        this.db = req.result
        callback()
    }

    req.onupgradeneeded = (ev) => {
        const db = ev.target.result

        if (!db.objectStoreNames.contains(this.location)) {
            db.createObjectStore(this.location)
        }
    }
}

Level.prototype.store = function (mode) {
    const transaction = this.db.transaction([this.location], mode)
    return transaction.objectStore(this.location)
}

Level.prototype.await = function (request, callback) {
    const transaction = request.transaction

    // Take advantage of the fact that a non-canceled request error aborts
    // the transaction. I.e. no need to listen for "request.onerror".
    transaction.onabort = function () {
        callback(transaction.error || new Error('aborted by user'))
    }

    transaction.oncomplete = function () {
        callback(null, request.result)
    }
}

Level.prototype._get = function (key, options, callback) {
    const store = this.store('readonly')
    let req

    try {
        req = store.get(key)
    } catch (err) {
        return this._nextTick(callback, err)
    }

    this.await(req, function (err, value) {
        if (err) return callback(err)

        if (value === undefined) {
            // 'NotFound' error, consistent with LevelDOWN API
            return callback(new Error('NotFound'))
        }

        callback(null, deserialize(value, options.asBuffer))
    })
}

Level.prototype._del = function (key, options, callback) {
    const store = this.store('readwrite')
    let req

    try {
        req = store.delete(key)
    } catch (err) {
        return this._nextTick(callback, err)
    }

    this.await(req, callback)
}

Level.prototype._put = function (key, value, options, callback) {
    const store = this.store('readwrite')
    let req

    try {
        // Will throw a DataError or DataCloneError if the environment
        // does not support serializing the key or value respectively.
        req = store.put(value, key)
    } catch (err) {
        return this._nextTick(callback, err)
    }

    this.await(req, callback)
}

Level.prototype._serializeKey = function (key) {
    return serialize(key, this.supports.bufferKeys)
}

Level.prototype._serializeValue = function (value) {
    return serialize(value, true)
}

Level.prototype._iterator = function (options) {
    return new Iterator(this, this.location, options)
}

Level.prototype._batch = function (operations, options, callback) {
    if (operations.length === 0) return this._nextTick(callback)

    const store = this.store('readwrite')
    const transaction = store.transaction
    let index = 0
    let error

    transaction.onabort = function () {
        callback(error || transaction.error || new Error('aborted by user'))
    }

    transaction.oncomplete = function () {
        callback()
    }

    // Wait for a request to complete before making the next, saving CPU.
    function loop() {
        const op = operations[index++]
        const key = op.key

        let req

        try {
            req = op.type === 'del' ? store.delete(key) : store.put(op.value, key)
        } catch (err) {
            error = err
            transaction.abort()
            return
        }

        if (index < operations.length) {
            req.onsuccess = loop
        }
    }

    loop()
}

Level.prototype._clear = function (options, callback) {
    let keyRange
    let req

    try {
        keyRange = createKeyRange(options)
    } catch (e) {
        // The lower key is greater than the upper key.
        // IndexedDB throws an error, but we'll just do nothing.
        return this._nextTick(callback)
    }

    if (options.limit >= 0) {
        // IDBObjectStore#delete(range) doesn't have such an option.
        // Fall back to cursor-based implementation.
        return clear(this, this.location, keyRange, options, callback)
    }

    try {
        const store = this.store('readwrite')
        req = keyRange ? store.delete(keyRange) : store.clear()
    } catch (err) {
        return this._nextTick(callback, err)
    }

    this.await(req, callback)
}

Level.prototype._close = function (callback) {
    this.db.close()
    this._nextTick(callback)
}

// NOTE: remove in a next major release
Level.prototype.upgrade = function (callback) {
    if (this.status !== 'open') {
        return this._nextTick(callback, new Error('cannot upgrade() before open()'))
    }

    const it = this.iterator()
    const batchOptions = {}
    const self = this

    it._deserializeKey = it._deserializeValue = identity
    next()

    function next(err) {
        if (err) return finish(err)
        it.next(each)
    }

    function each(err, key, value) {
        if (err || key === undefined) {
            return finish(err)
        }

        const newKey = self._serializeKey(deserialize(key, true))
        const newValue = self._serializeValue(deserialize(value, true))

        // To bypass serialization on the old key, use _batch() instead of batch().
        // NOTE: if we disable snapshotting (#86) this could lead to a loop of
        // inserting and then iterating those same entries, because the new keys
        // possibly sort after the old keys.
        self._batch([
            { type: 'del', key: key },
            { type: 'put', key: newKey, value: newValue }
        ], batchOptions, next)
    }

    function finish(err) {
        it.end(function (err2) {
            callback(err || err2)
        })
    }

    function identity(data) {
        return data
    }
}

Level.destroy = function (location, prefix, callback) {
    if (typeof prefix === 'function') {
        callback = prefix
        prefix = DEFAULT_PREFIX
    }
    const request = indexedDB.deleteDatabase(prefix + location)
    request.onsuccess = function () {
        callback()
    }
    request.onerror = function (err) {
        callback(err)
    }
}