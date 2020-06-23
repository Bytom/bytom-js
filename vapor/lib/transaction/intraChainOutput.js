// https://github.com/Bytom/vapor/blob/master/protocol/bc/types/intrachain_output.go

let IntraChainOutput = function IntraChainOutput(arg) {
  if (!(this instanceof IntraChainOutput)) {
    return new IntraChainOutput(arg);
  }
  let info = arg;
  this.outputCommitment = info.outputCommitment;
  this.commitmentSuffix = info.commitmentSuffix;

  return this;
};

IntraChainOutput.prototype.toObject = IntraChainOutput.prototype.toJSON = function toObject() {
  let obj = {
    outputCommitment: this.outputCommitment.toObject(),
    commitmentSuffix : this.commitmentSuffix
  };
  return obj;
};

module.exports = IntraChainOutput;

