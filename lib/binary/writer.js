'use strict';

let assert = require('assert');
let VarInt = require('./varInt')
let BN = require('bn.js');

const maxInt = Math.pow(2, 32)-1;


let BufferWriter = function BufferWriter(obj) {
  if (!(this instanceof BufferWriter))
    return new BufferWriter(obj);
  this.bufLen = 0;
  if (obj)
    this.set(obj);
  else
    this.bufs = [];
};

BufferWriter.prototype.set = function(obj) {
  this.bufs = obj.bufs || this.bufs || [];
  this.bufLen = this.bufs.reduce(function(prev, buf){ return prev + buf.length; }, 0);
  return this;
};

BufferWriter.prototype.toBuffer = function() {
  return this.concat();
};

BufferWriter.prototype.concat = function() {
  return Buffer.concat(this.bufs, this.bufLen);
};

BufferWriter.prototype.write = function(buf) {
  if(typeof (buf) ==='string'){
    const newBuf = new Buffer(buf,'hex')
    this.bufs.push(newBuf);
    this.bufLen += newBuf.length;
  }else if(Buffer.isBuffer(buf)){
    this.bufs.push(buf);
    this.bufLen += buf.length;
  }else{
    const keyValues = Object.values(buf)
    for (let bufs of keyValues) {
      if(Buffer.isBuffer(bufs)){
        this.bufs.push(bufs);
        this.bufLen += bufs.length;
      }else if(typeof bufs == 'string'){
        this.write(new Buffer(bufs,'hex'))
      }else if(BN.isBN(bufs)){
        this.writeVarint63(bufs)
      }else if(typeof bufs == 'number'){
        this.writeVarint63(bufs)
      }
    }
  }
  return this;
};

BufferWriter.prototype.writeReverse = function(buf) {
  if(Buffer.isBuffer(buf)){
    let ret = new Buffer(buf.length);
    for (let i = 0; i < buf.length; i++) {
      ret[i] = buf[buf.length - i - 1];
    }
    this.bufs.push(ret);
    return this;
  }
};

BufferWriter.prototype.writeUInt8 = function(n) {
  let buf = Buffer.alloc(1);
  buf.writeUInt8(n, 0);
  this.write(buf);
  return this;
};

BufferWriter.prototype.writeUInt16BE = function(n) {
  let buf = Buffer.alloc(2);
  buf.writeUInt16BE(n, 0);
  this.write(buf);
  return this;
};

BufferWriter.prototype.writeUInt16LE = function(n) {
  let buf = Buffer.alloc(2);
  buf.writeUInt16LE(n, 0);
  this.write(buf);
  return this;
};

BufferWriter.prototype.writeUInt32BE = function(n) {
  let buf = Buffer.alloc(4);
  buf.writeUInt32BE(n, 0);
  this.write(buf);
  return this;
};

BufferWriter.prototype.writeInt32LE = function(n) {
  let buf = Buffer.alloc(4);
  buf.writeInt32LE(n, 0);
  this.write(buf);
  return this;
};

BufferWriter.prototype.writeUInt32LE = function(n) {
  let buf = Buffer.alloc(4);
  buf.writeUInt32LE(n, 0);
  this.write(buf);
  return this;
};

BufferWriter.prototype.writeUInt64BEBN = function(bn) {
  let buf
  if(bn.toBuffer){
    buf = bn.toBuffer('be',8);
  }else{
    buf = bn.toArrayLike(Buffer, 'be', 8)
  }

  this.write(buf);
  return this;
};

BufferWriter.prototype.writeUInt64LEBN = function(bn) {
  let buf
  if(bn.toBuffer){
    buf = bn.toBuffer('le',8);
  }else{
    buf = bn.toArrayLike(Buffer, 'le', 8)
  }
  this.write(buf);
  return this;
};

BufferWriter.prototype.writeVarintNum = function(n) {
  let buf = BufferWriter.varintBufNum(n);
  this.write(buf);
  return this;
};

BufferWriter.prototype.writeVarintBN = function(bn) {
  let buf = BufferWriter.varintBufBN(bn);
  this.write(buf);
  return this;
};

BufferWriter.prototype.writeVarint31 = function(v){
  const val = v
  if(val > maxInt|| val <0){
    throw new Error("value out of range");
  }
  let buffer = new Buffer(5)

  const n = VarInt.putUVarInt(buffer, val);
  const b = buffer.slice(0, n);
  this.write(b)
  return n;
}

BufferWriter.prototype.writeVarint63 = function(v){
  const val = BN.isBN(v)? v.clone():v
  if(val <0){
    throw new Error("value out of range");
  }
  // let buffer = new Buffer(9)
  let buffer = new Buffer(9)

  const n = VarInt.putUVarInt(buffer, val);
  const b = buffer.slice(0, n);
  this.write(b)
  return n;
}

BufferWriter.prototype.writeVarstr31 = function(s){
  const str = s
  let length = 0;
  if (str != null) {
    length = str.length;
  }
  let n = this.writeVarint31(length)
  let n2 = this.write(str)

  return n + n2
}

BufferWriter.prototype.writeVarstrList = function(l) {
  let n = this.writeVarint31(l.length)

  for(const s of l){
    const n2 = this.writeVarstr31(s)
    n += n2
  }
  return n
}

BufferWriter.prototype.writeExtensibleString = function(suffix,br) {
  const buf = br.bufs? Buffer.concat(br.bufs, br.bufLen) :new Buffer(1024)

  if (suffix && suffix.length > 0 ){
    buf.Write(suffix)
  }

  return this.writeVarstr31(buf)
}

BufferWriter.varintBufNum = function(n) {
  let buf = undefined;
  if (n < 253) {
    buf = Buffer.alloc(1);
    buf.writeUInt8(n, 0);
  } else if (n < 0x10000) {
    buf = Buffer.alloc(1 + 2);
    buf.writeUInt8(253, 0);
    buf.writeUInt16LE(n, 1);
  } else if (n < 0x100000000) {
    buf = Buffer.alloc(1 + 4);
    buf.writeUInt8(254, 0);
    buf.writeUInt32LE(n, 1);
  } else {
    buf = Buffer.alloc(1 + 8);
    buf.writeUInt8(255, 0);
    buf.writeInt32LE(n & -1, 1);
    buf.writeUInt32LE(Math.floor(n / 0x100000000), 5);
  }
  return buf;
};

BufferWriter.varintBufBN = function(bn) {
  let buf = undefined;
  let n = bn.toNumber();
  if (n < 253) {
    buf = Buffer.alloc(1);
    buf.writeUInt8(n, 0);
  } else if (n < 0x10000) {
    buf = Buffer.alloc(1 + 2);
    buf.writeUInt8(253, 0);
    buf.writeUInt16LE(n, 1);
  } else if (n < 0x100000000) {
    buf = Buffer.alloc(1 + 4);
    buf.writeUInt8(254, 0);
    buf.writeUInt32LE(n, 1);
  } else {
    let bw = new BufferWriter();
    bw.writeUInt8(255);
    bw.writeUInt64LEBN(bn);
    let buf = bw.concat();
  }
  return buf;
};

BufferWriter.varintBN = function(bn) {
  let n = bn
  if (n >= 0x100000000)  {
    n = new BN(bn)
  }
  return n;
};

module.exports = BufferWriter;