/* jshint unused: false */
/* jshint latedef: false */
let should = require("chai").should();
let expect = require("chai").expect;

const BufferReader = require('../lib/binary/reader.js')
const Output = require('../lib/transaction/output.js')
let BN = require('bn.js')

const wantHex = [
  "01", // asset version
  "3e", // serialization length
  "81756fdab39a17163b0ce582ee4ee256fb4d1e156c692b997d608a42ecb38d47", // assetID
  "92c30f", // amount
  "01",     // version
  "19",     // control program length
  "5465737453657269616c697a6174696f6e54784f7574707574", // control program
  "00", // witness length
].join('')

describe("Output", function() {

  let output = new Output.newTxOutput('81756fdab39a17163b0ce582ee4ee256fb4d1e156c692b997d608a42ecb38d47',
    new BN(254354),
    new Buffer('TestSerializationTxOutput'))

  it('buffer writer', function() {
    output.writeTo().concat().toString('hex').should.equal(wantHex)
  });

  it('buffer reader', function() {
    Output.readFrom(BufferReader(wantHex)).should.deep.equal(output)
  });

});