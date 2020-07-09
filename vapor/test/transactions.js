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
      serializedSize: new BN(112),
      inputs: [
        Input.newCoinbaseInput(new Buffer("arbitrary")),
      ],
      outputs: [
        Output.newIntraChainOutput(BTMAssetID, new BN(254354),new Buffer("true")),
        Output.newIntraChainOutput(BTMAssetID, new BN(254354),new Buffer("false")),
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
       "2b",                 // output 0: serialization length
       "00",                 // output 0: outType
       "29",                 // output 0: output commitment length
       "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // output 0: assetID
       "92c30f",   // output 0: amount
       "01",       // output 0: version
       "04",       // output 0: control program length
       "74727565", // output 0: control program
       "00",       // output 0: witness length
       "01",       // output 1: asset version
       "2c",       // output 1: serialization length
       "00",       // output 1: outType
       "2a",       // output 1: output commitment length
       "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // output 1: assetID
       "92c30f",     // output 1: amount
       "01",         // output 1: version
       "05",         // output 1: control program length
       "66616c7365", // output 1: control program
       "00",      // output 1: witness length
    ].join(""),
    hash: "2591a2af0d3690107215c2a47ab60c4e8d7547f04154ecd5ccab1db0d31e66b4"
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
