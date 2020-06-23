let Entry = require('./entry.js');

function CrossChainInput(args) {
  if (!(this instanceof CrossChainInput)) {
    return new CrossChainInput();
  }
  let info = args
  this.mainchainOutputId = info.mainchainOutputId
  this.ordinal = info.ordinal
  this.controlProgram = info.controlProgram
  this.assetDefinition = info.assetDefinition
  this.rawDefinitionByte = info.rawDefinitionByte

  return this;
}

CrossChainInput.prototype.typ = function () {
  return "crosschaininput1"
}

CrossChainInput.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.mainchainOutputId)
  Entry.writeForHash(w, this.assetDefinition)
}

// SetDestination will link the issuance to the output
CrossChainInput.prototype.setDestination = function(id, val, pos) {
  this.witnessDestination = {
      ref:      id,
      value:    val,
      position: pos,
  }
}

// NewCrossChainInput creates a new CrossChainInput.
CrossChainInput.newCrossChainInput = function(mainchainOutputID, prog, ordinal, assetDef, rawDefinitionByte) {
  return new CrossChainInput({
      mainchainOutputId: mainchainOutputID,
      ordinal:           ordinal,
      controlProgram:    prog,
      assetDefinition:   assetDef,
      rawDefinitionByte: rawDefinitionByte,
  })
}

module.exports = CrossChainInput;
