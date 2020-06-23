'use strict';

let _ = require('lodash');
let BN = require('bn.js');
let BufferWriter = require('../../../lib/binary/writer');
let OutputCommitment = require('./outputcommitment.js')

function Output(args) {
  if (!(this instanceof Output)) {
    return new Output(args);
  }

  let info = args;
  this.assetVersion = info.assetVersion;
  this.commitmentSuffix = info.commitmentSuffix;
  this.outputCommitment = info.outputCommitment

  return this;

}
Output.newTxOutput = function(assetID, amount, controlProgram ) {
  return new Output({
    assetVersion: 1,
    outputCommitment: OutputCommitment({
      assetAmount: {
        assetID: new Buffer(assetID, 'hex'),
        amount: amount
      },
      vmVersion: new BN(1),
      controlProgram
    })
  })
}

Output.fromObject = function(data) {
  return new Output(data);
};

Output.prototype.toObject = Output.prototype.toJSON = function toObject() {
  let obj = {
    assetVersion: this.assetVersion,
    commitmentSuffix: this.commitmentSuffix,
    outputCommitment: this.outputCommitment.toObject()
  };
  return obj;
};


Output.readFrom = function(br) {
  let obj = {};
  obj.assetVersion = Number(br.readVarint63());
  obj.commitmentSuffix = OutputCommitment.readFrom(br, obj)
  br.readVarstr31()
  return new Output(obj);
};

Output.prototype.writeTo = function(writer) {
  if (!writer) {
    writer = new BufferWriter();
  }
  writer.writeVarint63(this.assetVersion);
  this.outputCommitment.writeExtensibleString(writer, this.commitmentSuffix, this.assetVersion)
  writer.writeVarstr31('')
  return writer;
};

module.exports = Output;