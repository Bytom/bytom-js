let Entry = require('./entry.js');

function VetoInput(args) {
  if (!(this instanceof VetoInput)) {
    return new VetoInput();
  }
  let info = args
  this.spentOutputId = info.spentOutputId
  this.ordinal = info.ordinal
  this.witnessDestination = info.witnessDestination
  this.witnessArguments = info.witnessArguments

  return this;
}

VetoInput.prototype.typ = function () {
  return "vetoInput1"
}

VetoInput.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.spentOutputId)
}

// SetDestination will link the issuance to the output
VetoInput.prototype.setDestination = function(id, val, pos) {
  this.witnessDestination = {
      ref:      id,
      value:    val,
      position: pos,
  }
}

// NewVetoInput creates a new VetoInput.
VetoInput.newVetoInput = function(spentOutputId, ordinal) {
  return new VetoInput({
    ordinal:   ordinal,
    spentOutputId: spentOutputId
  })
}

module.exports = VetoInput;