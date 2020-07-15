let bcIntrachainOutput= require('../bc/intrachainOutput.js')
let bcCrosschainOutput= require('../bc/crosschainOutput.js')
let bcSpend= require('../bc/spend.js')
let bcVetoInput= require('../bc/vetoInput.js')
let bcVoteOutput= require('../bc/voteOutput.js')
let bcIssuance= require('../bc/issurance.js')
let BufferWriter = require('../../../lib/binary/writer.js');

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

  this.txHeader = info.txHeader

  return this;
}

Tx.prototype.sigHash = function(n){
  let writer = new BufferWriter();

  writer.write(this.inputIDs[n])
  writer.write(this.id)

  let hash = sha3_256(Buffer.concat(writer.bufs, writer.bufLen));
  return hash
}

Tx.prototype.intraChainOutput = function(id) {
  let e = this.entries[id]
  if (!e){
    throw Error('error: Missing Entry' +id)
  }
  if(e instanceof bcIntrachainOutput){
    return e
  }else{
    throw  Error(`entry ${id} has unexpected type ${e}`)
  }
}

Tx.prototype.crossChainOutput = function(id) {
  let e = this.entries[id]
  if (!e){
    throw Error('error: Missing Entry' +id)
  }
  if(e instanceof bcCrosschainOutput){
    return e
  }else{
    throw  Error(`entry ${id} has unexpected type ${e}`)
  }
}

Tx.prototype.entry = function(id) {
  let e = this.entries[id]
  if (!e){
    throw Error('error: Missing Entry' +id)
  }
  return e
}

Tx.prototype.spend = function(id) {
  let e = this.entries[id]
  if (!e){
    throw Error('error: Missing Entry' +id)
  }

  if(e instanceof bcSpend){
    return e
  }else{
    throw  Error(`entry ${id} has unexpected type ${e}`)
  }
}

Tx.prototype.vetoInput = function(id) {
  let e = this.entries[id]
  if (!e){
    throw Error('error: Missing Entry' +id)
  }

  if(e instanceof bcVetoInput){
    return e
  }else{
    throw  Error(`entry ${id} has unexpected type ${e}`)
  }
}

Tx.prototype.voteOutput = function(id) {
  let e = this.entries[id]
  if (!e){
    throw Error('error: Missing Entry' +id)
  }

  if(e instanceof bcVoteOutput){
    return e
  }else{
    throw  Error(`entry ${id} has unexpected type ${e}`)
  }
}


module.exports = Tx;
