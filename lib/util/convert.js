let BN = require('bn.js')

function convertBNtoN(val){
  if(BN.isBN(val)){
    if(val.gt(new BN(Number.MAX_SAFE_INTEGER))){
      return val.toString(10)
    }else{
      return val.toNumber()
    }
  }else{
    return val
  }
}

module.exports = {
  convertBNtoN
}