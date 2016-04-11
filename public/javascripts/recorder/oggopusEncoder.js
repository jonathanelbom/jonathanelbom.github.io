//"use strict";
this.onmessage = function( e ){
  //this.console.log('--- worker > onmessage, cmd:',e.data.cmd);
  switch( e.data.cmd ) {

    case 'encodeAll':
      this.encoder.encodeAll( e.data.buffers );
      break;

    case 'encode':
      this.encoder.encode( e.data.buffers );
      break;

    case 'done':
      this.encoder.encodeFinalFrame();
      this.close();
      break;

    case 'init':
      importScripts( 'libopus.js', 'resampler.js' );
      //importScripts( e.data.baseURL + '/public/javascripts/recorder/libopus.js', e.data.baseURL + '/public/javascripts/recorder/resampler.js' );
      this.encoder = new OggOpusEncoder( e.data, this );
      break;
  }
};

var OggOpusEncoder = function( config, worker ){
  this.worker = worker;
  this.numberOfChannels = config.numberOfChannels || 1;
  this.originalSampleRate = config.originalSampleRate;
  this.encoderSampleRate = config.encoderSampleRate || 48000;
  this.maxBuffersPerPage = config.maxBuffersPerPage || 40; // Limit latency for streaming
  this.encoderApplication = config.encoderApplication || 2048; // 2048 = Voice, 2049 = Full Band Audio, 2051 = Restricted Low Delay
  this.encoderFrameSize = config.encoderFrameSize || 20; // 20ms frame
  this.bitRate = config.bitRate;

  //this.worker.postMessage( {cmd:'log', msg:'this.encoderSampleRate:'+this.encoderSampleRate+', this.originalSampleRate:'+this.originalSampleRate+', this.numberOfChannels:'+this.numberOfChannels} );

  this.resampler = new Resampler({
    resampledRate: this.encoderSampleRate,
    originalSampleRate: this.originalSampleRate,
    numberOfChannels: this.numberOfChannels
  });

  this.pageIndex = 0;
  this.granulePosition = 0;
  this.segmentData = new Uint8Array( 65025 );
  this.segmentDataIndex = 0;
  this.segmentTable = new Uint8Array( 255 );
  this.segmentTableIndex = 0;
  this.buffersInPage = 0;

  this.initChecksumTable();
  this.initCodec();
  this.generateIdPage();
  this.generateCommentPage();

  if ( this.numberOfChannels === 1 ) {
    this.interleave = function( buffers ) { return buffers[0]; };
  }
};

OggOpusEncoder.prototype.encodeAll = function( buffers ) {
 //this.worker.console.log('opus worker > encodeAll');

  for (var i=0; i<buffers.length; i++) {
    //this.worker.console.log('encodeAll > buffers[',i,']:',buffers[i]);
    this.encode( [ buffers[i] ] );
  }

  this.encodeFinalFrame();
  this.worker.close();
};

// this expects ScriptProcessorNode.onaudioprocess AudioProcessingEvent inputBuffer (e.inputBuffer - AudioBuffer)
OggOpusEncoder.prototype.encode = function( buffers ) {
  //this.worker.console.log('opus worker > encode, buffers:',buffers);
  var samples = this.resample( buffers );
  //this.worker.console.log('        samples:',samples);
  samples = this.interleave( samples );
  //this.worker.console.log('        samples:',samples);
  var sampleIndex = 0;

  //this.worker.console.log('opus worker > encode, buffers.length:',buffers.length,', this.buffersInPage:',this.buffersInPage,', samples.length:',samples.length );

  while ( sampleIndex < samples.length ) {

    var lengthToCopy = Math.min( this.encoderBufferLength - this.encoderBufferIndex, samples.length - sampleIndex );
    this.encoderBuffer.set( samples.subarray( sampleIndex, sampleIndex+lengthToCopy ), this.encoderBufferIndex );
    sampleIndex += lengthToCopy;
    this.encoderBufferIndex += lengthToCopy;

    if ( this.encoderBufferIndex === this.encoderBufferLength ) {
      var packetLength = _opus_encode_float( this.encoder, this.encoderBufferPointer, this.encoderSamplesPerChannelPerPacket, this.encoderOutputPointer, this.encoderOutputMaxLength );
      this.segmentPacket( packetLength );
      this.encoderBufferIndex = 0;
    }
  }

  this.buffersInPage++;

  if ( this.buffersInPage >= this.maxBuffersPerPage ) {
    this.generatePage();
  }
};

