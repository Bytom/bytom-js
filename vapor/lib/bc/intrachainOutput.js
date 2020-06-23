let Entry = require('./entry.js');

function IntraChainOutput(args) {
  if (!(this instanceof IntraChainOutput)) {
    return new IntraChainOutput();
  }
  let info = args
  this.source = info.source
  this.controlProgram = info.controlProgram
  this.ordinal = info.ordinal

  return this;
}

IntraChainOutput.prototype.typ = function () {
  return "intrachainoutput1"
}

IntraChainOutput.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.source)
  Entry.writeForHash(w, this.controlProgram)
}

// NewIntraChainOutput creates a new IntraChainOutput.
IntraChainOutput.newIntraChainOutput = function(source, controlProgram, ordinal) {
  return new IntraChainOutput({
    source,
    controlProgram,
    ordinal
  })
}

module.exports = IntraChainOutput;
