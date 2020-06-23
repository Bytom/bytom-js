let BufferWriter = require('../../../lib/binary/writer.js');
let Entry = require('../bc/entry.js')
let IssuanceInput = require('./issuanceInput.js')
let SpendInput = require('./spendInput.js')
let CoinbaseInput = require('./coinbaseInput.js')
let Input = require('./input.js')
let Output = require('./output.js')
let bcIssuance = require('../bc/issurance.js')
let bcSpend = require('../bc/spend.js')
let bcCoinbase = require('../bc/coinbase.js')
let bcOutput= require('../bc/output.js')
let bcMux= require('../bc/mux.js')
let bcRetirement= require('../bc/retirement.js')
let bcTxHeader= require('../bc/txHeader.js')
let bcBlockHeader= require('../bc/blockHeader.js')
let bcTx= require('../bc/tx.js')
const BN = require('bn.js')

const OP_FAIL = 0x6a
const OP_TRUE = 0x51

const BTMAssetID = require('../../../lib/util/constance.js').BTMAssetID
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
  for(let id in entries){
    const e = entries[id]
    let ord

    if (e instanceof bcIssuance) {
      ord = e.ordinal
    }
    else if (e instanceof bcSpend) {
      ord = e.ordinal
      spentOutputIDs[e.spentOutputId] = true
      if (e.witnessDestination.value.assetId == BTMAssetID) {
        tx.gasInputIDs.push(id)
      }
    }
    else if (e instanceof bcCoinbase) {
      ord = 0
      tx.gasInputIDs.push(id)
    } else {
      continue
    }

    if (ord >= (oldTx.inputs.length)) {
      continue
    }
    tx.inputIDs[ord] = id
  }

  for(let id in spentOutputIDs) {
    tx.spentOutputIDs = tx.spentOutputIDs? tx.spentOutputIDs.push(id):[id]
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

  let spends = [], issuances =[], coinbase


  const inputLen = tx.inputs?tx.inputs.length:0
  let muxSources = new Array(inputLen)
  for (let i = 0; i < inputLen ; i++) {
    const input = tx.inputs[i]
    let inp = input.typedInput
    if(inp instanceof IssuanceInput) {
      let nonceHash = new Buffer(inp.nonceHash())
      let assetDefHash = new Buffer(inp.assetDefinitionHash())
      let value = input.assetAmount()

      let issuance = bcIssuance.newIssuance(nonceHash, value, new BN(i))
      issuance.witnessAssetDefinition = {
        data: assetDefHash,
        issuanceProgram: {
          vmVersion: inp.vmVersion,
          code: inp.issuanceProgram,
        },
      }
      issuance.witnessArguments = inp.arguments
      let issuanceID = addEntry(issuance)

      muxSources[i] = {
        ref: issuanceID,
        value: value,
        position: new BN(0)
      }

      issuances.push(issuance)
    } else if(inp instanceof SpendInput) {
      // create entry for prevout
      let prog = {vmVersion: inp.spendCommitment.vmVersion, code: inp.spendCommitment.controlProgram}
      let src = {
        ref: inp.spendCommitment.sourceID,
        value: inp.spendCommitment.assetAmount,
        position: inp.spendCommitment.sourcePosition,
      }
      let prevout = bcOutput.newOutput(src, prog, 0) // ordinal doesn't matter for prevouts, only for result outputs
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
    }else if(inp instanceof CoinbaseInput) {
      coinbase = bcCoinbase.newCoinbase(inp.arbitrary)
      let coinbaseID = addEntry(coinbase)

      let out = tx.outputs[0]
      muxSources[i] = {
        ref: coinbaseID,
        value: out.outputCommitment.assetAmount,
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
  for (let issuance of issuances) {
    issuance.setDestination(muxID, issuance.value, issuance.ordinal)
  }

  if (coinbase != null ){
    coinbase.setDestination(muxID, mux.sources[0].value, 0)
  }

  // convert types.outputs to the bc.output
  let resultIDs = []
  const outputLen = tx.outputs?tx.outputs.length:0

  for(let i = 0; i < outputLen; i++ ){
    const out = tx.outputs[i]
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
    } else {
      // non-retirement
      let prog = { vmVersion:out.outputCommitment.vmVersion, controlProgram: out.outputCommitment.controlProgram}
      let o = bcOutput.newOutput(src, prog, new BN(i))
      resultID = addEntry(o)
    }

    let dest = {
      value:    src.value,
      ref:     resultID,
      position: 0,
    }
    resultIDs.push(resultID)
    mux.witnessDestinations = (Array.isArray(mux.witnessDestinations)? mux.witnessDestinations.push(dest): [dest])
  }

  let h = bcTxHeader.newTxHeader(tx.version, tx.serializedSize, tx.timeRange, resultIDs)
  return {headerID: addEntry(h), hdr: h, entryMap}
}

function _isUnspendable(prog)  {
  return prog && prog.length > 0 && prog[0] == OP_FAIL
}

function mapBlockHeader(oldBlockHeader) {
  let bh = bcBlockHeader.newblockHeader(oldBlockHeader.version, oldBlockHeader.height, oldBlockHeader.previousBlockHash, oldBlockHeader.timestamp, oldBlockHeader.blockCommitment.transactionsMerkleRoot, oldBlockHeader.blockCommitment.transactionStatusHash, oldBlockHeader.nonce, oldBlockHeader.bits)
  return {entryID: Entry.entryID(bh), blockheader: bh}
}

module.exports = {
  mapTx,
  mapBlockHeader
}
