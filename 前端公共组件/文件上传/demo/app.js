var express = require('express'),
    app = express(),
    fs = require('fs'),
    path = require('path'),
    os = require('os'),
    util = require('util'),
    inspect = require('util').inspect,
    key = 0,
    TEMP_DIR = './tmp/';

var bodyParser = require('body-parser');
var Busboy = require('busboy');


app.use(bodyParser.urlencoded({extended: true}));

// 查询已经上传的分片文件，客户端将跳过这些分片
app.get('/checkfile', function(req, res) {
    var md5 = req.query['md5'];
    var files=fs.readdirSync(TEMP_DIR); 
    var re = [];

    if ( md5 ) {
        for(fn in files)  {  
            var fname = files[fn];
            if ( fname.indexOf(md5)===0 ) {
                re.push(fname);
            }
        } 

    }
    else {
        re = files;
    }
    res.send(re);
});

app.post('/upload', function(req, res){

    var busboy = new Busboy({ headers: req.headers }),
        params = {},
        tmpPath = path.join(TEMP_DIR||os.tmpDir() , new Date().getTime() + "-" + (key++) + '.tmp');

    // POST文件解析完成
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        file.pipe(fs.createWriteStream(tmpPath));
    });

    // 普通POST字段解析完成
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
        params[fieldname] = val;
    });

    // POST数据全部解析完成
    busboy.on('finish', function(err) {
        
        var retry = 0;

        // 不分片的文件
        if ( !params.chunk ) {
            params.chunk = 0;
            params.chunks = 1;
        }

        rename();

        // 将临时文件命名为part文件
        function rename () {
            fs.rename(tmpPath, TEMP_DIR + params.md5 + '-'+params.chunk+'.part', function(err){

                if ( err ) {
                    console.log('生成part文件出错');
                    console.log(err);
                    if ( retry++ < 5 ) { // 重命名失败时再尝试几次
                        setTimeout( rename, 50 );
                    }
                    else {
                        res.writeHead(500, { 'Connection': 'close' });
                        res.end("0");
                    }
                    return;
                }
                else {
                    renameDone();
                }

            } );
        }

        function renameDone() {

            // 判断chunks是否全部传完
            var done = true;
            for ( var i=0; i<Number( params.chunks); i++ ) {
                if ( !fs.existsSync(TEMP_DIR+params.md5+'-'+i+'.part') ) {
                    done = false;
                    break;
                }
            }

            if (done) {
                mergeFile(params, function(filePath) {
                    res.writeHead(200, { 'Connection': 'close' });
                    res.end(filePath);
                });
            }
            else {
                res.writeHead(200, { 'Connection': 'close' });
                res.end("");
            }
        }
    });



    return req.pipe(busboy);
});

// 获取part文件路径
function getPartPah(params, chunk) {
    return './tmp/'+params.md5 + '-' + chunk +'.part';
}

// 合并part文件
function mergeFile(params, callback) {
    var targetFile = './upload/' + params.name;
    var fileWriteStream = fs.createWriteStream(targetFile);
    
    var chunk = Number(params.chunk);
    var chunks = Number(params.chunks);

    // 清理文件
    fileWriteStream.on('close',function(){
      callback(targetFile);
      for (var chunk=0;chunk<chunks; chunk++) {
        fs.unlink( getPartPah(params, chunk) );
      }
    });


    // 依次合并文件
    function doWrite(chunk) {
        if ( chunk >= chunks ) {
            fileWriteStream.end();
            return;
        }

        var rs = fs.createReadStream( getPartPah(params, chunk) );
        rs.on('data', function( data ) {
            if ( fileWriteStream.write(data) === false ) { // 如果没有写完，暂停读取流
                //rs.pause();
            }
        });

        rs.on('drain', function() { // 写完后，继续读取
            //readStream.resume();
        });

        rs.on('end',function(){
            doWrite(++chunk);
        });

        rs.on('err',function(err){
            // doWrite(++chunk);
            console.log(err);
        });
    }

    doWrite(0);
}

// TODO， 定时清理文件
function clear() {
    var stat = fs.statSync(filename);
}

app.listen(3000);
console.log('服务启动3000');
