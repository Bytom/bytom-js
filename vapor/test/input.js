'use strict';

let should = require('chai').should();
let expect = require('chai').expect;
let _ = require('lodash');

const BufferReader = require('../../lib/binary/reader.js')
let Input = require('../lib/transaction/input.js')
let BN = require('bn.js')


describe('Input', function() {

  let arg = [new Buffer("arguments1"),new Buffer("arguments2")]

  let spend = Input.newSpendInput(arg, "fad5195a0c8e3b590b86a3c0a95e7529565888508aecca96e9aeda633002f409", "fe9791d71b67ee62515e08723c061b5ccb952a80d804417c8aeedf7f633c524a",new BN(254354), new BN(3), new Buffer("spendProgram"))
  let swantHex = [
    "01", // asset version
      "54", // input commitment length
      "01", // spend type flag
      "52", // spend commitment length
      "fad5195a0c8e3b590b86a3c0a95e7529565888508aecca96e9aeda633002f409", // source id
      "fe9791d71b67ee62515e08723c061b5ccb952a80d804417c8aeedf7f633c524a", // assetID
      "92c30f", // amount
      "03",     // source position
      "01",     // vm version
      "0c",     // spend program length
      "7370656e6450726f6772616d", // spend program
      "17", // witness length
      "02", // argument array length
      "0a", // first argument length
      "617267756d656e747331", // first argument data
      "0a", // second argument length
      "617267756d656e747332", // second argument data
  ].join("")


  let crossIn = Input.newCrossChainInput(arg, "fad5195a0c8e3b590b86a3c0a95e7529565888508aecca96e9aeda633002f409", "fe9791d71b67ee62515e08723c061b5ccb952a80d804417c8aeedf7f633c524a",new BN(254354), new BN(3), "1", new Buffer("whatever"), new Buffer("IssuanceProgram"))
  let crossWantHex = [
    "01", // asset version
    "62", // input commitment length
    "00", // cross-chain input type flag
    "46", // cross-chain input commitment length
    "fad5195a0c8e3b590b86a3c0a95e7529565888508aecca96e9aeda633002f409", // source id
    "fe9791d71b67ee62515e08723c061b5ccb952a80d804417c8aeedf7f633c524a", // assetID
    "92c30f",                         // amount
    "03",                             // source position
    "01",                             // vm version
    "00",                             // spend program length
    "01",                             // VmVersion
    "08",                             // asset definition length
    "7768617465766572",               // asset definition data
    "0f",                             // IssuanceProgram length
    "49737375616e636550726f6772616d", // IssuanceProgram
    "17",                             // witness length
    "02",                             // argument array length
    "0a",                             // first argument length
    "617267756d656e747331",           // first argument data
    "0a",                             // second argument length
    "617267756d656e747332",           // second argument data
  ].join("")


  let vetoInput = Input.newVetoInput(arg, "fad5195a0c8e3b590b86a3c0a95e7529565888508aecca96e9aeda633002f409", "fe9791d71b67ee62515e08723c061b5ccb952a80d804417c8aeedf7f633c524a",new BN(254354), new BN(3), new Buffer("spendProgram"), new Buffer("af594006a40837d9f028daabb6d589df0b9138daefad5683e5233c2646279217294a8d532e60863bcf196625a35fb8ceeffa3c09610eb92dcfb655a947f13269"))
  let vetoWantHex = [
    "01",   // asset version
    "d601", // input commitment length
    "03",   // veto type flag
    "52",   // veto commitment length
    "fad5195a0c8e3b590b86a3c0a95e7529565888508aecca96e9aeda633002f409", // source id
    "fe9791d71b67ee62515e08723c061b5ccb952a80d804417c8aeedf7f633c524a", // assetID
    "92c30f",                   // amount
    "03",                       // source position
    "01",                       // vm version
    "0c",                       // veto program length
    "7370656e6450726f6772616d", // veto program
    "8001",                     //xpub length
    "6166353934303036613430383337643966303238646161626236643538396466306239313338646165666164353638336535323333633236343632373932313732393461386435333265363038363362636631393636323561333566623863656566666133633039363130656239326463666236353561393437663133323639", //voter xpub
    "17",                   // witness length
    "02",                   // argument array length
    "0a",                   // first argument length
    "617267756d656e747331", // first argument data
    "0a",                   // second argument length
    "617267756d656e747332", // second argument data
  ].join("")

  let coinbase = Input.newCoinbaseInput(new Buffer("arbitrary"))
  let cwantHex = [
    "01",                 // asset version
      "0b",                 // input commitment length
      "02",                 // coinbase type flag
      "09",                 // arbitrary length
      "617262697472617279", // arbitrary data
      "00",                 // witness length
  ].join("")



  it('SpendInput: Test convert struct to hex', function() {
    spend.writeTo().concat().toString('hex').should.equal(swantHex)
  });

  it('SpendInput: Test convert hex to struct', function() {
    Input.readFrom(BufferReader(swantHex)).should.deep.equal(spend)
  });

  it('CrossChainInput: Test convert struct to hex', function() {
    crossIn.writeTo().concat().toString('hex').should.equal(crossWantHex)
  });

  it('CrossChainInput: Test convert hex to struct', function() {
    Input.readFrom(BufferReader(crossWantHex)).should.deep.equal(crossIn)
  });

   it('VetoInput: Test convert struct to hex', function() {
    vetoInput.writeTo().concat().toString('hex').should.equal(vetoWantHex)
  });

  it('VetoInput: Test convert hex to struct', function() {
    Input.readFrom(BufferReader(vetoWantHex)).should.deep.equal(vetoInput)
  });

  it('CoinbaseInput: Test convert struct to hex', function() {
    coinbase.writeTo().concat().toString('hex').should.equal(cwantHex)
  });

  it('CoinbaseInput: Test convert hex to struct', function() {
    Input.readFrom(BufferReader(cwantHex)).should.deep.equal(coinbase)
  });

//Todo: readFrom
});