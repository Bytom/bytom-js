let bcOutput= require('../bc/output.js')
let bcSpend= require('../bc/spend.js')
let bcIssuance= require('../bc/issurance.js')
let BufferWriter = require('../binary/writer.js');

const sha3_256 = require( "js-sha3").sha3_256

function Tx(args) {
  if (!(this instanceof Tx)) {
    return new Tx();
  }
  let info = args
  this.id = info.id
  this.entries = info.entries
  this.inputIDs = info.inputIDs ||[]

  this.spentOutputIDs = info.spentOutputIDs||[]
  this.gasInputIDs = info.gasInputIDs||[]

  return this;
}

Tx.prototype.sigHash = function(n){
  let writer = new BufferWriter();

  writer.write(this.inputIDs[n])
  writer.write(this.id)

  let hash = sha3_256(Buffer.concat(writer.bufs, writer.bufLen));
  return hash
}

Tx.prototype.output = function(id) {
  let e = this.entries[id]
  if (!e){
   throw Error('error: Missing Entry')
  }

  if(e instanceof bcOutput){
    return e
  }else{
    throw  Error('entry  has unexpected type')
  }
}

Tx.prototype.spend = function(id) {
  let e = this.entries[id]
  if (!e){
   throw Error('error: Missing Entry')
  }

  if(e instanceof bcSpend){
    return e
  }else{
    throw  Error('entry  has unexpected type')
  }
}

Tx.prototype.issuance = function(id) {
  let e = this.entries[id]
  if (!e){
   throw Error('error: Missing Entry')
  }

  if(e instanceof bcIssuance){
    return e
  }else{
    throw  Error('entry  has unexpected type')
  }
}

module.exports = Tx;
