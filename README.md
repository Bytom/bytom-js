Bytom Library
=======
[![NPM Package](https://img.shields.io/npm/v/bytomjs-lib.svg?style=flat-square)](https://www.npmjs.com/package/bytomjs-lib)

A pure and powerful JavaScript Bytom library.

## Examples
Decode Raw Transactions,
```javascript

let block= Block.readFrom(BufferReader('BLockHash'))
console.log(block.toObject())

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