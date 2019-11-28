let VarInt = require('./binary/varInt')

const maxInt = Math.pow(2, 32)-1;


function readVarint31(buf){
  const val = VarInt.readUVarInt(buf)
  if(val > maxInt|| val <0){
    throw new Error("value out of range");
  }
  return val
}

function  readVarint63(buf){
  const val = VarInt.readUVarInt(buf)
  if(val <0){
    throw new Error("value out of range");
  }
  return val
}

function readVarstr31(buf){
  const n =  this.readVarint31(buf)
  if (n > 0 && n > buf.length()) {
    throw new Error("cannot readFull full val");
  }

  const str = buf.subarray(0, n)
  buf = buf.subarray(n, buf.length()-1)

  return str
}

function readVarstrList(buf){
  const nelts = this.readVarint31(buf)
  let result = []
  for (let i = nelts; i > 0; i--) {
    const s = this.readVarstr31(buf)
    result = result.concat(s)
  }
  if (result.length < nelts) {
    throw new Error("value out of range");
  }
  return result
}

function readExtensibleString(buf)  {
  const s = this.readVarstr31(buf)

  const buffer = new Buffer(s)
  return buffer
}

  //Todo:writer

function writeVarint31(val){
  if(val > maxInt|| val <0){
    throw new Error("value out of range");
  }
  let buffer = new Buffer(5)

  const n = VarInt.putUVarInt(buffer, val);
  const b = buffer.slice(0, n);
  return b;
}

function writeVarint63(val){
  if(val <0){
    throw new Error("value out of range");
  }
  let buffer = new Buffer(9)

  const n = VarInt.putUVarInt(buffer, val);
  const b = buffer.slice(0, n);
  return b;
}

function writeVarstr31(str){
  let length = 0;
  if (str != null) {
    length = str.length;
  }
  let n = this.writeVarint31(length)
  return n + length
}

function writeVarstrList(l) {
  let n = this.writeVarint31(l.length)

  for(let s in l){
    const n2 = this.writeVarstr31(s)
    n += n2
  }
  return n
}

function writeExtensibleString( suffix) {
  const buf = new Buffer()
  if (suffix.length > 0 ){
    buf.Write(suffix)
  }
  // return this.writeVarstr31(buf.buffer())
  return this.writeVarstr31(buf.toString('hex'))
}

module.exports = {
  readVarint31,
  readVarint63,
  readVarstr31,
  readVarstrList,
  readExtensibleString,
  writeVarint31,
  writeVarint63,
  writeVarstr31,
  writeVarstrList,
  writeExtensibleString
}