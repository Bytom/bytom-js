
'use strict';

let bytomJs = module.exports;

// module information
bytomJs.version = 'v' + require('./package.json').version;
bytomJs.versionGuard = function(version) {
  if (version !== undefined) {
    let message = 'More than one instance of bytom-lib found. ' +
      'Please make sure to require bytom-lib and check that submodules do' +
      ' not also include their own bytom-lib dependency.';
    throw new Error(message);
  }
};
bytomJs.versionGuard(global._bytomJs);
global._bytomJs = bytomJs.version;

bytomJs.bytom = require('./bytom');
bytomJs.vapor = require('./vapor');
// binary
bytomJs.binary = {};
bytomJs.binary.BufferReader = require('./lib/binary/reader');
bytomJs.binary.BufferWriter = require('./lib/binary/writer');
bytomJs.binary.Varint = require('./lib/binary/varInt');

// dependencies, subject to change
bytomJs.deps = {};
bytomJs.deps.BN = require('bn.js');
bytomJs.deps.Buffer = Buffer;
bytomJs.deps._ = require('lodash');
