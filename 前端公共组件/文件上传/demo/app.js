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
var md5File = require('md5-file');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

// 查询已经上传的分片文件，客户端将跳过这些分片
app.get('/checkfile', function(req, res) {
    var md5 = req.query['md5'];
    var files=fs.readdirSync(TEMP_DIR); 
    var re = [];

    // 查询指定文件的分片
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
        
        var retry = 0,
            RETRY_LIMIT=5;// 重命名失败时的重试次数

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
                    if ( retry++ < RETRY_LIMIT ) { // 重命名失败时再尝试几次
                        setTimeout( rename, 500 );
                    }
                    else {
                        res.status(500).send('');
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
                mergeFile(params, function(err, filePath) {
                    if (err) {
                        res.status(500).send('');
                    }
                    else {
                        res.status(200).send(filePath);
                    }
                });
            }
            else {
                res.status(200).send('');
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
    var targetFile = './upload/' + params.name,
        fileWriteStream = fs.createWriteStream(targetFile);
    var chunk = Number(params.chunk),
        chunks = Number(params.chunks);
    var curRs = null;

    // 校验，清理分片文件
    fileWriteStream.on('close',function(){
        md5File(targetFile, function(err, md5){
            if ( err ) callback(err);
            if (md5 === params.md5) {
                callback(null, targetFile);
                for (var chunk=0;chunk<chunks; chunk++) {
                    fs.unlink( getPartPah(params, chunk) );
                }
            }
            else {
                console.log('校验失败'+md5);
                callback('校验失败'+md5);
            }
        });
    });

    fileWriteStream.on('error', function(err){
        callback(err);
        console.log(err);
    });

    // 文件写入太快时会读取暂停，写入完成恢复
    fileWriteStream.on('drain', function() {
        curRs && curRs.resume();
    });

    // 依次合并文件
    function doWrite(chunk) {
        if ( chunk >= chunks ) {
            fileWriteStream.end();
            return;
        }

        // 读取分片
        var rs = fs.createReadStream( getPartPah(params, chunk) );
        curRs = rs;

        // 写入数据到最终文件
        rs.on('data', function( data ) {
            if ( fileWriteStream.write(data) === false ) { // 如果没有写完，暂停读取流
                rs.pause();
            }
        });        

        rs.on('end',function(){
            doWrite(++chunk);
        });

        rs.on('error', function(err){
            callback(err);
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
