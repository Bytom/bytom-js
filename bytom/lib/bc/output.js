let Entry = require('./entry.js');

function Output(args) {
  if (!(this instanceof Output)) {
    return new Output();
  }
  let info = args
  this.source = info.source
  this.controlProgram = info.controlProgram
  this.ordinal = info.ordinal

  return this;
}

Output.prototype.typ = function () {
  return "output1"
}

Output.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.source)
  Entry.writeForHash(w, this.controlProgram)
}

// NewOutput creates a new Output.
Output.newOutput = function(source, controlProgram, ordinal) {
  return new Output({
    source,
    controlProgram,
    ordinal
  })
}

module.exports = Output;