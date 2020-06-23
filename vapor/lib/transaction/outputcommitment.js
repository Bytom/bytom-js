let BufferWriter = require('../../../lib/binary/writer');
let BN = require('bn.js')
let {convertBNtoN} = require('../../../lib/util/convert')

let OutputCommitment = function OutputCommitment(arg) {
  if (!(this instanceof OutputCommitment)) {
    return new OutputCommitment(arg);
  }
  let info = arg;
  this.assetAmount = info.assetAmount;
  this.vmVersion = info.vmVersion
  this.controlProgram = info.controlProgram

  return this;
};

OutputCommitment.prototype.toObject = OutputCommitment.prototype.toJSON = function toObject() {
  let obj = {
    assetAmount: this.assetAmount&& {
      assetID : this.assetAmount.assetID.toString('hex'),
      amount : convertBNtoN(this.assetAmount.amount)
    },
    vmVersion: convertBNtoN(this.vmVersion),
    controlProgram: this.controlProgram.toString('hex'),
  };
  return obj;
};

OutputCommitment.readFrom = function readFrom(br, resultObject) {
  return br.readExtensibleString(function (reader){
    if (resultObject.assetVersion == 1) {
      let obj = {
        assetAmount:{}
      }
      obj.assetAmount.assetID = reader.read(32)
      obj.assetAmount.amount = new BN(reader.readVarint63())
      obj.vmVersion = new BN(reader.readVarint63())

      if(!obj.vmVersion.eq(new BN(1)) ) {
        return Error("unrecognized VM version %d for asset version 1"+ obj.vmVersion)
      }
      obj.controlProgram = reader.readVarstr31()

      resultObject.outputCommitment = new OutputCommitment(obj)
    }
    return undefined
  })
}

OutputCommitment.prototype.writeContents = function writeContents(bw, suffix, assetVersion){
  if (assetVersion == 1) {
    bw.write(this.assetAmount)
    bw.writeVarint63(this.vmVersion)
    bw.writeVarstr31(this.controlProgram)
  }
  if ( suffix && suffix.length > 0 ) {
    bw.write(suffix)
  }
  return bw
}

OutputCommitment.prototype.writeExtensibleString = function writeExtensibleString(bw, suffix, assetVersion){
  const writer = new BufferWriter()
  bw.writeExtensibleString(suffix, this.writeContents(writer, suffix, assetVersion))
  return bw
}

module.exports = OutputCommitment;

