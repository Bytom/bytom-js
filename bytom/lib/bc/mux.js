let Entry = require('./entry.js');

function Mux(args) {
  if (!(this instanceof Mux)) {
    return new Mux();
  }
  let info = args
  this.sources = info.sources
  this.program = info.program

  return this;
}

Mux.prototype.typ = function () {
  return "mux1"
}

Mux.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.sources)
  Entry.writeForHash(w, this.program)
}

// NewMux creates a new Mux.
Mux.newMux = function(sources, program) {
  return new Mux({
    sources,
    program
  })
}

module.exports = Mux;