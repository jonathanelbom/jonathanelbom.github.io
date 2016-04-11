//"use strict";

this.onmessage = function( e ){
  switch( e.data.cmd ){
    case 'encode':
      this.encoder.encode( e.data.samples);
      break;
    case 'close':
      this.close();
      break;
    case 'init':
      this.encoder = new WavEncoder( this );
      break;
  }
};

var WavEncoder = function( worker ){
  this.worker = worker;
};

WavEncoder.prototype.encode = function( samples ) {
  var numChannels = 2;
  samples = this.interleave( samples, samples );
  var buffer = new ArrayBuffer( 44 + samples.length * 2 );
  var sampleRate = 44100;
  var view = new DataView( buffer );

  /* RIFF identifier */
  this.writeString( view, 0, 'RIFF' );
  /* RIFF chunk length */
  view.setUint32( 4, 36 + samples.length * 2, true );
  /* RIFF type */
  this.writeString( view, 8, 'WAVE' );
  /* format chunk identifier */
  this.writeString( view, 12, 'fmt ' );
  /* format chunk length */
  view.setUint32( 16, 16, true );
  /* sample format (raw) */
  view.setUint16( 20, 1, true );
  /* channel count */
  view.setUint16( 22, numChannels, true );
  /* sample rate */
  view.setUint32( 24, sampleRate, true );
  /* byte rate (sample rate * block align) */
  view.setUint32( 28, sampleRate * 4, true );
  /* block align (channel count * bytes per sample) */
  view.setUint16( 32, 4, true );
  /* bits per sample */
  view.setUint16( 34, 16, true );
  /* data chunk identifier */
  this.writeString( view, 36, 'data' );
  /* data chunk length */
  view.setUint32( 40, samples.length * 2, true );

  this.floatTo16BitPCM( view, 44, samples );

  this.worker.postMessage( {cmd:'encoded', data: view.buffer} );
};

WavEncoder.prototype.interleave = function ( inputL, inputR ) {
    var length = inputL.length + inputR.length;
    var result = new Float32Array( length );
    var index = 0,
    inputIndex = 0;

    while ( index < length ) {
        result[ index++ ] = inputL[ inputIndex ];
        result[ index++ ] = inputR[ inputIndex ];
        inputIndex++;
    }
    return result;
};

WavEncoder.prototype.floatTo16BitPCM = function( output, offset, input ) {
    for ( var i = 0; i < input.length; i++, offset += 2 ) {
        var s = Math.max( -1, Math.min( 1, input[ i ] ) );
        output.setInt16( offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true );
    }
};

WavEncoder.prototype.writeString = function ( view, offset, string ) {
    for ( var i = 0; i < string.length; i++ ){
        view.setUint8( offset + i, string.charCodeAt( i ) );
    }
};

