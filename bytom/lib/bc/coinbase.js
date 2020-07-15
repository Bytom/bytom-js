let Entry = require('./entry.js');

function Coinbase(args) {
  if (!(this instanceof Coinbase)) {
    return new Coinbase();
  }
  let info = args
  this.witnessDestination = info.witnessDestination
  this.arbitrary = info.arbitrary

  return this;
}

Coinbase.prototype.typ = function () {
  return "coinbase1"
}

Coinbase.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.arbitrary)
}

// SetDestination will link the issuance to the output
Coinbase.prototype.setDestination = function(id, val, pos) {
  this.witnessDestination = {
      ref:      id,
      value:    val,
      position: pos,
  }
}

// NewCoinbase creates a new Coinbase.
Coinbase.newCoinbase = function(arbitrary) {
  return new Coinbase({
    arbitrary
  })
}

module.exports = Coinbase;
