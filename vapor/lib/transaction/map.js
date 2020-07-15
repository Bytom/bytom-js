let Entry = require('../bc/entry.js')
let SpendInput = require('./spendInput.js')
let CoinbaseInput = require('./coinbaseInput.js')
let VetoInput = require('./vetoInput.js')
let CrossChainInput = require('./crosschainInput.js')
let bcSpend = require('../bc/spend.js')
let bcCrossChainInput = require('../bc/crosschainInput.js')
let bcCrossChainOutput = require('../bc/crosschainOutput.js')
let bcCoinbase = require('../bc/coinbase.js')
let bcIntrachainOutput = require('../bc/intrachainOutput.js')
let bcVetoInput = require('../bc/vetoInput.js')
let bcOutput= require('../bc/output.js')
let bcVoteOutput= require('../bc/voteOutput.js')
let bcMux= require('../bc/mux.js')
let bcRetirement= require('../bc/retirement.js')
let bcTxHeader= require('../bc/txHeader.js')
let bcBlockHeader= require('../bc/blockHeader.js')
let bcTx= require('../bc/tx.js')
const BN = require('bn.js')

const OP_FAIL = 0x6a
const OP_TRUE = 0x51

const BTMAssetID = require('../../../lib/util/constance.js').BTMAssetID
const sha3_256 = require( "js-sha3").sha3_256

const IntraChainOutputType = '00'
const CrossChainOutputType = '01'
const VoteOutputType = '02'

// MapTx converts a types TxData object into its entries-based
// representation.
function mapTx(oldTx) {
  let objectTx = _mapTx(oldTx)
  let txID = objectTx.headerID, txHeader = objectTx.hdr, entries= objectTx.entryMap
  let tx = {
    txHeader: txHeader,
    id:       txID,
    entries:  entries,
    inputIDs: new Array(oldTx.inputs?oldTx.inputs.length:0),
    gasInputIDs:[]
  }

  let spentOutputIDs = new Object()
  let mainchainOutputIDs = new Object()
  for(let id in entries){
    const e = entries[id]
    let ord

    if (e instanceof bcSpend) {
      ord = e.ordinal
      spentOutputIDs[e.spentOutputId] = true
      let assetId = e.witnessDestination.value.assetID
      assetId = Buffer.isBuffer(assetId)? assetId.toString("hex"):assetId
      if (assetId == BTMAssetID) {
        tx.gasInputIDs.push(id)
      }
    }
    else if (e instanceof bcVetoInput) {
      ord = e.ordinal
      spentOutputIDs[e.spentOutputId] = true
      let assetId = e.witnessDestination.value.assetID
      assetId = Buffer.isBuffer(assetId)? assetId.toString("hex"):assetId
      if (assetId == BTMAssetID) {
        tx.gasInputIDs.push(id)
      }
    }
    else if (e instanceof bcCrossChainInput) {
      ord = e.ordinal
      mainchainOutputIDs[e.mainchainOutputId] = true
      let assetId = e.witnessDestination.value.assetID
      assetId = Buffer.isBuffer(assetId)? assetId.toString("hex"):assetId
      if (assetId == BTMAssetID) {
        tx.gasInputIDs.push(id)
      }
    }
    else if (e instanceof bcCoinbase) {
      ord = 0
      tx.gasInputIDs.push(id)
    } else {
      continue
    }

    if (ord < (oldTx.inputs.length)) {
      tx.inputIDs[ord] = id
    }
  }

  tx.spentOutputIDs =[]
  tx.mainchainOutputIDs =[]

  for(let id in spentOutputIDs) {
    tx.spentOutputIDs.push(id)
  }

  for(let id in mainchainOutputIDs) {
    tx.mainchainOutputIDs.push(id)
  }

  return new bcTx(tx)
}