OggOpusEncoder.prototype.encodeFinalFrame = function() {
  //this.worker.console.log('opus worker > encodeFinalFrame' );

  this.encode( [ new Float32Array( this.encoderBufferLength - this.encoderBufferIndex ) ] );
  this.headerType += 4;
  this.generatePage();
};

OggOpusEncoder.prototype.getChecksum = function( data ){
  //this.worker.console.log('opus worker > getChecksum' );

  var checksum = 0;
  for ( var i = 0; i < data.length; i++ ) {
    checksum = (checksum << 8) ^ this.checksumTable[ ((checksum>>>24) & 0xff) ^ data[i] ];
  }
  return checksum >>> 0;
};

OggOpusEncoder.prototype.generateCommentPage = function(){
  // this.worker.console.log('opus worker > generateCommentPage' );

  var segmentDataView = new DataView( this.segmentData.buffer );
  segmentDataView.setUint32( 0, 1937076303, true ); // Magic Signature 'Opus'
  segmentDataView.setUint32( 4, 1936154964, true ); // Magic Signature 'Tags'
  segmentDataView.setUint32( 8, 8, true ); // Vendor Length
  segmentDataView.setUint32( 12, 1868784978, true ); // Vendor name 'Reco'
  segmentDataView.setUint32( 16, 1919247474, true ); // Vendor name 'rder'
  segmentDataView.setUint32( 20, 0, true ); // User Comment List Length
  this.segmentTableIndex = 1;
  this.segmentDataIndex = this.segmentTable[0] = 24;
  this.headerType = 0;
  this.generatePage();
};

OggOpusEncoder.prototype.generateIdPage = function(){
  // this.worker.console.log('opus worker > generateIdPage' );

  var segmentDataView = new DataView( this.segmentData.buffer );
  segmentDataView.setUint32( 0, 1937076303, true ); // Magic Signature 'Opus'
  segmentDataView.setUint32( 4, 1684104520, true ); // Magic Signature 'Head'
  segmentDataView.setUint8( 8, 1, true ); // Version
  segmentDataView.setUint8( 9, this.numberOfChannels, true ); // Channel count
  segmentDataView.setUint16( 10, 3840, true ); // pre-skip (80ms)
  segmentDataView.setUint32( 12, this.originalSampleRate, true ); // original sample rate
  segmentDataView.setUint16( 16, 0, true ); // output gain
  segmentDataView.setUint8( 18, 0, true ); // channel map 0 = mono or stereo
  this.segmentTableIndex = 1;
  this.segmentDataIndex = this.segmentTable[0] = 19;
  this.headerType = 2;
  this.generatePage();
};

OggOpusEncoder.prototype.generatePage = function(){
  // this.worker.console.log('opus worker > generatePage' );

  var granulePosition = ( this.lastPositiveGranulePosition === this.granulePosition) ? -1 : this.granulePosition;
  var pageBuffer = new ArrayBuffer(  27 + this.segmentTableIndex + this.segmentDataIndex );
  var pageBufferView = new DataView( pageBuffer );
  var page = new Uint8Array( pageBuffer );

  pageBufferView.setUint32( 0, 1399285583, true); // Capture Pattern starts all page headers 'OggS'
  pageBufferView.setUint8( 4, 0, true ); // Version
  pageBufferView.setUint8( 5, this.headerType, true ); // 1 = continuation, 2 = beginning of stream, 4 = end of stream

  // Number of samples upto and including this page at 48000Hz, into 64 bits
  pageBufferView.setUint32( 6, granulePosition, true );
  if ( granulePosition > 4294967296 || granulePosition < 0 ) {
    pageBufferView.setUint32( 10, Math.floor( granulePosition/4294967296 ), true );
  }

  pageBufferView.setUint32( 14, 0, true ); // Bitstream serial number
  pageBufferView.setUint32( 18, this.pageIndex++, true ); // Page sequence number
  pageBufferView.setUint8( 26, this.segmentTableIndex, true ); // Number of segments in page.
  page.set( this.segmentTable.subarray(0, this.segmentTableIndex), 27 ); // Segment Table
  page.set( this.segmentData.subarray(0, this.segmentDataIndex), 27 + this.segmentTableIndex ); // Segment Data
  pageBufferView.setUint32( 22, this.getChecksum( page ), true ); // Checksum

  this.worker.postMessage( page.buffer );
  this.segmentTableIndex = 0;
  this.segmentDataIndex = 0;
  this.buffersInPage = 0;
  if ( granulePosition > 0 ) {
    this.lastPositiveGranulePosition = granulePosition;
  }
};

