let Entry = require('./entry.js');

function CrossChainOutput(args) {
  if (!(this instanceof CrossChainOutput)) {
    return new CrossChainOutput();
  }
  let info = args
  this.source = info.source
  this.controlProgram = info.controlProgram
  this.ordinal = info.ordinal

  return this;
}

CrossChainOutput.prototype.typ = function () {
  return "crosschainoutput1"
}

CrossChainOutput.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.source)
  Entry.writeForHash(w, this.controlProgram)
}

// NewCrossChainOutput creates a new CrossChainOutput.
CrossChainOutput.newCrossChainOutput = function(source, controlProgram, ordinal) {
  return new CrossChainOutput({
    source,
    controlProgram,
    ordinal
  })
}

module.exports = CrossChainOutput;
