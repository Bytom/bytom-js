//txoutput.go

'use strict';

let _ = require('lodash');
let BN = require('bn.js');
let BufferWriter = require('../../../lib/binary/writer');
let OutputCommitment = require('./outputcommitment.js')
let CrossChainOutput = require('./crosschainOutput.js')
let IntraChainOutput = require('./intraChainOutput.js')
let BcIntraChainOutput = require('../bc/intrachainOutput.js')
let VoteOutput = require('./voteOutput')
let BcVoteOutput = require('../bc/voteOutput')
let Entry = require('../bc/entry.js')


const IntraChainOutputType = '00'
const CrossChainOutputType = '01'
const VoteOutputType = '02'

const SpendInputType = '01'
const VetoInputType = '03'

function Output(args) {
  if (!(this instanceof Output)) {
    return new Output(args);
  }

  let info = args;
  this.assetVersion = info.assetVersion;
  this.commitmentSuffix = info.commitmentSuffix;
  this.typedOutput = info.typedOutput

  return this;

}

Output.newCrossChainOutput = function (assetID, amount, controlProgram) {
  return new Output({
    assetVersion: 1,
    typedOutput: new CrossChainOutput({
      outputCommitment: OutputCommitment({
        assetAmount: {
          assetID: new Buffer(assetID, 'hex'),
          amount: amount
        },
        vmVersion: new BN(1),
        controlProgram
      })
    })
  })
}

Output.newIntraChainOutput = function (assetID, amount, controlProgram) {
  return new Output({
    assetVersion: 1,
    typedOutput: new IntraChainOutput({
      outputCommitment: OutputCommitment({
        assetAmount: {
          assetID: new Buffer(assetID, 'hex'),
          amount: amount
        },
        vmVersion: new BN(1),
        controlProgram
      })
    })
  })
}

Output.newVoteOutput = function (assetID, amount, controlProgram, vote) {
  return new Output({
    assetVersion: 1,
    typedOutput: new VoteOutput({
      outputCommitment: OutputCommitment({
        assetAmount: {
          assetID: new Buffer(assetID, 'hex'),
          amount: amount
        },
        vmVersion: new BN(1),
        controlProgram
      }),
      vote
    })
  })
}

Output.prototype.outputCommitment = function () {
  let outp = this.typedOutput

  if (outp instanceof IntraChainOutput) {
    return outp.outputCommitment
  } else if (outp instanceof CrossChainOutput) {
    return outp.outputCommitment
  } else if (outp instanceof VoteOutput) {
    return outp.outputCommitment
  }
  return new OutputCommitment()
}

Output.prototype.assetAmount = function () {
  let outp = this.typedOutput
  if (outp instanceof IntraChainOutput) {
    return outp.assetAmount
  } else if (outp instanceof CrossChainOutput) {
    return outp.assetAmount
  } else if (outp instanceof VoteOutput) {
    return outp.assetAmount
  }
  return {}
}

Output.prototype.controlProgram = function () {
  let outp = this.typedOutput
  if (outp instanceof IntraChainOutput) {
    return outp.controlProgram
  } else if (outp instanceof CrossChainOutput) {
    return outp.controlProgram
  } else if (outp instanceof VoteOutput) {
    return outp.controlProgram
  }
  return ''
}

Output.prototype.vmVersion = function () {
  let outp = this.typedOutput
  if (outp instanceof IntraChainOutput) {
    return outp.vmVersion
  } else if (outp instanceof CrossChainOutput) {
    return outp.vmVersion
  } else if (outp instanceof VoteOutput) {
    return outp.vmVersion
  }
  return 0
}

Output.fromObject = function (data) {
  return new Output(data);
};

Output.prototype.toObject = Output.prototype.toJSON = function toObject() {
  let obj = {
    assetVersion: this.assetVersion,
    commitmentSuffix: this.commitmentSuffix,
    typedOutput: this.typedOutput.toObject()
  };
  return obj;
};


Output.readFrom = function (br) {
  let output = new Output({});
  output.assetVersion = Number(br.readVarint63());

  output.commitmentSuffix = br.readExtensibleString(function (reader) {
    if (output.assetVersion != 1) {
      return undefined
    }
    let outType = reader.read(1).toString('hex')
    switch (outType) {
      case IntraChainOutputType: {
        const commitmentSuffix = OutputCommitment.readFrom(reader, output)
        output.typedOutput.commitmentSuffix = commitmentSuffix
        output.typedOutput = new IntraChainOutput(output.typedOutput);

        break
      }
      case CrossChainOutputType: {
        const commitmentSuffix = OutputCommitment.readFrom(reader, output)
        output.typedOutput.commitmentSuffix = commitmentSuffix
        output.typedOutput = new CrossChainOutput(output.typedOutput);

        break
      }
      case VoteOutputType: {
        const vote =  reader.readVarstr31();
        const commitmentSuffix = OutputCommitment.readFrom(reader, output);
        output.typedOutput.commitmentSuffix = commitmentSuffix;
        output.typedOutput.vote = vote;
        output.typedOutput = new VoteOutput(output.typedOutput);

        break
      }
      default:
        return new Error("unsupported output type " + outType)
    }
    return undefined
  })
  // read and ignore the (empty) output witness
  br.readVarstr31()
  return output;
};

Output.prototype.writeTo = function (writer) {
  if (!writer) {
    writer = new BufferWriter();
  }
  writer.writeVarint63(this.assetVersion);
  const w = new BufferWriter()
  writer.writeExtensibleString(this.commitmentSuffix, this.writeOutputCommitment(w));
  writer.writeVarstr31('')
  return writer;
};


Output.prototype.writeOutputCommitment = function (w) {
  if (this.assetVersion != 1) {
    return null
  }

  let outp = this.typedOutput
  if (outp instanceof IntraChainOutput) {
    w.write(new Buffer(IntraChainOutputType, 'hex'));
    return outp.outputCommitment.writeExtensibleString(w, outp.spendCommitmentSuffix, this.assetVersion)
  } else if (outp instanceof CrossChainOutput) {
    w.write(new Buffer(CrossChainOutputType, 'hex'));
    return outp.outputCommitment.writeExtensibleString(w, outp.spendCommitmentSuffix, this.assetVersion)
  } else if (outp instanceof VoteOutput) {
    w.write(new Buffer(VoteOutputType, 'hex'));
    w.writeVarstr31(outp.vote);
    return outp.outputCommitment.writeExtensibleString(w, outp.spendCommitmentSuffix, this.assetVersion)
  }

  return w
}

Output.computeOutputID = function (sc, inputType, vote) {


  let src = {
    ref: sc.sourceID,
    value: sc.assetAmount,
    position: sc.sourcePosition,
  }
  let o
  switch (inputType) {
    case SpendInputType:
      o = BcIntraChainOutput.newIntraChainOutput(src, {vmVersion: sc.vmVersion, code: sc.controlProgram}, 0);
      break;
    case VetoInputType:
      o = BcVoteOutput.newVoteOutput(src, {vmVersion: sc.vmVersion, code: sc.controlProgram}, 0, vote)
      break;
    default:
      return new Error("Input type error:" + inputType)
  }

  let h = Entry.entryID(o)
  return h
}

module.exports = Output;