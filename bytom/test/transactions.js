let Transaction = require('../lib/transaction/transaction.js')
let Input = require('../lib/transaction/input.js')
const Output = require('../lib/transaction/output.js')
const BufferReader = require('../../lib/binary/reader.js')

const BTMAssetID = require('../../lib/util/constance').BTMAssetID

let BN = require('bn.js');


describe('Transaction', function() {

  let testcase =[{
    tx: Transaction.newTx({
      version:       new BN(1) ,
      serializedSize: new BN(5),
      inputs:         null,
      outputs:        null,
    }),
    hex: [
    "07", // serflags
      "01", // transaction version
      "00", // tx time range
      "00", // inputs count
      "00", // outputs count
    ].join( ""),
    hash: "8e88b9cb4615128c7209dff695f68b8de5b38648bf3d44d2d0e6a674848539c9"
  },
  {
    tx: Transaction.newTx({
      version:        new BN(1),
      serializedSize: new BN(261),
      timeRange:      new BN(654),
      inputs: [
        Input.newIssuanceInput(new Buffer("nonce"), new BN(254354),new Buffer("issuanceProgram"), [new Buffer("arguments1"),new Buffer("arguments2")],new Buffer("assetDefinition")),
        Input.newSpendInput([new Buffer("arguments3"),new Buffer("arguments4")], "fad5195a0c8e3b590b86a3c0a95e7529565888508aecca96e9aeda633002f409", BTMAssetID, new BN(254354), new BN(3),new Buffer("spendProgram")),
      ],
      outputs:[
        Output.newTxOutput("a69849e11add96ac7053aad22ba2349a4abf5feb0475a0afcadff4e128be76cf", new BN(254354), new Buffer("true")),
      ],
    }),
    hex: [
      "07",         // serflags
      "01",         // transaction version
      "8e05",       // tx time range
      "02",         // inputs count
      "01",         // input 0: asset version
      "2a",         // input 0: serialization length
      "00",         // input 0: issuance type flag
      "05",         // input 0: nonce length
      "6e6f6e6365", // input 0: nonce
      "a69849e11add96ac7053aad22ba2349a4abf5feb0475a0afcadff4e128be76cf", // input 0: assetID
      "92c30f", // input 0: amount
      "38",     // input 0: input witness length
      "0f",     // input 0: asset definition length
      "6173736574446566696e6974696f6e", // input 0: asset definition
      "01", // input 0: vm version
      "0f", // input 0: issuanceProgram length
      "69737375616e636550726f6772616d", // input 0: issuance program
      "02", // input 0: argument array length
      "0a", // input 0: first argument length
      "617267756d656e747331", // input 0: first argument data
      "0a", // input 0: second argument length
      "617267756d656e747332", // input 0: second argument data
      "01", // input 1: asset version
      "54", // input 1: input commitment length
      "01", // input 1: spend type flag
      "52", // input 1: spend commitment length
      "fad5195a0c8e3b590b86a3c0a95e7529565888508aecca96e9aeda633002f409", // input 1: source id
      "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // input 1: assetID
      "92c30f", // input 1: amount
      "03",     // input 1: source position
      "01",     // input 1: vm version
      "0c",     // input 1: spend program length
      "7370656e6450726f6772616d", // input 1: spend program
      "17", // input 1: witness length
      "02", // input 1: argument array length
      "0a", // input 1: first argument length
      "617267756d656e747333", // input 1: first argument data
      "0a", // input 1: second argument length
      "617267756d656e747334", // input 1: second argument data
      "01", // outputs count
      "01", // output 0: asset version
      "29", // output 0: serialization length
      "a69849e11add96ac7053aad22ba2349a4abf5feb0475a0afcadff4e128be76cf", // output 0: assetID
      "92c30f",   // output 0: amount
      "01",       // output 0: version
      "04",       // output 0: control program length
      "74727565", // output 0: control program
      "00",       // output 0: witness length
    ].join(""),
    hash: "a0ece5ca48dca27708394852599cb4d04af22c36538c03cb72663f3091406c17"
  },
  {
    tx: Transaction.newTx({
      version:        new BN(1),
      serializedSize: new BN(108),
      inputs: [
        Input.newCoinbaseInput(new Buffer("arbitrary")),
      ],
      outputs: [
        Output.newTxOutput(BTMAssetID, new BN(254354),new Buffer("true")),
        Output.newTxOutput(BTMAssetID, new BN(254354),new Buffer("false")),
      ]
    }),
     hex: [
    "07",                 // serflags
      "01",                 // transaction version
      "00",                 // tx time range
      "01",                 // inputs count
      "01",                 // input 0: asset version
      "0b",                 // input 0: input commitment length
      "02",                 // input 0: coinbase type flag
      "09",                 // input 0: arbitrary length
      "617262697472617279", // input 0: arbitrary data
      "00",                 // input 0: witness length
      "02",                 // outputs count
      "01",                 // output 0: asset version
      "29",                 // output 0: serialization length
      "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // output 0: assetID
      "92c30f",   // output 0: amount
      "01",       // output 0: version
      "04",       // output 0: control program length
      "74727565", // output 0: control program
      "00",       // output 0: witness length
      "01",       // output 1: asset version
      "2a",       // output 1: serialization length
      "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // output 1: assetID
      "92c30f",     // output 1: amount
      "01",         // output 1: version
      "05",         // output 1: control program length
      "66616c7365", // output 1: control program
      "00",         // output 1: witness length
    ].join(""),
    hash: "c2e2f388706fc06cca6aba5e85e0e85029f772872e1b6e6c32a70da22d0309dc"
  }]
  it('should serialize correctly a given transaction', function () {
    for(let test of testcase){
      let got  = test.tx.txData.writeTo().concat().toString('hex')
      let want = test.hex
      got.should.equal(want)
      test.tx.tx.id.should.equal(test.hash)
    }
  });

  it('should deserialize correctly to a transaction', function () {
    for(let test of testcase){
      let txFromJson  = Transaction.readFrom(BufferReader(test.hex))
      txFromJson.should.deep.equal(test.tx.txData)
    }
  });

})
