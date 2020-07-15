'use strict';

let _ = require('lodash');
let BlockHeader = require('./blockheader');
let BN = require('bn.js');
let BufferReader = require('../../lib/binary/reader');
let BufferWriter = require('../../lib/binary/writer');
let Transaction = require('./transaction/transaction');
let {mapTx} = require('./transaction/map.js')
// serflag variables, start with 1
const
SerBlockHeader = 1,
SerBlockTransactions = 2,
SerBlockFull = 3


/**
 * Instantiate a Block from a Buffer, JSON object, or Object with
 * the properties of the Block
 *
 * @param {*} - A Buffer, JSON string, or Object
 * @returns {Block}
 * @constructor
 */
function Block(arg) {
  if (!(this instanceof Block)) {
    return new Block(arg);
  }
  if(arg)(
    _.extend(this, Block._from(arg))
  )
  return this;
}


/**
 * @param {*} - A Buffer, JSON string or Object
 * @returns {Object} - An object representing block data
 * @throws {TypeError} - If the argument was not recognized
 * @private
 */
Block._from = function _from(arg) {
  var info = {};
  if (Buffer.isBuffer(arg)) {
    info = Block._fromBufferReader(BufferReader(arg));
  } else if (_.isObject(arg)) {
    info = Block._fromObject(arg);
  } else {
    throw new TypeError('Unrecognized argument for Block');
  }
  return info;
};

/**
 * @param {Object} - A plain JavaScript object
 * @returns {Object} - An object representing block data
 * @private
 */
Block._fromObject = function _fromObject(data) {
  var info = {
    blockheader: data.blockheader && new BlockHeader(data.blockheader),
    transactions: data.transactions
  };
  return info;
};

/**
 * @param {Object} - A plain JavaScript object
 * @returns {Block} - An instance of block
 */
Block.fromObject = function fromObject(obj) {
  var info = Block._fromObject(obj);
  return new Block(info);
};

/**
 * @param {BufferReader} - Block data
 * @returns {Object} - An object representing the block data
 * @private
 */
Block._fromBufferReader = function _fromBufferReader(br) {
  let info = {};
  const blockHeader = BlockHeader.readFrom(br)

  const serflags = blockHeader.serflag
  info.blockHeader = blockHeader.blockHeader
  if (serflags == SerBlockHeader) {
    return info
  }

  info.transactions = []
  for(let n = br.readVarint31() ; n > 0; n--) {
    let data = {};
    data.txData =  Transaction.readFrom(br)
    data.tx = mapTx(data.txData)
    info.transactions.push(data)
  }
  return info;
};

/**
 * @param {BufferReader} - A buffer reader of the block
 * @returns {Block} - An instance of block
 */
Block.readFrom = function readFrom(br) {
  let info = this._fromBufferReader(br);
  return new Block(info);
};

/**
 * @param {Buffer} - A buffer of the block
 * @returns {Block} - An instance of block
 */
Block.fromBuffer = function fromBuffer(buf) {
  return Block.readFrom(new BufferReader(buf));
};

/**
 * @param {string} - str - A hex encoded string of the block
 * @returns {Block} - A hex encoded string of the block
 */
Block.fromString = function fromString(str) {
  var buf = Buffer.from(str, 'hex');
  return Block.fromBuffer(buf);
};


/**
 * @returns {Object} - A plain object with the block properties
 */
Block.prototype.toObject = Block.prototype.toJSON = function toObject() {
  var transactions = [];
  this.transactions.forEach(function(tx) {
    transactions.push(tx.txData.toObject());
  });
  return {
    blockheader: this.blockheader && this.blockheader.toObject(),
    transactions: transactions
  };
};

/**
 * @returns {Buffer} - A buffer of the block
 */
Block.prototype.toBuffer = function toBuffer() {
  return this.writeTo().concat();
};

/**
 * @returns {string} - A hex encoded string of the block
 */
Block.prototype.toString = function toString() {
  return this.toBuffer().toString('hex');
};


/**
 * @param {BufferWriter} - An existing instance of BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the Block
 */
Block.prototype.writeTo = function writeTo(bw, serflags) {
  if (!bw) {
    bw = new BufferWriter();
  }

  const serflag = serflags? serflags: SerBlockFull
  this.blockheader.writeTo(bw, serflag);

  if (serflags == SerBlockHeader) {
    return bw
  }

  bw.writeVarint31(this.transactions.length);

  for (let tx of this.transactions) {
    tx.txData.writeTo(bw);
  }
  return bw;
};


module.exports = Block;