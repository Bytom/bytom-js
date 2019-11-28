const BN = require('bn.js').BN
const maxVarintLen32 = 5;

function putUVarInt(buf, v) {
    const val = v
    if (buf == null) {
      throw new Error("buf cannot be null");
    }
    let i = 0;
    if(Number(val)  > Math.pow(2, 55)){
      let x = new BN(val)
      while (x.gte(new BN(0x80)) || x.lt(0)) {
        if (buf.length <= i) {
          throw new Error("buf size is too small");
        }
        buf[i] = (x.and(new BN(0xff))).or(new BN(0x80));
        x = new BN( x.iushrn(7));
        i++
      }
      if (buf.length <= i) {
        throw new Error("buf size is too small");
      }
      buf[i] = x; // 最后一个byte的数值在0到127之间
      return i + 1;
    }else{
      let x = Number(val)
      while (x >= 0x80 || x < 0) {
        if (buf.length <= i) {
          throw new Error("buf size is too small");
        }
        buf[i] = (x & 0xff) | 0x80;
        x = x >> 7;
        i++
      }
      if (buf.length <= i) {
        throw new Error("buf size is too small");
      }
      buf[i] = x; // 最后一个byte的数值在0到127之间
      return i + 1;
    }
  }


function readUVarInt(buf) {
  const length = buf.length;
  let x = 0;
  let shift = 0;
  let index = 0
  for(let i = index; i < length; i++) {
    const b = buf[i];
    if (b < 0x80) {
      const n = i - index;
      index = i+1;
      if (n > maxVarintLen32 || n === maxVarintLen32 && b > 1) {
        throw new RangeError('Overflow error decoding varint');
      }
      return (x | (b << shift)) >>> 0;
    }
    x |= (b & 0x7f) << shift;
    shift += 7;
  }
  return x
}

module.exports = {
  putUVarInt,
  readUVarInt,
};