let Entry = require('./entry.js');

function VoteOutput(args) {
  if (!(this instanceof VoteOutput)) {
    return new VoteOutput();
  }
  let info = args
  this.source = info.source
  this.controlProgram = info.controlProgram
  this.ordinal = info.ordinal
  this.vote = info.vote

  return this;
}

VoteOutput.prototype.typ = function () {
  return "voteoutput1"
}

VoteOutput.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.source)
  Entry.writeForHash(w, this.controlProgram)
  Entry.writeForHash(w, this.vote)
}

// NewVoteOutput creates a new VoteOutput.
VoteOutput.newVoteOutput = function(source, controlProgram, ordinal, vote) {
  return new VoteOutput({
    source,
    controlProgram,
    ordinal,
    vote
  })
}

module.exports = VoteOutput;