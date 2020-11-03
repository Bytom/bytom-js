let BN = require('bn.js')
let {decompile, isP2WPKHScript, isP2WSHScript} = require('./script.js')
let { encodeSegWitAddress } = require('./address')

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

function getAddressFromControlProgram(prog , isMainchain =true) {
    let netParams = 'vp'
    if( isMainchain ){
      netParams = 'bm'
    }
    let insts
    try{
      insts =  decompile(prog)
    }catch (e){
      return ""
    }

    if (insts && isP2WPKHScript(insts) ){
      let pubHash = insts[1].data;
      return encodeSegWitAddress(netParams, 0x00, pubHash)

    } else if (insts && isP2WSHScript(insts)) {
      let scriptHash = insts[1].data;
      return encodeSegWitAddress( netParams, 0x00, scriptHash)
    }
    return ""
}

module.exports = {
  convertBNtoN,
  getAddressFromControlProgram
}