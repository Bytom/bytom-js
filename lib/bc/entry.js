let BufferWriter = require('../binary/writer.js');
const sha3_256 = require( "js-sha3").sha3_256
const BN = require('bn.js').BN

let Entry = function Entry(arg) {
  if (!(this instanceof Entry)) {
    return new Entry(arg);
  }
  let info = arg;
  this.type = info.type
  this.body = info.body
  return this;
};

Entry.writeForHash = function(writer,data) {
  try {
    if (data == null) {
      return writer
    }

    if (typeof data == 'number') {
      let val = new BN(data)
      writer.writeUInt64LEBN(val)
    } else if (data instanceof BN) {
      writer.writeUInt64LEBN(data)
    } else if (data instanceof Buffer && data.length==32 && (/[0-9a-f]{64}/i).test(data.toString('hex'))){
      writer.write(data);
    } else if (data instanceof Buffer){
      writer.writeVarstr31(data);
    }  else if (Array.isArray(data) && (data[0] instanceof Buffer) && data[0].length!=32 && !(/[0-9a-f]{64}/i).test(data.toString('hex'))){
      writer.writeVarstrList(data);
    } else if (typeof data == 'string' && data.length==64 && (/[0-9a-f]{64}/i).test(data)) {
      writer.write(new Buffer(data, 'hex'));
    } else if (typeof data == 'string' ) {
      writer.writeVarstr31(new Buffer(data, 'hex'));
    }  else if (Array.isArray(data)) {
      writer.writeVarint31(data.length);
      for (let obj of data) {
        this.writeForHash(writer, obj);
      }
    } else if (data instanceof Object) {
      const Values = Object.values(data)
      for (let val of Values) {
        this.writeForHash(writer,val)
      }
    }else{
      writer.write(data)
    }
  } catch ( e) {
    throw new Error(e);
  }
}

Entry.entryID = function(e){
  let writer = new BufferWriter();

  writer.write(new Buffer("entryid:"))
  writer.write(new Buffer(e.typ()))
  writer.write(new Buffer(':'))

  let bh = new BufferWriter();
  e.writeForHash(bh);

  let bhasher = sha3_256.array(Buffer.concat(bh.bufs, bh.bufLen));
  writer.write(new Buffer(bhasher))

  return sha3_256(Buffer.concat(writer.bufs, writer.bufLen))
}

module.exports = Entry;
