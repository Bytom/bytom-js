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
  this.transactionStatus = info.transactionStatus
  this.witnessArguments = info.witnessArguments

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
}

// NewblockHeader creates a new blockHeader.
blockHeader.newblockHeader = function(version, height, previousBlockId, timestamp, transactionsRoot, transactionStatusHash, witness) {
  return new blockHeader({
    version: version,
    height: height,
    previousBlockId: previousBlockId,
    timestamp: timestamp,
    transactionsRoot:      transactionsRoot,
    transactionStatusHash: transactionStatusHash,
    transactionStatus:     null,
    witnessArguments:      witness,
  })
}

module.exports = blockHeader;