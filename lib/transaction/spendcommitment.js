 let BufferWriter = require('../binary/writer');
 let BN = require('bn.js')
 let {convertBNtoN} = require('../util/convert')

let SpendCommitment = function SpendCommitment(arg) {
  if (!(this instanceof SpendCommitment)) {
    return new SpendCommitment(arg);
  }
  let info = arg;
  this.assetAmount = info.assetAmount;
  this.sourceID = info.sourceID;
  this.sourcePosition = info.sourcePosition;
  this.vmVersion = info.vmVersion
  this.controlProgram = info.controlProgram

  return this;
};

SpendCommitment.prototype.toObject = SpendCommitment.prototype.toJSON = function toObject() {
 let obj = {
    assetAmount : this.assetAmount && {
      amount:convertBNtoN(this.assetAmount.amount),
      assetID:this.assetAmount.assetID.toString("hex")
    },
    sourceID : this.sourceID.toString("hex"),
    sourcePosition : convertBNtoN(this.sourcePosition),
    vmVersion : convertBNtoN(this.vmVersion),
    controlProgram : this.controlProgram.toString("hex")
 };
 return obj;
};

SpendCommitment.readFrom = function readFrom(br, assetVersion, obj) {
  return br.readExtensibleString(function (reader){
    if (assetVersion == 1) {
      obj.sourceID = reader.read(32).toString('hex')

      obj.assetAmount.assetID = reader.read(32).toString('hex')
      obj.assetAmount.amount = new BN(reader.readVarint63())

      obj.sourcePosition = new BN(reader.readVarint63())

      obj.vmVersion = new BN(reader.readVarint63())
      if(!obj.vmVersion.eq(new BN(1)) ) {
        return Error("unrecognized VM version %d for asset version 1"+ obj.vmVersion)
      }

      obj.controlProgram = reader.readVarstr31()
      return undefined
    }
    return undefined
  })
}

SpendCommitment.prototype.writeContents = function writeContents(bw, suffix, assetVersion){
  if (assetVersion == 1) {
    bw.write(new Buffer(this.sourceID,'hex'))
    bw.write(this.assetAmount)
    bw.writeVarint63(this.sourcePosition)
    bw.writeVarint63(this.vmVersion)
    bw.writeVarstr31(this.controlProgram)
  }
  if ( suffix && suffix.length > 0 ) {
    bw.write(suffix)
  }
  return bw
}

SpendCommitment.prototype.writeExtensibleString = function writeExtensibleString(bw, suffix, assetVersion){
  const writer = new BufferWriter()
  bw.writeExtensibleString(suffix, this.writeContents(writer, suffix, assetVersion))
  return bw
}

module.exports = SpendCommitment;

