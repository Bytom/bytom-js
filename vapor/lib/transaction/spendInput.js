
let SpendInput = function SpendInput(arg) {
  if (!(this instanceof SpendInput)) {
    return new SpendInput(arg);
  }
  let info = arg;
  this.spendCommitmentSuffix = info.spendCommitmentSuffix;
  this.arguments = info.arguments
  this.spendCommitment = info.spendCommitment

  return this;
};

SpendInput.prototype.toObject = SpendInput.prototype.toJSON = function toObject() {
  let obj = {
    spendCommitmentSuffix : this.spendCommitmentSuffix,
    arguments : [],
    spendCommitment : this.spendCommitment.toObject(),
  };

  for(let arg of this.arguments){
    obj.arguments.push(arg.toString("hex"))
  }
  return obj;
};
module.exports = SpendInput;

