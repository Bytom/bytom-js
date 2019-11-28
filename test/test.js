const blockchain = require('../lib/blockchain.js')
const test = require('tape')

test('test write Var Int 63', function(assert) {
  let expected = 12345678
  const buf = Buffer.allocUnsafe(4);
  buf.writeUInt32BE(0xcec2f105, 0);
  assert.deepEqual(blockchain.writeVarint63(expected), buf)
  assert.end()
})

test('test read Var Int 63', function(assert) {
  let expected = 12345678

  const buf = blockchain.writeVarint63(expected)
  assert.deepEqual(blockchain.readVarint63(buf), expected)
  assert.end()
})

function randint(range) {
  return Math.floor(Math.random() * range)
}