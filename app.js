// app.js

var cfenv = require( 'cfenv' );
var bodyParser = require( 'body-parser' );
var express = require( 'express' );
var ExifImage = require( 'exif' ).ExifImage;
var multer = require( 'multer' );
var app = express();

var appEnv = cfenv.getAppEnv();

app.use( express.static( __dirname + '/public' ) );
app.use( bodyParser.urlencoded( { extended: true, limit: '10mb' } ) );
//app.use( bodyParser.urlencoded() );
app.use( multer( { dest: './tmp/' } ).single( 'attachment_file' ) );
app.use( bodyParser.json() );

app.post( '/image', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  console.log( 'POST /image' );

  var filepath = req.file.path;
  var filetype = req.file.mimetype;
  var filename = req.file.originalname;
  var ext = filetype.split( "/" )[1];

  if( filename && filepath ){
    var bin = fs.readFileSync( filepath );
    var bin64 = new Buffer( bin ).toString( 'base64' );
    var doc = {
      filename: filename,
      filesize: bin.length,
      timestamp: ( new Date() ).getTime(),
      _attachments: {
        file: {
          content_type: filetype,
          data: null   //bin64
        }
      }
    };

    try{
      new ExifImage( { image: filepath }, function( err, exifData ){
        if( err ){
          console.log( 'Error: ' + err.message );
        }else{
          console.log( exifData );
        }
      });
    }catch( error ){
      console.log( error );
    }

    fs.unlink( filepath, function( err ){} );
    res.write( JSON.stringify( { status: true, doc: doc }, 2, null ) );
    res.end();
  }else{
    fs.unlink( filepath, function( err ){} );
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'Invalid doc.type' }, 2, null ) );
    res.end();
  }
});

var port = appEnv.port || 3000;
app.listen( port );
console.log( 'server started on ' + port );
