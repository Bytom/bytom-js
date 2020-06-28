// https://github.com/Bytom/vapor/blob/master/protocol/bc/types/coinbase.go

let VetoInput = function VetoInput(arg) {
  if (!(this instanceof VetoInput)) {
    return new VetoInput(arg);
  }
  let info = arg;
  this.vetoCommitmentSuffix = info.vetoCommitmentSuffix;
  this.arguments = info.arguments;
  this.vote = info.vote;
  this.spendCommitment = info.spendCommitment;

  return this;
};

VetoInput.prototype.toObject = VetoInput.prototype.toJSON = function toObject() {
  let obj = {
    vetoCommitmentSuffix : this.vetoCommitmentSuffix,
    arguments : [],
    spendCommitment : this.spendCommitment.toObject(),
    vote: this.vote
  };

  for(let arg of this.arguments){
    obj.arguments.push(arg.toString("hex"))
  }
  return obj;
};

module.exports = VetoInput;

