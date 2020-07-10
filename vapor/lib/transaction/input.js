let _ = require('lodash');
let BufferWriter = require('../../../lib/binary/writer.js');
let SpendInput = require('./spendInput.js')
let CoinbaseInput = require('./coinbaseInput.js')
let CrossChainInput = require('./crosschainInput.js')
let SpendCommitment = require('./spendcommitment.js')
let VetoInput = require('./vetoInput.js')

const CrossChainInputType = '00'
const SpendInputType = '01'
const CoinbaseInputType = '02'
const VetoInputType = '03'

let BN = require('bn.js');
let {convertBNtoN} = require('../../../lib/util/convert')


function Input(params) {
  if (!(this instanceof Input)) {
    return new Input(params);
  }
  if (params) {
    return this._fromObject(params);
  }
}

Input.fromObject = function(obj) {
  if (!_.isObject(obj)){throw Error('Type must be an Object')};
  let input = new Input();
  return input._fromObject(obj);
};

Input.prototype._fromObject = function(params) {
  this.assetVersion = params.assetVersion
  this.typedInput = params.typedInput
  this.commitmentSuffix = params.commitmentSuffix
  this.witnessSuffix = params.witnessSuffix

  return this;
};

Input.prototype.toObject = Input.prototype.toJSON = function toObject() {
  let obj = {
    assetVersion: this.assetVersion,
    typedInput: this.typedInput.toObject(),
    commitmentSuffix: this.commitmentSuffix,
    witnessSuffix: this.witnessSuffix
  };
  return obj;
};

Input.prototype.assetAmount = function(){
  let inp = this.typedInput
  if( inp instanceof SpendInput){
    return inp.spendCommitment.assetAmount
  }else if( inp instanceof CrossChainInput){
    return inp.spendCommitment.assetAmount
  }else if( inp instanceof VetoInput){
    return inp.spendCommitment.assetAmount
  }
  return {}
}

Input.prototype.assetID = function() {
  let inp = this.typedInput
  if( inp instanceof SpendInput){
    return inp.spendCommitment.assetAmount.assetID
  }else if( inp instanceof CrossChainInput){
    return inp.spendCommitment.assetAmount.assetID
  }else if( inp instanceof VetoInput){
    return inp.spendCommitment.assetAmount.assetID
  }
  return ''
}

Input.prototype.amount = function(){
  let inp = this.typedInput
  if(inp instanceof SpendInput) {
    return inp.spendCommitment.assetAmount.amount
  }else if( inp instanceof CrossChainInput){
    return inp.spendCommitment.assetAmount.amount
  }else if( inp instanceof VetoInput){
    return inp.spendCommitment.assetAmount.amount
  }
  return 0
}

Input.readFrom = function(br) {
  let input = new Input();
  input.assetVersion = Number(br.readVarint63());

  let assetID
  input.commitmentSuffix = br.readExtensibleString(function(reader) {
    if (input.assetVersion != 1) {
      return undefined
    }
    let icType = reader.read(1).toString('hex')
    switch (icType) {
      case SpendInputType:{
        let spendCommitment ={
          assetAmount:{}
        }
        let spendCommitmentSuffix = SpendCommitment.readFrom(reader, 1, spendCommitment);
        let si = new SpendInput({
          spendCommitmentSuffix,
          spendCommitment: new SpendCommitment(spendCommitment)
        })
        input.typedInput = si
        break
      }
      case CoinbaseInputType:{
        let arbitrary = reader.readVarstr31();
        let ci = new CoinbaseInput({
          arbitrary
        })
        input.typedInput = ci
        break
      }
      case CrossChainInputType:{
        let spendCommitment ={
          assetAmount:{}
        }
        let spendCommitmentSuffix = SpendCommitment.readFrom(reader, 1, spendCommitment);
        let issuanceVMVersion = reader.readVarint63();
        let assetDefinition = reader.readVarstr31();
        let issuanceProgram = reader.readVarstr31();
        let ci = new CrossChainInput({
          spendCommitmentSuffix,
          spendCommitment: new SpendCommitment(spendCommitment),
          issuanceVMVersion,
          assetDefinition,
          issuanceProgram
        })
        input.typedInput = ci
        break
      }
      case VetoInputType:{
        let spendCommitment ={
          assetAmount:{}
        }
        let vetoCommitmentSuffix = SpendCommitment.readFrom(reader, 1, spendCommitment);
        let vote = reader.readVarstr31();

        let vi = new VetoInput({
          vetoCommitmentSuffix,
          spendCommitment: new SpendCommitment(spendCommitment),
          vote
        })
        input.typedInput = vi
        break
      }
      default:
        return new Error("unsupported input type " + icType)
    }
    return undefined
  })

  input.witnessSuffix = br.readExtensibleString(function(reader) {
    if (input.assetVersion != 1) {
      return undefined
    }

    let inp = input.typedInput
    if(inp instanceof SpendInput){
      inp.arguments = reader.readVarstrList();
    }else if(inp instanceof CrossChainInput){
      inp.arguments = reader.readVarstrList();
    }else if(inp instanceof VetoInput){
      inp.arguments = reader.readVarstrList();
    }
      return undefined
    })

  return input;
};

