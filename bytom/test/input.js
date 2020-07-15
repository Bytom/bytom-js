'use strict';

let should = require('chai').should();
let expect = require('chai').expect;
let _ = require('lodash');

const BufferReader = require('../../lib/binary/reader.js')
let Input = require('../lib/transaction/input.js')
let BN = require('bn.js')


describe('Input', function() {

  let arg = [new Buffer("arguments1"),new Buffer("arguments2")]
  let issuance = Input.newIssuanceInput(new Buffer("nonce"), new BN(254354), new Buffer("issuanceProgram"), arg, new Buffer("assetDefinition"))

  let iwantHex = [
    "01",         // asset version
    "2a",         // serialization length
    "00",         // issuance type flag
    "05",         // nonce length
    "6e6f6e6365", // nonce
    "a69849e11add96ac7053aad22ba2349a4abf5feb0475a0afcadff4e128be76cf", // assetID
    "92c30f", // amount
    "38",     // input witness length
    "0f",     // asset definition length
    "6173736574446566696e6974696f6e", // asset definition
    "01", // vm version
    "0f", // issuanceProgram length
    "69737375616e636550726f6772616d", // issuance program
    "02", // argument array length
    "0a", // first argument length
    "617267756d656e747331", // first argument data
    "0a", // second argument length
    "617267756d656e747332", // second argument data
  ].join("")

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

  let coinbase = Input.newCoinbaseInput(new Buffer("arbitrary"))
  let cwantHex = [
    "01",                 // asset version
      "0b",                 // input commitment length
      "02",                 // coinbase type flag
      "09",                 // arbitrary length
      "617262697472617279", // arbitrary data
      "00",                 // witness length
  ].join("")


  it('Issuance: Test convert struct to hex', function() {
    issuance.writeTo().concat().toString('hex').should.equal(iwantHex)
  });

  it('Issuance: Test convert hex to struct', function() {
    Input.readFrom(BufferReader(iwantHex)).should.deep.equal(issuance)
  });

  it('SpendInput: Test convert struct to hex', function() {
    spend.writeTo().concat().toString('hex').should.equal(swantHex)
  });

  it('SpendInput: Test convert hex to struct', function() {
    Input.readFrom(BufferReader(swantHex)).should.deep.equal(spend)
  });

  it('CoinbaseInput: Test convert struct to hex', function() {
    coinbase.writeTo().concat().toString('hex').should.equal(cwantHex)
  });

  it('CoinbaseInput: Test convert hex to struct', function() {
    Input.readFrom(BufferReader(cwantHex)).should.deep.equal(coinbase)
  });

//Todo: readFrom
});