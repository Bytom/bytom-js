/* jshint unused: false */
/* jshint latedef: false */
let should = require("chai").should();
let expect = require("chai").expect;
const BTMAssetID = require('../../lib/util/constance').BTMAssetID


const BufferReader = require('../../lib/binary/reader.js')
const Output = require('../lib/transaction/output.js')
let BN = require('bn.js')

const SpendInputType = '01'
const VetoInputType = '03'

const wantHex = [
  "01", // asset version
  "40", // serialization length
  "00", // outType
  "3e", // output commitment length
  "81756fdab39a17163b0ce582ee4ee256fb4d1e156c692b997d608a42ecb38d47", // assetID
  "92c30f", // amount
  "01",     // version
  "19",     // control program length
  "5465737453657269616c697a6174696f6e54784f7574707574", // control program
  "00", // witness length
].join('')

describe("Test Serialization IntraChain Tx Output", function () {

  let output = new Output.newIntraChainOutput('81756fdab39a17163b0ce582ee4ee256fb4d1e156c692b997d608a42ecb38d47',
    new BN(254354),
    new Buffer('TestSerializationTxOutput'))

  it('buffer writer', function () {
    output.writeTo().concat().toString('hex').should.equal(wantHex)
  });

  it('buffer reader', function () {
    Output.readFrom(BufferReader(wantHex)).should.deep.equal(output)
  });

});

describe("Test Serialization CrossChain Tx Output", function () {

  let output = new Output.newCrossChainOutput('81756fdab39a17163b0ce582ee4ee256fb4d1e156c692b997d608a42ecb38d47',
    new BN(254354),
    new Buffer('TestSerializationTxOutput'))

  let wHex = [
    "01", // asset version
    "40", // serialization length
    "01", // outType
    "3e", // output commitment length
    "81756fdab39a17163b0ce582ee4ee256fb4d1e156c692b997d608a42ecb38d47", // assetID
    "92c30f", // amount
    "01",     // version
    "19",     // control program length
    "5465737453657269616c697a6174696f6e54784f7574707574", // control program
    "00", // witness length
  ].join('');

  it('buffer writer', function () {
    output.writeTo().concat().toString('hex').should.equal(wHex)
  });

  it('buffer reader', function () {
    Output.readFrom(BufferReader(wHex)).should.deep.equal(output)
  });

});

describe("Test Serialization Vote Output", function () {

  let output = new Output.newVoteOutput('81756fdab39a17163b0ce582ee4ee256fb4d1e156c692b997d608a42ecb38d47',
    new BN(1000),
    new Buffer('TestSerializationTxOutput'),
    new Buffer('af594006a40837d9f028daabb6d589df0b9138daefad5683e5233c2646279217294a8d532e60863bcf196625a35fb8ceeffa3c09610eb92dcfb655a947f13269'))

  let wHex = [
    "01",   // asset version
    "c101", // serialization length
    "02",   // outType
    "8001", // output xpub length
    "6166353934303036613430383337643966303238646161626236643538396466306239313338646165666164353638336535323333633236343632373932313732393461386435333265363038363362636631393636323561333566623863656566666133633039363130656239326463666236353561393437663133323639", // xpub
    "3d", // output commitment length
    "81756fdab39a17163b0ce582ee4ee256fb4d1e156c692b997d608a42ecb38d47", // assetID
    "e807", // amount
    "01",   // version
    "19",   // control program length
    "5465737453657269616c697a6174696f6e54784f7574707574", // control program
    "00", // witness length
  ].join('');

  it('buffer writer', function () {
    output.writeTo().concat().toString('hex').should.equal(wHex)
  });

  it('buffer reader', function () {
    Output.readFrom(BufferReader(wHex)).should.deep.equal(output)
  });

});

describe("Test Compute Output ID", function () {

  let testcase = [
    {
      sc: {
        assetAmount: {assetId: BTMAssetID, amount: new BN(1000)},
        sourceID: "4b5cb973f5bef4eadde4c89b92ee73312b940e84164da0594149554cc8a2adea",
        sourcePosition: 2,
        vmVersion: 1,
        controlProgram: "0014cb9f2391bafe2bc1159b2c4c8a0f17ba1b4dd94e",
      },
      inputType: SpendInputType,
      vote: null,
      wantOutputID: "73eea4d38b22ffd60fc30d0941f3875f45e29d424227bfde100193a08568605b",
    },
    {
      sc: {
        assetAmount: {assetId: BTMAssetID, amount: new BN(999)},
        sourceID: "9e74e35362ffc73c8967aa0008da8fcbc62a21d35673fb970445b5c2972f8603",
        sourcePosition: 2,
        vmVersion: 1,
        controlProgram: "001418549d84daf53344d32563830c7cf979dc19d5c0",
      },
      inputType: SpendInputType,
      vote: null,
      wantOutputID: "8371e76fd1c873503a326268bfd286ffe13009a0f1140d2c858e8187825696ab",
    },
    {
      sc: {
        assetAmount: {assetId: BTMAssetID, amount: new BN(999)},
        sourceID: "993d3797fa3b2d958f300e599987dc10904b13f56ce89d158f60f9131424e0e2",
        sourcePosition: 2,
        vmVersion: 1,
        controlProgram: "00145c47f3a0dd3e1e9956fe5b0f897072ed33f9efb9",
      },
      inputType: VetoInputType,
      vote: new Buffer("af594006a40837d9f028daabb6d589df0b9138daefad5683e5233c2646279217294a8d532e60863bcf196625a35fb8ceeffa3c09610eb92dcfb655a947f13269"),
      wantOutputID: "a4de5a81babc7949d6b38d1cd4bcbc83da340387e747b5f521af3e427c6b0132",
    },
    {
      sc: {
        assetAmount: {assetId: BTMAssetID, amount: new BN(999)},
        sourceID: "993d3797fa3b2d958f300e599987dc10904b13f56ce89d158f60f9131424e0e2",
        sourcePosition: 2,
        vmVersion: 1,
        controlProgram: "00145c47f3a0dd3e1e9956fe5b0f897072ed33f9efb9",
      },
      inputType: VetoInputType,
      vote: new Buffer(""),
      wantOutputID: "e42a48ef401b993c5e523b6a7b5456ad4b297c7aeda163405f265d8d00af983e",
    }]



  it('test compute output id', function () {
    for(let c of testcase){
      let outputID = Output.computeOutputID(c.sc, c.inputType, c.vote)
      c.wantOutputID.should.equal(outputID)
    }
  });

});
