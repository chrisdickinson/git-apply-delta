module.exports = apply_delta

var Buffer = require('buffer').Buffer
  , varint = require('varint')
  , vi = varint()

// we use writeUint[8|32][LE|BE] instead of indexing
// into buffers so that we get buffer-browserify compat.
var OFFSET_BUFFER = new Buffer(4)
  , LENGTH_BUFFER = new Buffer(4)

function apply_delta(delta, target) {
  var base_size_info = {size: null, buffer: null}
    , resized_size_info = {size: null, buffer: null}
    , output_buffer
    , out_idx
    , command
    , len
    , idx

  delta_header(delta, base_size_info)
  delta_header(base_size_info.buffer, resized_size_info)

  delta = resized_size_info.buffer

  idx =
  out_idx = 0
  output_buffer = new Buffer(resized_size_info.size)

  len = delta.length

  while(idx < len) {
    command = delta.readUInt8(idx++)
    command & 0x80 ? copy() : insert()    
  }

  return output_buffer

  function copy() {
    OFFSET_BUFFER.writeUInt32LE(0, 0)
    LENGTH_BUFFER.writeUInt32LE(0, 0)

    var check = 1
      , length
      , offset

    for(var x = 0; x < 4; ++x) {
      if(command & check) {
        OFFSET_BUFFER.writeUInt8(delta.readUInt8(idx++), 3 - x)
      }
      check <<= 1
    }

    for(var x = 0; x < 3; ++x) {
      if(command & check) {
        LENGTH_BUFFER.writeUInt8(delta.readUInt8(idx++), 3 - x)
      }
      check <<= 1
    }
    LENGTH_BUFFER[0] = 0

    length = LENGTH_BUFFER.readUInt32BE(0) || 0x10000
    offset = OFFSET_BUFFER.readUInt32BE(0)

    target.copy(output_buffer, out_idx, offset, offset + length)
    out_idx += length
  }

  function insert() {
    delta.copy(output_buffer, out_idx, idx, command + idx)
    idx += command
    out_idx += command
  }
}

function delta_header(buf, output) {
  var done = false
    , idx = 0
    , size = 0

  vi.once('data', function(s) {
    size = s
    done = true
  })

  do {
    vi.write(buf.readUInt8(idx++))
  } while(!done)

  output.size = size
  output.buffer = buf.slice(idx) 
}
