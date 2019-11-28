let Entry = require('./entry.js');

function Spend(args) {
  if (!(this instanceof Spend)) {
    return new Spend();
  }
  let info = args
  this.spentOutputId = info.spentOutputId
  this.ordinal = info.ordinal

  return this;
}

Spend.prototype.typ = function () {
  return "spend1"
}

Spend.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.spentOutputId)
}

// SetDestination will link the issuance to the output
Spend.prototype.setDestination = function(id, val, pos) {
  this.witnessDestination = {
      ref:      id,
      value:    val,
      position: pos,
  }
}

// NewSpend creates a new Spend.
Spend.newSpend = function(spentOutputId, ordinal) {
  return new Spend({
    ordinal:   ordinal,
    spentOutputId: spentOutputId
  })
}

module.exports = Spend;