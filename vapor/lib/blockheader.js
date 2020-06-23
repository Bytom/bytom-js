'use strict';

let BufferReader = require('../../lib/binary/reader')
let BufferWriter = require('../../lib/binary/writer')

const BlockCommitment = require('./blockcommitment.js')
let {mapBlockHeader} = require('../lib/transaction/map.js')

let {convertBNtoN} = require('../../lib/util/convert')

const SerBlockHeader = 1
let BN = require('bn.js')

/**
 * Instantiate a BlockHeader from a Buffer, JSON object, or Object with
 * the properties of the BlockHeader
 *
 * @param {*} - A Buffer, JSON string, or Object
 * @returns {BlockHeader} - An instance of block header
 * @constructor
 */
let BlockHeader = function BlockHeader(arg) {
  if (!(this instanceof BlockHeader)) {
    return new BlockHeader(arg);
  }
  let info = arg;
  this.version = info.version;
  this.height = info.height;
  this.previousBlockHash = info.previousBlockHash || new Buffer('0000000000000000000000000000000000000000000000000000000000000000','hex');
  this.timestamp = info.timestamp || new BN('0');
  this.bits = info.bits || new BN('0');
  this.nonce = info.nonce ||  new BN('0');
  this.blockCommitment = info.blockCommitment || new BlockCommitment({})

  return this;
};

/**
 * @param br {BufferReader} - A BufferReader of the block header
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader._fromBufferReader = function _fromBufferReader(br) {
  let info = {};
  info.serflag = br.read(1)
  info.version = br.readVarint63();
  info.height = br.readVarint63();
  info.previousBlockHash = br.read(32);
  info.timestamp = br.readVarint63();
  info.blockCommitment = br.readExtensibleString(BlockCommitment.readFrom)
  info.nonce = br.readVarint63();
  info.bits = br.readVarint63();

  return info;
};

/**
 * @param br {BufferReader} - A BufferReader of the block header
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader.prototype.hash = function(){
  let h = mapBlockHeader(this).entryID
  return h
}

/**
 * @returns {Object} - A plain object with the block properties
 */
BlockHeader.prototype.toObject = BlockHeader.prototype.toJSON = function toObject() {
  return {
    version: convertBNtoN(this.version),
    height: convertBNtoN(this.height),
    previousBlockHash: this.previousBlockHash.toString('hex'),
    timestamp: convertBNtoN(this.timestamp),
    blockCommitment: this.blockCommitment.toObject(),
    nonce: convertBNtoN(this.nonce),
    bits: convertBNtoN(this.bits),
  };
};

/**
 * @param br {BufferReader} - A BufferReader of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.readFrom = function readFrom(br) {
  let info = BlockHeader._fromBufferReader(br);
  return {blockHeader: new BlockHeader(info), serflag: info.serflag};
};

/**
 * @returns {Buffer} - A Buffer of the BlockHeader
 */
BlockHeader.prototype.toBuffer = function toBuffer() {
  return this.writeTo().concat();
};

/**
 * @returns {string} - A hex encoded string of the BlockHeader
 */
BlockHeader.prototype.toString = function toString() {
  return this.toBuffer().toString('hex');
};

/**
 * @param {BufferWriter} - An existing instance BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the BlockHeader
 */
BlockHeader.prototype.writeTo = function writeTo(bw, serflags) {
  if (!bw) {
    bw = new BufferWriter();
  }

  let serflag
  if(serflags){
    serflag = Buffer.from([serflags])
  }else{
    serflag = Buffer.from([SerBlockHeader])
  }

  bw.write(serflag);
  bw.writeVarint63(this.version);
  bw.writeVarint63(this.height);
  bw.write(this.previousBlockHash);
  bw.writeVarint63(this.timestamp);
  bw.writeExtensibleString([], this.blockCommitment.writeTo(new BufferWriter()))
  bw.writeVarint63(this.nonce);
  bw.writeVarint63(this.bits);
  return bw;
};

module.exports = BlockHeader;