// https://github.com/Bytom/vapor/blob/master/protocol/bc/types/coinbase.go

let CoinbaseInput = function CoinbaseInput(arg) {
  if (!(this instanceof CoinbaseInput)) {
    return new CoinbaseInput(arg);
  }
  let info = arg;
  this.arbitrary = info.arbitrary;

  return this;
};

CoinbaseInput.prototype.toObject = CoinbaseInput.prototype.toJSON = function toObject() {
  let obj = {
    arbitrary: this.arbitrary.toString('hex'),
  };
  return obj;
};

module.exports = CoinbaseInput;

