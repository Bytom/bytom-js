// https://github.com/Bytom/vapor/blob/master/protocol/bc/types/vote_output.go
const VoteOutputType = '02'

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
    vote : this.vote.toString('hex')
  };
  return obj;
};

VoteOutput.prototype.outputType = function() {
  return VoteOutputType;
};

module.exports = VoteOutput;

