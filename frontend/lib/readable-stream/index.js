exports = module.exports = require('./_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./_stream_writable.js');
exports.Duplex = require('./_stream_duplex.js');
exports.Transform = require('./_stream_transform.js');
exports.PassThrough = require('./_stream_passthrough.js');
exports.finished = require('./internal/streams/end-of-stream.js');
exports.pipeline = require('./internal/streams/pipeline.js');