Input.prototype.writeTo = function(writer) {
  if (!writer) {
    writer = new BufferWriter();
  }

  writer.writeVarint63(this.assetVersion);

  const w = new BufferWriter()
  writer.writeExtensibleString(this.commitmentSuffix, this.writeInputCommitment(w));

  const w2 = new BufferWriter()
  writer.writeExtensibleString(this.witnessSuffix, this.writeInputWitness(w2))
  return writer;
};


Input.prototype.writeInputCommitment = function(w) {
  if (this.assetVersion != 1) {
    return null
  }

  let inp = this.typedInput
  if (inp instanceof SpendInput){
    w.write(new Buffer(SpendInputType, 'hex'))
    return inp.spendCommitment.writeExtensibleString(w, inp.spendCommitmentSuffix, this.assetVersion)
  }else if(inp instanceof CoinbaseInput){
    w.write(new Buffer(CoinbaseInputType, 'hex'));
    w.writeVarstr31(inp.arbitrary);
  }else if (inp instanceof CrossChainInput){
    w.write(new Buffer(CrossChainInputType, 'hex'))
    inp.spendCommitment.writeExtensibleString(w, inp.spendCommitmentSuffix, this.assetVersion)
    w.writeVarint63(inp.issuanceVMVersion)
    w.writeVarstr31(inp.assetDefinition);
    w.writeVarstr31(inp.issuanceProgram);
  }else if (inp instanceof VetoInput){
    w.write(new Buffer(VetoInputType, 'hex'))
    inp.spendCommitment.writeExtensibleString(w, inp.spendCommitmentSuffix, this.assetVersion)
    w.writeVarstr31(inp.vote);
  }

  return w
}

Input.prototype.writeInputWitness = function(w){
  if (this.assetVersion != 1) {
    return null
  }
  let inp = this.typedInput
  if(inp instanceof SpendInput){
    w.writeVarstrList(inp.arguments)
  }else if(inp instanceof CrossChainInput){
    w.writeVarstrList(inp.arguments)
  }else if(inp instanceof VetoInput){
    w.writeVarstrList(inp.arguments)
  }
  return w
}


Input.newSpendInput = function(args, sourceID, assetID , amount, sourcePos, controlProgram) {
  let sc = new SpendCommitment({
    assetAmount: {
      assetID: assetID,
      amount:  amount,
    },
      sourceID:       sourceID,
      sourcePosition: sourcePos,
      vmVersion:      new BN(1),
      controlProgram: controlProgram,
  })
  return new Input({
      assetVersion: 1,
      typedInput: new SpendInput({
        spendCommitment: sc,
        arguments:       args,
    }),
  })
}

Input.newCoinbaseInput = function(arbitrary) {
  return new Input({
    assetVersion: 1,
    typedInput:   new CoinbaseInput({arbitrary: arbitrary}),
  })
}

Input.newCrossChainInput= function(args, sourceID, assetID, amount, sourcePos, issuanceVMVersion, assetDefinition, issuanceProgram ) {
  let sc = new SpendCommitment({
    assetAmount: {
      assetID: assetID,
      amount:  amount,
    },
      sourceID:       sourceID,
      sourcePosition: sourcePos,
      vmVersion:      new BN(1)
  })
  return new Input({
    assetVersion: 1,
    typedInput: new CrossChainInput({
      spendCommitment:   sc,
      arguments:         args,
      assetDefinition:   assetDefinition,
      issuanceVMVersion: issuanceVMVersion,
      issuanceProgram:   issuanceProgram,
    })
  })
}

Input.newVetoInput = function(args, sourceID, assetID , amount, sourcePos, controlProgram, vote) {
  let sc = new SpendCommitment({
    assetAmount: {
      assetID: assetID,
      amount:  amount,
    },
    sourceID:       sourceID,
    sourcePosition: sourcePos,
    vmVersion:      new BN(1),
    controlProgram: controlProgram,
  })
  return new Input({
    assetVersion: 1,
    typedInput: new VetoInput({
      spendCommitment: sc,
      arguments:       args,
      vote:            vote,
    }),
  })
}


module.exports = Input;