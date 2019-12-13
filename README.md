Bytom Library
=======
[![NPM Package](https://img.shields.io/npm/v/bytomjs-lib.svg?style=flat-square)](https://www.npmjs.com/package/bytomjs-lib)

A pure and powerful JavaScript Bytom library.

## Get Started

```
npm install bytomjs-lib
```

## Examples
Decode Raw Transactions,
```javascript
let Bytom = require("bytomjs-lib")

let block= Bytom.Block.readFrom(Bytom.binary.BufferReader('030154749faac93cbfe9c786e63e5e06e9e2c152cc009c028ac24403f97cfae269abd8a7adedee0540143d9d8734a1302246e6b2fdad7a3d49bcdd03abd85d5a78064d8920f7dfec956978a65b4ee5b6f4914fe5c05000459a803ecf59132604e5d334d64249c5e50a29cc99b38080808080200207010001010502030038340001013effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80cdcde89901011600141303b5d01e4959fe8ca5cff206addfae8d5c09510007010001016c016a86b6f24570782162e81d3afbe2e522e514c124478f60156f9207225b49bbf1c6ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8094ebdc03010122002010ce2861c8e16d764de12cc98e740c2b9f1f95a2949da467425fb1759324b58fca010340075d8deab6b27b8ce75217e0c685e974a7f9ca31d75d658fa5a5a160baebc770724f18be7020ed978650cf86e1eb718569cacabe5c63fb0ace59af27652c3a01408cf6c9adcc13977a6ee7a8127eb2f2210edf8ee1afad225caba819c5baaa62c43d5c765ecc844c235ad489096de983fd0525f809ad857ad5d39064f7ade1380f46ae20b33e7965e602fe772c213dbe2fbba401a8f280cfb340176806403b821e2af9b32086b81eff9a41f9bb454e642443ef6b591eed99a3d58a62d0aebadfcb5634c8ba5252ad020149ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8090bcfd020122002010ce2861c8e16d764de12cc98e740c2b9f1f95a2949da467425fb1759324b58f00013cffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80d0a54c011600141303b5d01e4959fe8ca5cff206addfae8d5c095100'))
console.log(block.toObject())

```

Sign Transactions,
```javascript
let Bytom = require("bytomjs-lib")
const BN = Bytom.BN

let tx = new Bytom.bc.bcTx({
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