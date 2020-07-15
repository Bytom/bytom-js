let bcTx = require('../lib/bc/tx.js')

let BN = require('bn.js');


describe('Tx', function() {

  let testcase =[
    {
      tx: new bcTx({
        id: Buffer.concat([new BN('13464118406972499748').toBuffer('be',8),new BN('5083224803004805715').toBuffer('be',8), new BN('16263625389659454272').toBuffer('be',8), new BN('9428032044180324575').toBuffer('be',8)],32),
        inputIDs: [
          Buffer.concat([new BN('14760873410800997144').toBuffer('be',8),new BN('1698395500822741684').toBuffer('be',8), new BN('5965908492734661392').toBuffer('be',8), new BN('9445539829830863994').toBuffer('be',8)],32)
      ],
    }),
  wantHash: "17dfad182df66212f6f694d774285e5989c5d9d1add6d5ce51a5930dbef360d8",
},
  {
    tx: new bcTx({
      id: Buffer.concat([new BN('17091584763764411831').toBuffer('be',8),new BN('2315724244669489432').toBuffer('be',8), new BN('4322938623810388342').toBuffer('be',8), new BN('11167378497724951792').toBuffer('be',8)],32),
      inputIDs: [
        Buffer.concat([new BN('6970879411704044573').toBuffer('be',8),new BN('10086395903308657573').toBuffer('be',8), new BN('10107608596190358115').toBuffer('be',8), new BN('8645856247221333302').toBuffer('be',8)],32)
      ],
    }),
    wantHash: "f650ba3a58f90d3a2215f6c50a692a86c621b7968bb2a059a4c8e0c819770430",
  }]
  it('TestSigHash', function () {
    for(let test of testcase){
      let gotHash = test.tx.sigHash(0)
      let want = test.wantHash
      gotHash.should.equal(want)
    }
  });

})
