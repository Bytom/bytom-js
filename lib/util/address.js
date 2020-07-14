const bech32 = require('bech32')

function encodeSegWitAddress(hrp, witnessVersion, witnessProgram) {
  let prog = witnessProgram
  if(!Buffer.isBuffer(witnessProgram)){
    prog = Buffer.from(witnessProgram, 'hex')
  }

  const words = bech32.toWords(prog);
  words.unshift(witnessVersion);
  return bech32.encode(hrp, words);
}

exports.encodeSegWitAddress = encodeSegWitAddress;
