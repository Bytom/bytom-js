// https://github.com/Bytom/vapor/blob/master/protocol/bc/types/coinbase.go

let CrossChainInput = function CrossChainInput(arg) {
  if (!(this instanceof CrossChainInput)) {
    return new CrossChainInput(arg);
  }
  let info = arg;
  this.spendCommitmentSuffix = info.spendCommitmentSuffix;
  this.arguments = info.arguments;
  this.spendCommitment = info.spendCommitment;
  this.assetDefinition = info.assetDefinition;
  this.issuanceVMVersion = info.issuanceVMVersion;
  this.issuanceProgram = info.issuanceProgram;

  return this;
};

CrossChainInput.prototype.toObject = CrossChainInput.prototype.toJSON = function toObject() {
  let obj = {
    spendCommitmentSuffix : this.spendCommitmentSuffix,
    arguments : [],
    spendCommitment : this.spendCommitment.toObject(),
    assetDefinition : this.assetDefinition,
    issuanceVMVersion : this.issuanceVMVersion,
    issuanceProgram : this.issuanceProgram,
  };

  for(let arg of this.arguments){
    obj.arguments.push(arg.toString("hex"))
  }
  return obj;
};

module.exports = CrossChainInput;

