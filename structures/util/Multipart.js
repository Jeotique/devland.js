const MultiStream = require('multistream');
const Duplex = require('stream').Duplex;
class Multipart
{
  constructor()
  {
    this.start = '----------------------------devland';
    this.buffers = [];
  }
  append(key, data, name)
  {
    let init = `--${this.start}\r\nContent-Disposition: form-data; name="${key}";`;
    if(name)
    {
      init += ` filename="${name}"`;
    }
    if(data instanceof Buffer)
    {
      init += '\r\nContent-Type: application/octet-stream';
    }
    else if(typeof data === 'object')
    {
      init += '\r\nContent-type: application/json';
      data = Buffer.from(JSON.stringify(data));
    }
    else
    {
      data = Buffer.from('' + data);
    }
    this.buffers.push(Buffer.from(`${init}\r\n\r\n`));
    this.buffers.push(data);
  }
  end()
  {
    this.buffers.push(Buffer.from(`\r\n--${this.start}--`));
  }
  _buffToStream(buffer)
  {
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
  toStream()
  {
    let streams = [];
    this.buffers.forEach(buffer => streams.push(this._buffToStream(buffer)));
    return MultiStream(streams);
  }
}