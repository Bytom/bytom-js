let Entry = require('./entry.js');


function Issuance(args) {
  if (!(this instanceof Issuance)) {
    return new Issuance();
  }
  let info = args
  this.nonceHash = info.nonceHash
  this.value = info.value
  this.ordinal = info.ordinal

  return this;
}

Issuance.prototype.typ = function () {
  return "issuance1"
}

Issuance.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.nonceHash)
  Entry.writeForHash(w, this.value)
}

// SetDestination will link the issuance to the output
Issuance.prototype.setDestination = function(id, val, pos) {
  this.witnessDestination = {
      ref:      id,
      value:    val,
      position: pos,
  }
}

// NewIssuance creates a new Issuance.
Issuance.newIssuance = function(nonceHash, value, ordinal) {
  return new Issuance({
    nonceHash: nonceHash,
    value:     value,
    ordinal:   ordinal,
  })
}

module.exports = Issuance;