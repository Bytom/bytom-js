// https://github.com/Bytom/vapor/blob/master/protocol/bc/types/crosschain_output.go

let CrossChainOutput = function CrossChainOutput(arg) {
  if (!(this instanceof CrossChainOutput)) {
    return new CrossChainOutput(arg);
  }
  let info = arg;
  this.outputCommitment = info.outputCommitment;
  this.commitmentSuffix = info.commitmentSuffix;

  return this;
};

CrossChainOutput.prototype.toObject = CrossChainOutput.prototype.toJSON = function toObject() {
  let obj = {
    outputCommitment: this.outputCommitment.toObject(),
    commitmentSuffix : this.commitmentSuffix
  };
  return obj;
};

module.exports = CrossChainOutput;