function _mapTx(tx) {
  let entryMap = new Object();
  const addEntry = function(e) {
    let id = Entry.entryID(e)
    entryMap[id] = e
    return id
  }

  let spends = [], vetoInputs =[],crossIns =[], coinbase


  const inputLen = tx.inputs?tx.inputs.length:0
  let muxSources = new Array(inputLen)
  for (let i = 0; i < inputLen ; i++) {
    const input = tx.inputs[i]
    let inp = input.typedInput
    if(inp instanceof SpendInput) {
      // create entry for prevout
      let prog = {vmVersion: inp.spendCommitment.vmVersion, code: inp.spendCommitment.controlProgram}
      let src = {
        ref: inp.spendCommitment.sourceID,
        value: inp.spendCommitment.assetAmount,
        position: inp.spendCommitment.sourcePosition,
      }
      let prevout = bcIntrachainOutput.newIntraChainOutput(src, prog, 0) // ordinal doesn't matter for prevouts, only for result outputs
      let prevoutID = addEntry(prevout)
      // create entry for spend
      let spend = bcSpend.newSpend(prevoutID, new BN(i))
      spend.witnessArguments = inp.arguments
      let spendID = addEntry(spend)
      // setup mux
      muxSources[i] = {
        ref: spendID,
        value: inp.spendCommitment.assetAmount,
        position: new BN(0)
      }

      spends.push(spend)
    }else if(inp instanceof VetoInput) {
      // create entry for prevout
      let prog = {vmVersion: inp.spendCommitment.vmVersion, code: inp.spendCommitment.controlProgram}
      let src = {
        ref: inp.spendCommitment.sourceID,
        value: inp.spendCommitment.assetAmount,
        position: inp.spendCommitment.sourcePosition,
      }
      let prevout = bcVoteOutput.newVoteOutput(src, prog, 0, inp.vote) // ordinal doesn't matter for prevouts, only for result outputs
      let prevoutID = addEntry(prevout)


      // create entry for VetoInput
      let vetoInput = bcVetoInput.newVetoInput(prevoutID, new BN(i))
      vetoInput.witnessArguments = inp.arguments
      let vetoVoteID = addEntry(vetoInput)
      // setup mux

      muxSources[i] = {
        ref: vetoVoteID,
        value: inp.spendCommitment.assetAmount,
        position: new BN(0)
      }

      vetoInputs.push(vetoInput)
    }else if(inp instanceof CrossChainInput) {
      // create entry for prevout
      let prog = {vmVersion: inp.spendCommitment.vmVersion, code: inp.spendCommitment.controlProgram}
      let src = {
        ref: inp.spendCommitment.sourceID,
        value: inp.spendCommitment.assetAmount,
        position: inp.spendCommitment.sourcePosition,
      }
      let prevout = bcIntrachainOutput.newIntraChainOutput(src, prog, 0) // ordinal doesn't matter for prevouts, only for result outputs
      let mainchainOutputID = addEntry(prevout)

      let assetDefHash = sha3_256.array(Buffer.from(inp.assetDefinition,'hex'))
      let assetDef = {
          data: assetDefHash,
          issuanceProgram: {
            vmVersion: inp.issuanceVMVersion,
            code:      inp.issuanceProgram,
          },
      }

      let crossIn = bcCrossChainInput.newCrossChainInput(mainchainOutputID, prog, new BN(i), assetDef, inp.assetDefinition)
      crossIn.witnessArguments = inp.arguments
      let crossInID = addEntry(crossIn)
      muxSources[i] ={
        ref:   crossInID,
        value: inp.spendCommitment.assetAmount,
        position: new BN(0)
      }
      crossIns.push(crossIn)
    }else if(inp instanceof CoinbaseInput) {
      coinbase = bcCoinbase.newCoinbase(inp.arbitrary)
      let coinbaseID = addEntry(coinbase)
      let totalAmount = new BN(0)

      for(let out of tx.outputs){
        totalAmount  = totalAmount.add(new BN(out.typedOutput.outputCommitment.assetAmount.amount))
      }
      muxSources[i] = {
        ref: coinbaseID,
        value:{
          AssetId: BTMAssetID,
          Amount:  totalAmount,
        },
        position: new BN(0)
      }
    }
  }

  let mux = bcMux.newMux(muxSources, {vmVersion: new BN(1), code: Buffer.from([OP_TRUE])})

  let muxID = addEntry(mux)
  // connect the inputs to the mux
  for (let spend of spends ){
    let spentOutput = entryMap[spend.spentOutputId]
    spend.setDestination(muxID, spentOutput.source.value, spend.ordinal)
  }

  for (let vetoInput of vetoInputs ){
    let voteOutput = entryMap[vetoInput.spentOutputId]
    vetoInput.setDestination(muxID, voteOutput.source.value, vetoInput.ordinal)
  }
  for (let crossIn of crossIns) {
    let mainchainOutputId = entryMap[crossIn.mainchainOutputId]
    crossIn.setDestination(muxID, mainchainOutputId.source.value, crossIn.ordinal)
  }

  if (coinbase != null ){
    coinbase.setDestination(muxID, mux.sources[0].value, 0)
  }

  // convert types.outputs to the bc.output
  let resultIDs = []
  const outputLen = tx.outputs?tx.outputs.length:0

  for(let i = 0; i < outputLen; i++ ){
    const out = tx.outputs[i].typedOutput
    let src = {
      ref:      muxID,
        value:    out.outputCommitment.assetAmount,
        position: new BN(i),
    }
    let resultID

    if (_isUnspendable(out.outputCommitment.controlProgram)) {
      // retirement
      let r = bcRetirement.newRetirement(src, new BN(i))
      resultID = addEntry(r)
    } else if( out.outputType() === IntraChainOutputType){
      // non-retirement
      let prog = { vmVersion:out.outputCommitment.vmVersion, code: out.outputCommitment.controlProgram}
      let o = bcIntrachainOutput.newIntraChainOutput(src, prog, new BN(i))
      resultID = addEntry(o)
    }else if( out.outputType() === CrossChainOutputType){
      // non-retirement
      let prog = { vmVersion:out.outputCommitment.vmVersion, code: out.outputCommitment.controlProgram}
      let o = bcCrossChainOutput.newCrossChainOutput(src, prog, new BN(i))
      resultID = addEntry(o)
    }else if( out.outputType() === VoteOutputType){
      // non-retirement
      let voteOut = out
      let prog = { vmVersion:out.outputCommitment.vmVersion, code: out.outputCommitment.controlProgram}
      let o = bcVoteOutput.newVoteOutput(src, prog, new BN(i), voteOut.vote)
      resultID = addEntry(o)
    }else{
      throw 'unknown outType.'
    }

    let dest = {
      value:    src.value,
      ref:     resultID,
      position: 0,
    }
    resultIDs.push(resultID)
    if(Array.isArray(mux.witnessDestinations)){
      mux.witnessDestinations.push(dest)
    }else{
      mux.witnessDestinations = [dest]
    }
  }

  let h = bcTxHeader.newTxHeader(tx.version, tx.serializedSize, tx.timeRange, resultIDs)
  return {headerID: addEntry(h), hdr: h, entryMap}
}

function _isUnspendable(prog)  {
  return prog && prog.length > 0 && prog[0] == OP_FAIL
}

function mapBlockHeader(old) {
  let bh = bcBlockHeader.newblockHeader(old.version, old.height, old.previousBlockHash, old.timestamp, old.transactionsMerkleRoot, old.transactionStatusHash, old.witness)
  return {entryID: Entry.entryID(bh), blockheader: bh}
}

module.exports = {
  mapTx,
  mapBlockHeader
}
