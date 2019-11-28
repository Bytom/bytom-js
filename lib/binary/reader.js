'use strict';

let _ = require('lodash');
let VarInt = require('./varInt')
const maxInt = Math.pow(2, 32)-1;
const maxUv64Int = Math.pow(2, 64)-1;

let BN = require('bn.js');


let BufferReader = function BufferReader(buf) {
  if (!(this instanceof BufferReader)) {
    return new BufferReader(buf);
  }
  if (_.isUndefined(buf)) {
    return;
  }
  if (Buffer.isBuffer(buf)) {
    this.set({
      buf: buf
    });
  } else if (_.isString(buf)) {
    this.set({
      buf: Buffer.from(buf, 'hex'),
    });
  } else if (_.isObject(buf)) {
    let obj = buf;
    this.set(obj);
  } else {
    throw new TypeError('Unrecognized argument for BufferReader');
  }
};

BufferReader.prototype.set = function(obj) {
  this.buf = obj.buf || this.buf || undefined;
  this.pos = obj.pos || this.pos || 0;
  return this;
};

BufferReader.prototype.eof = function() {
  return this.pos >= this.buf.length;
};

BufferReader.prototype.finished = BufferReader.prototype.eof;

BufferReader.prototype.read = function(len) {
  if(_.isUndefined(len)){ throw Error('Must specify a length')};
  let buf = this.buf.slice(this.pos, this.pos + len);
  this.pos = this.pos + len;
  return buf;
};

BufferReader.prototype.readAll = function() {
  let buf = this.buf.slice(this.pos, this.buf.length);
  this.pos = this.buf.length;
  return buf;
};

BufferReader.prototype.readUInt8 = function() {
  let val = this.buf.readUInt8(this.pos);
  this.pos = this.pos + 1;
  return val;
};

BufferReader.prototype.readUInt16BE = function() {
  let val = this.buf.readUInt16BE(this.pos);
  this.pos = this.pos + 2;
  return val;
};

BufferReader.prototype.readUInt16LE = function() {
  let val = this.buf.readUInt16LE(this.pos);
  this.pos = this.pos + 2;
  return val;
};

BufferReader.prototype.readUInt32BE = function() {
  let val = this.buf.readUInt32BE(this.pos);
  this.pos = this.pos + 4;
  return val;
};

BufferReader.prototype.readUInt32LE = function() {
  let val = this.buf.readUInt32LE(this.pos);
  this.pos = this.pos + 4;
  return val;
};

BufferReader.prototype.readInt32LE = function() {
  let val = this.buf.readInt32LE(this.pos);
  this.pos = this.pos + 4;
  return val;
};

BufferReader.prototype.readUInt64BEBN = function() {
  let buf = this.buf.slice(this.pos, this.pos + 8);
  let hex = buf.toString('hex');
  let bn = new BN(hex, 16);
  this.pos = this.pos + 8;
  return bn;
};

BufferReader.prototype.readUInt64LEBN = function() {
  let second = this.buf.readUInt32LE(this.pos);
  let first = this.buf.readUInt32LE(this.pos + 4);
  let combined = (first * 0x100000000) + second;
  // Instantiating an instance of BN with a number is faster than with an
  // array or string. However, the maximum safe number for a double precision
  // floating point is 2 ^ 52 - 1 (0x1fffffffffffff), thus we can safely use
  // non-floating point numbers less than this amount (52 bits). And in the case
  // that the number is larger, we can instatiate an instance of BN by passing
  // an array from the buffer (slower) and specifying the endianness.
  let bn;
  if (combined <= 0x1fffffffffffff) {
    bn = new BN(combined);
  } else {
    let data = Array.prototype.slice.call(this.buf, this.pos, this.pos + 8);
    bn = new BN(data, 10, 'le');
  }
  this.pos = this.pos + 8;
  return bn;
};

