'use strict';

const BlockHeader = require('../lib/blockheader.js')
const BlockCommitment = require('../lib/blockcommitment.js')
const BufferReader = require('../../lib/binary/reader.js')
const test = require('tape')
const should = require('chai').should();

const data =  {
  version: '1',
  height:'432234',
  timestamp: '1522908275',
  bits: '2305843009222082559',
  nonce: '34342',
  prevblockidhex: 'c34048bd60c4c13144fd34f408627d1be68f6cb4fdd34e879d6d791060ea73a0',
  transactionStatusHash: 'b94301ea4e316bee00109f68d25beaca90aeff08e9bf439a37d91d7a3b5a1470',
  transactionsMerkleRoot: 'ad9ac003d08ff305181a345d64fe0b02311cc1a6ec04ab73f3318d90139bfe03'
};

const wantHex = [
    "01",     // serialization flags
    "01",     // version
    "eab01a", // block height
    "c34048bd60c4c13144fd34f408627d1be68f6cb4fdd34e879d6d791060ea73a0", // prev block hash
    "f3f896d605", // timestamp
    "40",         // commitment extensible field length
    "ad9ac003d08ff305181a345d64fe0b02311cc1a6ec04ab73f3318d90139bfe03", // transactions merkle root
    "b94301ea4e316bee00109f68d25beaca90aeff08e9bf439a37d91d7a3b5a1470", // tx status hash
    "a68c02",             // nonce
    "ffffff838080808020", // bits
].join('')

describe('BlockHeader', function() {
  let version;
  let height;
  let prevblockidbuf;
  let transactionStatusHash;
  let transactionsMerkleRoot;
  let timestamp;
  let bits;
  let nonce;
  let bh;
  let bhbuf;

  before(function () {
    version = data.version;
    height = data.height;
    prevblockidbuf = new Buffer(data.prevblockidhex, 'hex');
    transactionStatusHash = new Buffer(data.transactionStatusHash, 'hex');
    transactionsMerkleRoot = new Buffer(data.transactionsMerkleRoot, 'hex');
    timestamp = data.timestamp;
    bits = data.bits;
    nonce = data.nonce;
    bh = new BlockHeader({
      version: version,
      previousBlockHash: prevblockidbuf,
      height: height,
      timestamp: timestamp,
      bits: bits,
      nonce: nonce,
      blockCommitment: new BlockCommitment({
        transactionStatusHash,
        transactionsMerkleRoot
      })
    });
    bhbuf = new Buffer(wantHex, 'hex');
  });

  it('should make a new blockheader', function() {
    bh.toBuffer().toString('hex').should.equal(wantHex)
  });

  it('should parse this known buffer', function() {
    BlockHeader.readFrom(BufferReader(wantHex)).blockHeader.should.deep.equal(bh)
  });

});