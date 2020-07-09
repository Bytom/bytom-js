'use strict';


let Hash = module.exports;

Hash.newHash = function(hashString) {
  let hash = Buffer.concat([
      new BN(hashString.subString(0,8)).toBuffer('be',8),
      new BN(hashString.subString(8,16)).toBuffer('be',8),
      new BN(hashString.subString(16,24)).toBuffer('be',8),
      new BN(hashString.subString(24,32)).toBuffer('be',8)],32)
  return hash;
};
