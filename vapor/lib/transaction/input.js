let _ = require('lodash');
let BufferWriter = require('../../../lib/binary/writer.js');
let IssuanceInput = require('./issuanceInput.js')
let SpendInput = require('./spendInput.js')
let CoinbaseInput = require('./coinbaseInput.js')
let SpendCommitment = require('./spendcommitment.js')

const IssuanceInputType = '00'
const SpendInputType = '01'
const CoinbaseInputType = '02'

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
  if(inp instanceof IssuanceInput) {
    let assetID = inp.assetID()
    return {
      assetID,
      amount: inp.amount,
    }
  }else if( inp instanceof SpendInput){
    return inp.spendCommitment.assetAmount
  }
  return {}
}

Input.prototype.assetID = function() {
  let inp = this.typedInput
  if(inp instanceof IssuanceInput) {
    return inp.assetID()
  }
  else if( inp instanceof SpendInput){
    return inp.spendCommitment.assetId
  }
  return {}
}

Input.prototype.amount = function(){
  let inp = this.typedInput
  if(inp instanceof IssuanceInput) {
    return inp.amount
  }else if( inp instanceof SpendInput){
    return inp.spendCommitment.amount
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
      case IssuanceInputType:{
        let nonce = reader.readVarstr31();
        assetID = reader.read(32);
        let amount = new BN(reader.readVarint63());
        let ii = new IssuanceInput({
          nonce:           nonce,
          amount:          amount
        })
        input.typedInput = ii

        break
      }
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
    if(inp instanceof IssuanceInput) {
      inp.assetDefinition = reader.readVarstr31();
      inp.vmVersion = new BN(reader.readVarint63());
      inp.issuanceProgram = reader.readVarstr31();
      if (!_.isEqual(inp.assetID(), assetID.toString('hex'))) {
        throw Error('Bad AssetID')
      }
      inp.arguments = reader.readVarstrList();
    }else if(inp instanceof SpendInput){
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
  if (inp instanceof IssuanceInput) {
    w.write(new Buffer(IssuanceInputType, 'hex'));
    w.writeVarstr31(inp.nonce);
    let assetID = inp.assetID()
    w.write(new Buffer(assetID, 'hex'))
    w.writeVarint63(inp.amount)
  }else if (inp instanceof SpendInput){
    w.write(new Buffer(SpendInputType, 'hex'))
    return inp.spendCommitment.writeExtensibleString(w, inp.spendCommitmentSuffix, this.assetVersion)
  }else if(inp instanceof CoinbaseInput){
    w.write(new Buffer(CoinbaseInputType, 'hex'));
    w.writeVarstr31(inp.arbitrary);
  }

  return w
}

Input.prototype.writeInputWitness = function(w){
  if (this.assetVersion != 1) {
    return null
  }
  let inp = this.typedInput
  if (inp instanceof IssuanceInput) {
    w.writeVarstr31(inp.assetDefinition)
    w.writeVarint63(inp.vmVersion)
    w.writeVarstr31(inp.issuanceProgram)
    w.writeVarstrList(inp.arguments)
  }else if(inp instanceof SpendInput){
    w.writeVarstrList(inp.arguments)
  }
  return w
}

Input.newIssuanceInput = function(nonce, amount, issuanceProgram, args, assetDefinition) {
  return new Input({
    assetVersion: 1,
    typedInput: new IssuanceInput({
      nonce:           nonce,
      amount:          amount,
      assetDefinition: assetDefinition,
      vmVersion:       new BN(1),
      issuanceProgram: issuanceProgram,
      arguments:       args,
    })
  })
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

module.exports = Input;