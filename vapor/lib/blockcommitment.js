let BlockCommitment = function BlockCommitment(arg) {
  if (!(this instanceof BlockCommitment)) {
    return new BlockCommitment(arg);
  }
  let info = arg;
  this.transactionsMerkleRoot = info.transactionsMerkleRoot || new Buffer('0000000000000000000000000000000000000000000000000000000000000000','hex');
  this.transactionStatusHash = info.transactionStatusHash || new Buffer('0000000000000000000000000000000000000000000000000000000000000000','hex');

  return this;
};

BlockCommitment.readFrom = function readFrom(br) {
  let info = {};
  info.transactionsMerkleRoot = br.read(32)
  info.transactionStatusHash = br.read(32);
  return new BlockCommitment(info)
}

BlockCommitment.prototype.writeTo = function writeTo(bw){
  bw.write(this.transactionsMerkleRoot);
  bw.write(this.transactionStatusHash);
  return bw
}

/**
 * @returns {Object} - A plain object with the block properties
 */
BlockCommitment.prototype.toObject = BlockCommitment.prototype.toJSON = function toObject() {
  return {
    transactionsMerkleRoot: this.transactionsMerkleRoot.toString("hex"),
    transactionStatusHash: this.transactionStatusHash.toString("hex"),
  };
};

module.exports = BlockCommitment;
