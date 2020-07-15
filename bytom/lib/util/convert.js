const CoinbaseInput = require('../transaction/coinbaseInput')
const BcSpend = require('../bc/spend')
const BcCoinbase = require('../bc/coinbase')
const BcIssurance = require('../bc/issurance')
const BTMAssetID = require('../../../lib/util/constance').BTMAssetID
const Opcode = require('../../../lib/util/opcode')
let {getAddressFromControlProgram} = require('../../../lib/util/convert')
let BN = require('bn.js');


function buildAnnotatedInput(tx, i) {
  let orig = tx.inputs[i].typedInput
  const inp = {}
  const spendCommitment = orig.spendCommitment.toObject()
  if (!(orig instanceof CoinbaseInput)) {
    let assetAmount = spendCommitment.assetAmount
    inp.assetID = assetAmount.assetID
    inp.amount = assetAmount.amount
    let signData = tx.Tx.sigHash(i)
    inp.signData = signData
  } else {
    inp.assetID = BTMAssetID
  }

  let id = tx.Tx.inputIDs[i]
  inp.inputID = id
  let e = tx.Tx.entries[id]
  if (e.typ() === BcSpend.prototype.typ()) {
    inp.type = "spend"
    let controlProgram = spendCommitment.controlProgram

    inp.address = getAddressFromControlProgram(controlProgram)
    inp.controlProgram = controlProgram
    inp.spentOutputID = e.spentOutputId
    inp.witnessArguments =[]

    let _arguments = orig.arguments
    for (let _arg of _arguments) {
      const arg = Buffer.isBuffer(_arg) ? _arg.toString('hex') : _arg
      inp.witnessArguments.push(arg)
    }
  } else if (e.typ() === BcIssurance.prototype.typ()) {
    inp.type = "issue"
    let issuanceProgram = spendCommitment.issuanceProgram
    inp.issuanceProgram = issuanceProgram

    let _arguments = orig.witnessArguments
    inp.witnessArguments =[]

    for (let _arg of _arguments) {
      const arg = Buffer.isBuffer(_arg) ? _arg.toString('hex') : _arg
      inp.witnessArguments.push(arg)
    }
    if(this.assetDefinition){
      inp.assetDefinition = this.assetDefinition.toString('hex')
    }
  } else if (e.typ() === BcCoinbase.prototype.typ()) {
    inp.type = "coinbase"
    inp.arbitrary = e.arbitrary
  }
  return inp
}

function buildAnnotatedOutput(tx, idx) {
  let orig = tx.outputs[idx]
  let outid = tx.Tx.txHeader.resultIDs[idx]
  const outputCommitment = orig.outputCommitment.toObject()

  let out = {
    outputID: outid,
    position: idx,
    assetID: outputCommitment.assetAmount.assetID,
    amount: outputCommitment.assetAmount.amount,
    controlProgram: outputCommitment.controlProgram,
    address: getAddressFromControlProgram(outputCommitment.controlProgram)
  }

  if(_isUnspendable(out.controlProgram)){
    out.type = 'retire'
  }else{
    out.type = 'control'
  }

  return out
}

function calculateTxFee(tx ) {
  let fee = new BN(0)
  for (let _input of tx.inputs ){
    const input = _input.typedInput.spendCommitment
    const _assetID = input.assetAmount.assetID
    const assetID = Buffer.isBuffer(_assetID)? _assetID.toString("hex"):_assetID
    if (assetID == BTMAssetID ){
      fee = fee.add(input.assetAmount.amount)
    }
  }

  for(let _output of tx.outputs ) {
    const output = _output.outputCommitment

    const _assetID = output.assetAmount.assetID
    const assetID = Buffer.isBuffer(_assetID)? _assetID.toString("hex"):_assetID
    if(assetID == BTMAssetID ){
      fee = fee.sub(output.assetAmount.amount)
    }
  }
  return fee
}

function _isUnspendable(prog) {
  return prog.length > 0 && prog[0] == Opcode.OP_FAIL
}

module.exports = {
  buildAnnotatedInput,
  buildAnnotatedOutput,
  calculateTxFee
}