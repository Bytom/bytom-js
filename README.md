Bytom Library
=======
[![NPM Package](https://img.shields.io/npm/v/bytomjs-lib.svg?style=flat-square)](https://www.npmjs.com/package/bytomjs-lib)

A pure and powerful JavaScript Bytom library.

## Get Started

```
npm install bytomjs-lib
```

## Examples
Decode a Bytom Raw Transactions,
```javascript
let BytomJs = require("bytomjs-lib")

let tx= BytomJs.bytom.Transaction.decodeRawTransaction('070100010160015e5978c52e0508cbf1cd901919277e4dba80fb4440b4771bbaa3b6c483f9264d21ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8094ebdc0301011600143c21d88332683d060ccf905a0f26ce82907ac132220120f3a597b7a1f8b7b210790d5ceef145ae8616d025a6fdb4aec67338bf937af6b9020139ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6401160014f0928dc5f8878a4289b981d7c66386ff74be7fc300013dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffb4dfcfdc03011600143c21d88332683d060ccf905a0f26ce82907ac13200')
console.log(tx)

/*
* {
    "txId": "a6c593cd7998fb7d54613b836e425798bfb82acb55412a3f4a03b291172e0e1d",
    "version": 1,
    "size": 262,
    "timeRange": 0,
    "inputs": [
      {
        "assetID": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "amount": 1000000000,
        "signData": "88f7c410770955e37d3bedf75c074cb9ee4551f29dbf96c68e81dea3acd57476",
        "inputID": "aaf67d228662b3f0c08094142eca2f5c7f5424d937e5e6e82d7abbfb7c6a6f4c",
        "type": "spend",
        "address": "bm1q8ssa3qejdq7svrx0jpdq7fkws2g84sfjg5d89d",
        "controlProgram": "00143c21d88332683d060ccf905a0f26ce82907ac132",
        "spentOutputID": "417a3414a3ef0c2686e228ef671c0e9c56d582c1e77d07dcf06e67f81743d431",
        "witnessArguments": [
          "f3a597b7a1f8b7b210790d5ceef145ae8616d025a6fdb4aec67338bf937af6b9"
        ]
      }
    ],
    "outputs": [
      {
        "outputID": "02cec554b3888cde2144d05b0b40d89f01650aae7855cbd2b936934922376f84",
        "position": "0",
        "assetID": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "amount": 100,
        "controlProgram": "0014f0928dc5f8878a4289b981d7c66386ff74be7fc3",
        "address": "bm1q7zfgm30cs79y9zdes8tuvcuxla6tul7rgce7u7",
        "type": "control"
      },
      {
        "outputID": "985c9396341813825cf715fdfa428b836f8bc1d2631364d2dc612e9c579e9144",
        "position": "1",
        "assetID": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "amount": 999550900,
        "controlProgram": "00143c21d88332683d060ccf905a0f26ce82907ac132",
        "address": "bm1q8ssa3qejdq7svrx0jpdq7fkws2g84sfjg5d89d",
        "type": "control"
      }
    ],
    "fee": 449000
  }
  */

```

Decode a Vapor Raw Transactions,
```javascript
let BytomJs = require("bytomjs-lib")

let tx= BytomJs.vapor.Transaction.decodeRawTransaction('07018ff3f61f010160015eb99041e009a3683df89f5bc57056a9f95457250d3f5fdfc17a4c8fdb2addea5affffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80bce7d1010101160014d0742d785131290d0625d41f48f26792806670c02201205ab7ff3f37dcc46829e3680871ee9890c5d3d094ea04c221fee6d1c721eadb8302017f024050ef22b3a3fca7bc08916187cc9ec2f4005c9c6b1353aa1decbd4be3f3bb0fbe1967589f0d9dec13a388c0412002d2c267bdf3b920864e1ddc50581be5604ce13cffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80c2d72f01160014d0742d785131290d0625d41f48f26792806670c000013f003dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80fa8fa20101160014d0742d785131290d0625d41f48f26792806670c000')
console.log(tx)

/*
{
   "txId": "2d0e741017cc2166837c87179014d2f36a596c4412d67c568f4829e329baea38",
   "version": 1,
   "size": 337,
   "timeRange": 66959759,
   "inputs": [
     {
       "assetID": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
       "amount": 440000000,
       "signData": "25ac3c487f715f7a3256cca409102e6ad919e21b96a4292c75be9be326ad4096",
       "inputID": "74002b078b810041abf3e35805d53130c9238d159f79ab2a338164d1f3d04934",
       "type": "spend",
       "address": "vp1q6p6z67z3xy5s6p396s053un8j2qxvuxqejegqd",
       "controlProgram": "0014d0742d785131290d0625d41f48f26792806670c0",
       "spentOutputID": "1b8ac8813b0caa7b2d7342b9d2b89a2a1e1fb1f4bc0575d07aadc93ad4ed9ee0",
       "arguments": [
         "5ab7ff3f37dcc46829e3680871ee9890c5d3d094ea04c221fee6d1c721eadb83"
       ]
     }
   ],
   "outputs": [
     {
       "outputID": "cc3f68372e4fcfa80b829993e81481e306746b45c6c31dc1724d82742011b101",
       "position": "0",
       "assetID": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
       "amount": 100000000,
       "controlProgram": "0014d0742d785131290d0625d41f48f26792806670c0",
       "type": "vote",
       "vote": "50ef22b3a3fca7bc08916187cc9ec2f4005c9c6b1353aa1decbd4be3f3bb0fbe1967589f0d9dec13a388c0412002d2c267bdf3b920864e1ddc50581be5604ce1",
       "address": "vp1q6p6z67z3xy5s6p396s053un8j2qxvuxqejegqd"
     },
     {
       "outputID": "89e440e950715ab6c4cce7a5be7fd6c20529a2f5722727755a9e1cebc5b66599",
       "position": "1",
       "assetID": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
       "amount": 340000000,
       "controlProgram": "0014d0742d785131290d0625d41f48f26792806670c0",
       "type": "control",
       "address": "vp1q6p6z67z3xy5s6p396s053un8j2qxvuxqejegqd"
     }
   ],
   "fee": 0
 } 
**/

```

Sign Transactions,
```javascript
let Bytom = require("bytomjs-lib")
const BN = Bytom.BN

let tx = new Bytom.bc.Tx({
                   id: Buffer.concat([new BN('13464118406972499748').toBuffer('be',8),new BN('5083224803004805715').toBuffer('be',8), new BN('16263625389659454272').toBuffer('be',8), new BN('9428032044180324575').toBuffer('be',8)],32),
                   inputIDs: [
                     Buffer.concat([new BN('14760873410800997144').toBuffer('be',8),new BN('1698395500822741684').toBuffer('be',8), new BN('5965908492734661392').toBuffer('be',8), new BN('9445539829830863994').toBuffer('be',8)],32)
                 ],
               })
console.log(tx.sigHash(0))

```

## Contributing

Please send pull requests for bug fixes, code optimization, and ideas for improvement.

## Development & Tests

```sh
git clone https://github.com/Bytom/bytom-js
cd bytom-js
npm install
```

Run all the tests:

```sh
npm run test
```

## License

Code released under [the MIT license](https://github.com/Bytom/bytom-js/blob/master/LICENSE).

Copyright Bytom. 