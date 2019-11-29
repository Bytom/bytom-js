"use strict";

let should = require("chai").should();
let bytom = require("../");

describe('#versionGuard', function() {
  it('global._bytom should be defined', function() {
    debugger
    should.equal(global._bytom, bytom.version);
  });

  it('throw an error if version is already defined', function() {
    (function() {
      bytom.versionGuard('version');
    }).should.throw('More than one instance of bytom');
  });
});