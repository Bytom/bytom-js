let bcOutput= require('../bc/output.js')
let bcSpend= require('../bc/spend.js')
let bcIssuance= require('../bc/issurance.js')


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
