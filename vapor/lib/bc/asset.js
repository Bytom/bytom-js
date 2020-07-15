// https://github.com/Bytom/vapor/blob/master/protocol/bc/asset.go
const sha3_256 = require( "js-sha3").sha3_256
let BufferWriter = require('../../../lib/binary/writer.js');
let Entry = require('./entry.js');
const BN = require('bn.js').BN


function Asset(args) {
  if (!(this instanceof Asset)) {
    return new Asset();
  }
  this._metadata = args;
  this;
}


function _computeAssetId(assetDefinition) {

  const writer = new BufferWriter();
  writer.writeUInt64LEBN(new BN(assetDefinition.issuanceProgram.vmVersion));
  writer.writeVarstr31(new Buffer(assetDefinition.issuanceProgram.code, 'hex'));
  writer.write(assetDefinition.data);


  const arr = Buffer.concat(writer.bufs,writer.bufLen)
  return sha3_256(arr);
};

Asset.computeAssetId = function computeAssetId(prog, vmVersion , data){
  let def = {
    issuanceProgram: {
      vmVersion: vmVersion,
      code: prog,
    },
    data: data,
  }
  return _computeAssetId(def)
}

module.exports = Asset;