BufferReader.prototype.readVarintNum = function() {
  let first = this.readUInt8();
  switch (first) {
    case 0xFD:
      return this.readUInt16LE();
    case 0xFE:
      return this.readUInt32LE();
    case 0xFF:
      let bn = this.readUInt64LEBN();
      let n = bn.toNumber();
      if (n <= Math.pow(2, 53)) {
        return n;
      } else {
        throw new Error('number too large to retain precision - use readVarintBN');
      }
      break;
    default:
      return first;
  }
};

/**
 * reads a length prepended buffer
 */
BufferReader.prototype.readVarLengthBuffer = function() {
  let len = this.readVarintNum();
  let buf = this.read(len);
  $.checkState(buf.length === len, 'Invalid length while reading varlength buffer. ' +
    'Expected to read: ' + len + ' and read ' + buf.length);
  return buf;
};

BufferReader.prototype.readVarintBuf = function() {
  let first = this.buf.readUInt8(this.pos);
  switch (first) {
    case 0xFD:
      return this.read(1 + 2);
    case 0xFE:
      return this.read(1 + 4);
    case 0xFF:
      return this.read(1 + 8);
    default:
      return this.read(1);
  }
};

BufferReader.prototype.readVarintBN = function() {
  let first = this.readUInt8();
  switch (first) {
    case 0xFD:
      return new BN(this.readUInt16LE());
    case 0xFE:
      return new BN(this.readUInt32LE());
    case 0xFF:
      return this.readUInt64LEBN();
    default:
      return new BN(first);
  }
};

BufferReader.prototype.readUVarintBN = function() {
  let first = this.readUInt8();
  switch (first) {
    case 0xFD:
      return new BN(this.readUInt16BE());
    case 0xFE:
      return new BN(this.readUInt32BE());
    case 0xFF:
      return this.readUInt64BEBN();
    default:
      return new BN(first);
  }
};

BufferReader.prototype.reverse = function() {
  let buf = Buffer.alloc(this.buf.length);
  for (let i = 0; i < buf.length; i++) {
    buf[i] = this.buf[this.buf.length - 1 - i];
  }
  this.buf = buf;
  return this;
};

BufferReader.prototype.readReverse = function(len) {
  if (_.isUndefined(len)) {
    len = this.buf.length;
  }
  let buf = this.buf.slice(this.pos, this.pos + len);
  this.pos = this.pos + len;
  return BufferUtil.reverse(buf);
};


BufferReader.prototype.readVarint31 = function(){
  const val = this.readUVarInt()
  if(val > maxInt|| val <0){
    throw new Error("value out of range");
  }
  return Number(val)
}

BufferReader.prototype.readVarint63 = function(){
  const val = this.readUVarInt()
  if(val <0){
    throw new Error("value out of range");
  }
  return val
}

BufferReader.prototype.readVarstr31 = function(){
  const n =  this.readVarint31()
  if (n > 0 && n > this.buf.length) {
    throw new Error("cannot readFull full val");
  }
  const str = this.read(n)
  return str
}

BufferReader.prototype.readVarstrList = function(){
  const nelts = this.readVarint31()
  let result = []
  for (let i = nelts; i > 0; i--) {
    const s = this.readVarstr31(this.buf)
    result = result.concat(s)
  }
  if (result.length < nelts) {
    throw new Error("value out of range");
  }
  this.pos = this.pos + nelts;
  return result
}

BufferReader.prototype.readExtensibleString = function(f){
  const s = this.readVarstr31()

  const buffer = new Buffer(s)
  const sr = new BufferReader(buffer)

  return f(sr)
}

BufferReader.prototype.readUVarInt = function() {
  const length = this.buf.length;
  let x = new BN (0);
  let shift = 0;
  for(let i = this.pos; i < length; i++) {
    const b =this.buf[i];
    if (b < 0x80 ) {
      const n = i - this.pos;
      this.pos = i+1;
      if (n > maxInt || n === maxInt && b > 1 ) {
        throw new RangeError('Overflow error decoding varint');
      }
      return (x.or(new BN(b).ushln(shift))).ushrn(0).toString()
    }
    x = new BN( x.or((new BN((b & 0x7f),16)).iushln(shift)));
    shift += 7;
  }
  this.pos =length;
  return x.toString()
};


module.exports = BufferReader;