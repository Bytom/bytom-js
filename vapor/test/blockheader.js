'use strict';

const BlockHeader = require('../lib/blockheader.js')
const BlockWitness = require('../lib/blockWitness.js')
const BlockCommitment = require('../lib/blockcommitment.js')
const BufferReader = require('../../lib/binary/reader.js')
const test = require('tape')
const should = require('chai').should();

const data =  {
  version: '1',
  height:'432234',
  prevblockidhex: 'c34048bd60c4c13144fd34f408627d1be68f6cb4fdd34e879d6d791060ea73a0',
  timestamp: '1522908275000',
  transactionStatusHash: 'b94301ea4e316bee00109f68d25beaca90aeff08e9bf439a37d91d7a3b5a1470',
  transactionsMerkleRoot: 'ad9ac003d08ff305181a345d64fe0b02311cc1a6ec04ab73f3318d90139bfe03',
  blockWitness: [(new Buffer([0xbe, 0xef]))] ,
};

const wantHex = [
  "01",     // serialization flags
  "01",     // version
  "eab01a", // block height
  "c34048bd60c4c13144fd34f408627d1be68f6cb4fdd34e879d6d791060ea73a0", // prev block hash
  "b8c2a0a3a92c", // timestamp
  "40",           // commitment extensible field length
  "ad9ac003d08ff305181a345d64fe0b02311cc1a6ec04ab73f3318d90139bfe03", // transactions merkle root
  "b94301ea4e316bee00109f68d25beaca90aeff08e9bf439a37d91d7a3b5a1470", // tx status hash
  "040102beef", //BlockWitness
].join('')

describe('BlockHeader', function() {
  let version;
  let height;
  let prevblockidbuf;
  let transactionStatusHash;
  let transactionsMerkleRoot;
  let timestamp;
  let blockWitness;
  let bh;
  let bhbuf;

  before(function () {
    version = data.version;
    height = data.height;
    prevblockidbuf = new Buffer(data.prevblockidhex, 'hex');
    transactionStatusHash = new Buffer(data.transactionStatusHash, 'hex');
    transactionsMerkleRoot = new Buffer(data.transactionsMerkleRoot, 'hex');
    timestamp = data.timestamp;
    blockWitness = data.blockWitness

    bh = new BlockHeader({
      version: version,
      previousBlockHash: prevblockidbuf,
      height: height,
      timestamp: timestamp,
      blockCommitment: new BlockCommitment({
        transactionStatusHash,
        transactionsMerkleRoot
      }),
      blockWitness:new BlockWitness({ witness: blockWitness})
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