const newXKeys = require('./utils').newXKeys
const encrypt = require('./keystore').encryptKey
const decrypt = require('./keystore').decryptKey
const Core = require('./chainkd')
const Method = require('./createKey')

module.exports = {
  newXKeys,
  encrypt,
  decrypt,
  Core,
  Method
};
