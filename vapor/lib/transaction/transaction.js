let _ = require('lodash');
let BufferReader = require('../../../lib/binary/reader.js');
let BufferWriter = require('../../../lib/binary/writer.js');

let Input = require('./input.js');
let Output = require('./output.js');
let BN = require('bn.js');

let {mapTx} = require('./map.js')
let {convertBNtoN} = require('../../../lib/util/convert')
let {buildAnnotatedInput, buildAnnotatedOutput} = require('../util/convert')


const serRequired = 0x7 // Bit mask accepted serialization flag.

/**
 * Represents a transaction, a set of inputs and outputs to change ownership of tokens
 *
 * @param {*} serialized
 * @constructor
 */
function Transaction(serialized) {
  if (!(this instanceof Transaction)) {
    return new Transaction(serialized);
  }

  if (serialized) {
    if (serialized instanceof Transaction) {
      return new Transaction(Object.assign({}, serialized));
    } else if (_.isString(serialized)) {
      this.fromString(serialized);
    } else if (Buffer.isBuffer(serialized)) {
      this.fromBuffer(serialized);
    } else if (_.isObject(serialized)) {
      this.fromObject(serialized);
    } else {
      throw new Error('Must provide an object or string to deserialize a transaction');
    }
  }
}

Transaction.newTx = function(data) {
  let txData = new Transaction(data)
  return {
    txData,
    tx:     mapTx(txData),
  }
}
/**
 * Create a 'shallow' copy of the transaction, by serializing and deserializing
 * it dropping any additional information that inputs and outputs may have hold
 *
 * @param {Transaction} transaction
 * @return {Transaction}
 */
Transaction.shallowCopy = function(transaction) {
  var copy = new Transaction(transaction.toBuffer());
  return copy;
};

Transaction.prototype.writeTo = function(writer) {
  if (!writer) {
    writer = new BufferWriter();
  }

  this._writeTo(writer, serRequired);

  return writer;
};

Transaction.prototype._writeTo = function(w, serflags) {
  if (!w) {
    w = new BufferWriter();
  }
  w.write(Buffer.from([serflags]));
  w.writeVarint63(this.version);
  w.writeVarint63(this.timeRange);

  let inputLen = this.inputs? (this.inputs).length: 0

  w.writeVarint31(inputLen);

  if(this.inputs){
    for (let ti of (this.inputs)) {
      ti.writeTo(w)
    }
  }

  let outputLen = this.outputs? (this.outputs).length: 0
  w.writeVarint31(outputLen);

  if(this.outputs) {
    for (let to of (this.outputs)) {
      to.writeTo(w)
    }
  }

  return w;
};

Transaction.decodeRawTransaction = function(raw) {
  const _txData = this.prototype.readFrom( new BufferReader(raw))
  const _tx= mapTx(_txData)
  _txData.Tx = _tx
  const txData = _txData.toObject()
  const tx = {
    txId: _tx.id,
    version:   txData.version,
    size:      txData.serializedSize,
    timeRange: txData.timeRange,
    inputs:    [],
    outputs:   [],
  }

  for (let i in txData.inputs ){
    tx.inputs.push( buildAnnotatedInput(_txData, i))
  }

  for (let o in txData.outputs ){
    tx.outputs.push( buildAnnotatedOutput(_txData, o))
  }

  return tx
}

Transaction.prototype.readFrom = function(r) {
  let info = {};
  let startSerializedSize = r.pos
  let serflags = r.read(1).toString('hex')

  if (serflags != serRequired) {
    throw Error("unsupported serflags " + serflags)
  }

  info.version = new BN(r.readVarint63());
  let timeRange = r.readVarint63();
  info.timeRange = timeRange == 0?undefined: new BN(timeRange)

  let n = r.readVarint31()
  info.inputs = (n ==0) ? null :[]

  for( ; n > 0; n-- ){
    info.inputs.push(Input.readFrom(r));
  }

  let n2 = r.readVarint31()
  info.outputs = (n2 ==0) ? null:[]

  for( ; n2 > 0; n2--) {
    info.outputs.push(Output.readFrom(r));
  }
  info.serializedSize = new BN((r.pos - startSerializedSize).toString())
  return new Transaction(info)
}


Transaction.prototype.toBuffer = function() {
  let writer = new BufferWriter();
  return this.writeTo(writer).toBuffer();
};


Transaction.prototype.fromBuffer = function(buffer) {
  let reader = new BufferReader(buffer);
  return this.readFrom(reader);
};

Transaction.prototype.toObject = Transaction.prototype.toJSON = function toObject() {
  let inputs = [];
  this.inputs.forEach(function(input) {
    inputs.push(input.toObject());
  });
  let outputs = [];
  this.outputs.forEach(function(output) {
    outputs.push(output.toObject());
  });
  let obj = {
    serializedSize: convertBNtoN(this.serializedSize),
    version: convertBNtoN(this.version),
    inputs: inputs,
    outputs: outputs,
    timeRange: convertBNtoN(this.timeRange)
  };
  return obj;
};


Transaction.prototype.fromObject = function fromObject(arg) {
  let transaction;
  if (arg instanceof Transaction) {
    transaction = arg.toObject();
  } else {
    transaction = arg;
  }
  this.inputs = transaction.inputs || [];
  this.outputs = transaction.outputs ||[];
  this.timeRange = transaction.timeRange || new BN(0);
  this.version = transaction.version;
  if(transaction.serializedSize)  {
    this.serializedSize = transaction.serializedSize;
  }

  return this;
};


Transaction.prototype.fromString = function(string) {
  this.fromBuffer(Buffer.from(string, 'hex'));
};



module.exports = Transaction;