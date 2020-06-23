let Entry = require('./entry.js');

function Retirement(args) {
  if (!(this instanceof Retirement)) {
    return new Retirement();
  }
  let info = args
  this.source = info.source
  this.ordinal = info.ordinal

  return this;
}

Retirement.prototype.typ = function () {
  return "retirement1"
}

Retirement.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.source)
}

// NewRetirement creates a new Retirement.
Retirement.newRetirement = function(source, ordinal) {
  return new Retirement({
    source,
    ordinal
  })
}

module.exports = Retirement;