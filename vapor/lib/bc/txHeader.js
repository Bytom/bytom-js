let Entry = require('./entry.js');

function TxHeader(args) {
  if (!(this instanceof TxHeader)) {
    return new TxHeader();
  }
  let info = args
  this.version = info.version
  this.serializedSize = info.serializedSize
  this.timeRange = info.timeRange
  this.resultIDs = info.resultIDs

  return this;
}

TxHeader.prototype.typ = function () {
  return "txheader"
}

TxHeader.prototype.writeForHash = function(w) {
  Entry.writeForHash(w, this.version)
  Entry.writeForHash(w, this.timeRange)
  Entry.writeForHash(w, this.resultIDs)
}

// NewTxHeader creates a new TxHeader.
TxHeader.newTxHeader = function(version, serializedSize, timeRange, resultIDs) {
  let arg = {}

  if(version){
    arg.version = version
  }

  if(serializedSize){
    arg.serializedSize = serializedSize
  }

  if(timeRange){
    arg.timeRange = timeRange
  }

  if(resultIDs){
    arg.resultIDs = resultIDs
  }

  return new TxHeader({
    version,
    serializedSize,
    timeRange,
    resultIDs
  })
}

module.exports = TxHeader;