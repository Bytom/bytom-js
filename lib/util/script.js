'use strict';

let Opcode = require('./opcode');

const PayToWitnessPubKeyHashDataSize = 20
const PayToWitnessScriptHashDataSize = 32
function decompile(buffer) {
  let _buffer = buffer
  if(!Buffer.isBuffer(buffer)){
    _buffer = Buffer.from(buffer, 'hex')
  }

  const chunks = [];
  let i = 0;
  while (i < _buffer.length) {
    const inst = _parseOp(_buffer, i)

    chunks.push(inst)
    i = i +inst.length

  }
  return chunks
}

function _parseOp(prog, i) {
  const l = prog.length
  const opcode = prog[i];
  let inst = {}
  // data chunk
  inst.op = opcode;
  inst.length = 1
  if (opcode >= Opcode.OP_1 && opcode <= Opcode.OP_16) {
    inst.data = new Buffer(opcode - Opcode.OP_1 + 1)
    return inst
  }

  if (opcode >= Opcode.OP_DATA_1 && opcode <= Opcode.OP_DATA_75) {
    inst.length += opcode - Opcode.OP_DATA_1 + 1
    let end = i + inst.length;
    if (end > prog.length) {
      throw Error('short program')
    }
    inst.data = prog.slice(i + 1, end)
    return inst
  }

  if (opcode == Opcode.OP_PUSHDATA1) {
    if (i == l - 1) {
      throw Error('short program')
    }
    let n = prog.slice(i + 1, l)
    inst.length += (n) + 1
    let end = i + inst.length;
    inst.data = prog.slice(i + 2, end)
    return inst
  }
  if (opcode == Opcode.OP_PUSHDATA2) {
    if (buffer.length < 3 || i > l - 3) {
      throw Error('short program')
    }
    const nBuffer = prog.slice(i + 1, i + 3)
    let n = nBuffer.readUInt16LE(1).toString(16);
    inst.length += Number(n) + 2
    let end = i + inst.length
    inst.data = prog.slice(i + 3, end)
    return inst
  }
  if (opcode == Opcode.OP_PUSHDATA4) {
    if (buffer.length < 5 || i > l - 5) {
      throw Error('short program')
    }
    inst.length += 4

    const nBuffer = prog.slice(i + 1, i + 5)
    let n = nBuffer.readUInt32LE(3).toString(16);

    inst.length = inst.length + Number(n)
    let end = i + inst.length
    inst.data = prog.slice(i + 5, end)
    return inst
  }
  if (opcode == Opcode.OP_JUMP || opcode == Opcode.OP_JUMPIF) {
    inst.length += 4
    let end = i + inst.length
    inst.data = prog.slice(i + 1, end)
    return inst
  }
  return inst
}

exports.decompile = decompile;

// IsP2WPKHScript is used to determine whether it is a P2WPKH script or not
function isP2WPKHScript(insts) {
  if (insts.length != 2) {
    return false
  }
  if (insts[0].op > Opcode.OP_16) {
    return false
  }
  return insts[1].op == Opcode.OP_DATA_20 && insts[1].data.length == PayToWitnessPubKeyHashDataSize
}

exports.isP2WPKHScript = isP2WPKHScript;

// IsP2WSHScript is used to determine whether it is a P2WSH script or not
function isP2WSHScript(insts)  {
  if (insts.length != 2 ){
    return false
  }
  if (insts[0].op > Opcode.OP_16) {
    return false
  }
  return insts[1].op == Opcode.OP_DATA_32 && insts[1].data.length == PayToWitnessScriptHashDataSize
}

exports.isP2WSHScript = isP2WSHScript;
