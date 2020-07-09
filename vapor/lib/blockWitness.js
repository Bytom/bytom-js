let BlockWitness = function BlockWitness(arg) {
  if (!(this instanceof BlockWitness)) {
    return new BlockWitness(arg);
  }
  let info = arg;
  this.witness = info.witness

  return this;
};

BlockWitness.readFrom = function readFrom(br) {
  let info = {};
  info.witness = br.readVarstrList()
  return new BlockWitness(info)
}

BlockWitness.prototype.writeTo = function writeTo(bw){
  bw.writeVarstrList(this.witness);
  return bw
}

BlockWitness.prototype.set = function (index, data) {
  this.witness[index] = data
}

BlockWitness.prototype.delete = function (index) {
  if (this.witness.length > index) {
    this.witness[index] = null
  }
}

BlockWitness.prototype.get = function (index) {
  if (this.witness.length > index) {
    return this.witness[index]
  }
  return null
}

module.exports = BlockWitness;

