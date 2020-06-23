let Entry = require('./entry.js');

function blockHeader(args) {
  if (!(this instanceof blockHeader)) {
    return new blockHeader();
  }
  let info = args
  this.version = info.version
  this.height = info.height
  this.previousBlockId = info.previousBlockId
  this.timestamp = info.timestamp
  this.transactionsRoot = info.transactionsRoot
  this.transactionStatusHash = info.transactionStatusHash
  this.bits = info.bits
  this.nonce = info.nonce

  return this;
}

blockHeader.prototype.typ = function () {
  return "blockheader"
}

blockHeader.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.version)
  Entry.writeForHash(w, this.height)
  Entry.writeForHash(w, this.previousBlockId)
  Entry.writeForHash(w, this.timestamp)
  Entry.writeForHash(w, this.transactionsRoot)
  Entry.writeForHash(w, this.transactionStatusHash)
  Entry.writeForHash(w, this.bits)
  Entry.writeForHash(w, this.nonce)
}

// NewblockHeader creates a new blockHeader.
blockHeader.newblockHeader = function(version, height, previousBlockId, timestamp, transactionsRoot, transactionStatusHash, nonce, bits) {

  return new blockHeader({
    version: version,
    height: height,
    previousBlockId: previousBlockId,
    timestamp: timestamp,
    transactionsRoot: transactionsRoot,
    transactionStatusHash: transactionStatusHash,
    nonce: nonce,
    bits: bits
  })
}

module.exports = blockHeader;