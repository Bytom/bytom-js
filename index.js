
'use strict';

let bytom = module.exports;

// module information
bytom.version = 'v' + require('./package.json').version;
bytom.versionGuard = function(version) {
  if (version !== undefined) {
    let message = 'More than one instance of bytom-lib found. ' +
      'Please make sure to require bytom-lib and check that submodules do' +
      ' not also include their own bytom-lib dependency.';
    throw new Error(message);
  }
};
bytom.versionGuard(global._bytom);
global._bytom = bytom.version;

// binary
bytom.binary = {};
bytom.binary.BufferReader = require('./lib/binary/reader');
bytom.binary.BufferWriter = require('./lib/binary/writer');
bytom.binary.Varint = require('./lib/binary/varInt');

// main bitcoin library
bytom.Block = require('./lib/block');
bytom.BlockHeader = require('./lib/blockheader');
bytom.BlockCommitment = require('./lib/blockcommitment');
bytom.Transaction = require('./lib/transaction');
bytom.bc = require('./lib/bc');

// dependencies, subject to change
bytom.deps = {};
bytom.deps.BN = require('bn.js');
bytom.deps.Buffer = Buffer;
bytom.deps._ = require('lodash');