OggOpusEncoder.prototype.initChecksumTable = function(){
  // this.worker.console.log('opus worker > initChecksumTable' );
  this.checksumTable = [];
  for ( var i = 0; i < 256; i++ ) {
    var r = i << 24;
    for ( var j = 0; j < 8; j++ ) {
      r = ((r & 0x80000000) != 0) ? ((r << 1) ^ 0x04c11db7) : (r << 1);
    }
    this.checksumTable[i] = (r & 0xffffffff);
  }
};

OggOpusEncoder.prototype.initCodec = function() {
  // this.worker.console.log('opus worker > initCodec' );
  this.encoder = _opus_encoder_create( this.encoderSampleRate, this.numberOfChannels, this.encoderApplication, allocate(4, 'i32', ALLOC_STACK) );

  if ( this.bitRate ) {
    var bitRateLocation = _malloc( 4 );
    HEAP32[bitRateLocation >>> 2] = this.bitRate;
    _opus_encoder_ctl( this.encoder, 4002, bitRateLocation );
    _free( bitRateLocation );
  }

  this.encoderBufferIndex = 0;
  this.encoderSamplesPerChannelPerPacket = this.encoderSampleRate * this.encoderFrameSize / 1000;
  this.encoderBufferLength = this.encoderSamplesPerChannelPerPacket * this.numberOfChannels;
  this.encoderBufferPointer = _malloc( this.encoderBufferLength * 4 ); // 4 bytes per sampled
  this.encoderBuffer = HEAPF32.subarray( this.encoderBufferPointer >> 2, (this.encoderBufferPointer >> 2) + this.encoderBufferLength );
  this.encoderOutputMaxLength = 4000;
  this.encoderOutputPointer = _malloc( this.encoderOutputMaxLength );
  this.encoderOutputBuffer = HEAPU8.subarray( this.encoderOutputPointer, this.encoderOutputPointer + this.encoderOutputMaxLength );
};

OggOpusEncoder.prototype.interleave = function( buffers ) {
  //this.worker.console.log('opus worker > interleave, buffers[0].length:',buffers[0].length );
  var outputData = new Float32Array( buffers[0].length * this.numberOfChannels );

  for ( var i = 0; i < buffers[0].length; i++ ) {
    for ( var channel = 0; channel < this.numberOfChannels; channel++ ) {
      outputData[ i * this.numberOfChannels + channel ] = buffers[ channel ][ i ];
    }
  }

  return outputData;
};

OggOpusEncoder.prototype.resample = function( buffers ) {
  var resampledBuffers = [];
  for ( var channel = 0; channel < this.numberOfChannels; channel++ ) {
    resampledBuffers.push( this.resampler.resample( buffers[channel], channel ) );
  }
  return resampledBuffers;
};

OggOpusEncoder.prototype.segmentPacket = function( packetLength ) {
  //this.worker.console.log('opus worker > segmentPacket, packetLength:',packetLength );
  var packetIndex = 0;

  while ( packetLength >= 0 ) {

    if ( this.segmentTableIndex === 255 ) {
      this.generatePage();
      this.headerType = 1;
    }

    var segmentLength = Math.min( packetLength, 255 );
    this.segmentTable[ this.segmentTableIndex++ ] = segmentLength;
    this.segmentData.set( this.encoderOutputBuffer.subarray( packetIndex, packetIndex + segmentLength ), this.segmentDataIndex );
    this.segmentDataIndex += segmentLength;
    packetIndex += segmentLength;
    packetLength -= 255;
  }

  this.granulePosition += ( 48 * this.encoderFrameSize );
  if ( this.segmentTableIndex === 255 ) {
    this.generatePage();
    this.headerType = 0;
  }
};
