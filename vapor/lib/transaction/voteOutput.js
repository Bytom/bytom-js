// https://github.com/Bytom/vapor/blob/master/protocol/bc/types/vote_output.go

let VoteOutput = function VoteOutput(arg) {
  if (!(this instanceof VoteOutput)) {
    return new VoteOutput(arg);
  }
  let info = arg;
  this.outputCommitment = info.outputCommitment;
  this.commitmentSuffix = info.commitmentSuffix;
  this.vote = info.vote;
  return this;
};

VoteOutput.prototype.toObject = VoteOutput.prototype.toJSON = function toObject() {
  let obj = {
    outputCommitment: this.outputCommitment.toObject(),
    commitmentSuffix : this.commitmentSuffix,
    vote : this.vote
  };
  return obj;
};

module.exports = VoteOutput;

