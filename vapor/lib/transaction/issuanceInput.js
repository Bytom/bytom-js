const sha3_256 = require( "js-sha3").sha3_256
let {convertBNtoN} = require('../../../lib/util/convert')

const Asset = require( '../bc/asset')

let IssuanceInput = function IssuanceInput(arg) {
  if (!(this instanceof IssuanceInput)) {
    return new IssuanceInput(arg);
  }
  let info = arg;
  this.nonce = info.nonce;
  this.amount = info.amount
  this.assetDefinition = info.assetDefinition
  this.vmVersion = info.vmVersion
  this.issuanceProgram = info.issuanceProgram
  this.arguments = info.arguments

  return this;
};

IssuanceInput.prototype.toObject = IssuanceInput.prototype.toJSON = function toObject() {
  let obj = {
    nonce : this.nonce.toString('hex'),
    amount : convertBNtoN(this.amount),
    assetDefinition : this.assetDefinition.toString('hex'),
    vmVersion : convertBNtoN(this.vmVersion),
    issuanceProgram : this.issuanceProgram.toString('hex'),
    arguments : [],
  };

  for(let arg of this.arguments){
    obj.arguments.push(arg.toString("hex"))
  }
  return obj;
};

IssuanceInput.prototype.assetID = function (){
  let defhash = new Buffer(this.assetDefinitionHash())
  return Asset.computeAssetId(this.issuanceProgram, this.vmVersion, defhash)
}

IssuanceInput.prototype.nonceHash = function(){
  let hash = sha3_256.array(Buffer.from(this.nonce,'hex'))
  return hash
}

IssuanceInput.prototype.assetDefinitionHash = function (){
  let defhash = sha3_256.array(Buffer.from(this.assetDefinition,'hex'))
  return defhash
}
module.exports = IssuanceInput;

