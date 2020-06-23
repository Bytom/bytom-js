
let bcIssuance = require('../lib/bc/issurance.js')
let bcSpend = require('../lib/bc/spend.js')
let bcOutput = require('../lib/bc/output.js')
let bcMux = require('../lib/bc/mux.js')
let bcRetirement = require('../lib/bc/retirement.js')
let bcTxHeader = require('../lib/bc/txHeader.js')

let Entry = require('../lib/bc/entry.js')

let BN = require('bn.js').BN


describe('Entry', function() {

  const hashBuffer = Buffer.concat([new BN(0).toBuffer('be',8),new BN(1).toBuffer('be',8), new BN(2).toBuffer('be',8), new BN(3).toBuffer('be',8)],32)
  const hashBuffer1 = Buffer.concat([new BN(1).toBuffer('be',8), new BN(2).toBuffer('be',8), new BN(3).toBuffer('be',8), new BN(4).toBuffer('be',8),],32)
  const hashBuffer2 = Buffer.concat([new BN(4).toBuffer('be',8),new BN(5).toBuffer('be',8), new BN(6).toBuffer('be',8), new BN(7).toBuffer('be',8)],32)
  const hashBuffer3 = Buffer.concat([new BN(1).toBuffer('be',8),new BN(1).toBuffer('be',8), new BN(1).toBuffer('be',8), new BN(1).toBuffer('be',8)],32)
  let testcase =[
    {
      entry:         bcIssuance.newIssuance( hashBuffer , {assetID:hashBuffer1, amount: new BN(100,10)},1),
      expectEntryID: "3012b9b6da3962bb2388cdf5db7f3b93a2b696fcc70e79bc5da1238a6d66ae73",
    },
    {
      entry: bcMux.newMux(
        [{
        ref:      hashBuffer,
        value:    {assetID:hashBuffer1, amount: new BN(100)},
        position: new BN(1),
        }],
        {vmVersion: new BN(1), code: Buffer.from([1,2,3,4])}),
      expectEntryID: "16c4265a8a90916434c2a904a90132c198c7ebf8512aa1ba4485455b0beff388",
    },
    {
      entry: bcOutput.newOutput(
        {
        ref:      hashBuffer2,
        value:    {assetID:hashBuffer3, amount:new BN(10)},
        position: new BN(10),
      },
      {vmVersion:  new BN(1), code: Buffer.from([5,5,5,5])},
      1,
    ),
      expectEntryID: "1145c54cd79721c31c81ecfb7cae217f8ef1bea0016df51c1f5060bba43252cc",
    },
    {
      entry: bcRetirement.newRetirement(
      {
        ref:      hashBuffer2,
        value:    {assetID:hashBuffer3, amount:new BN(10)},
        position: new BN(10),
      },
        1,
      ),
      expectEntryID: "538c367f7b6e1e9bf205ed0a29def84a1467c477b19812a6934e831c78c4da62",
    },
    {
      entry:         bcSpend.newSpend(hashBuffer, 1),
      expectEntryID: "2761dbb13967af8944620c134e0f336bbbb26f61eb4ecd154bc034ad6155b9e8",
    },
    {
      entry: bcTxHeader.newTxHeader(new BN(1), 100, new BN(1000), [hashBuffer2]),
      expectEntryID: "ba592aa0841bd4649d9a04309e2e8497ac6f295a847cadd9de6b6f9c2d806663",
    }]
  it('should create a corresponding entryId', function () {
    for(let test of testcase){
      let got  = Entry.entryID(test.entry)
      let want = test.expectEntryID

      got.should.equal(want)
    }
  });


})