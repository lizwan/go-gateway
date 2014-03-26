// express server import
var express = require("express");
var app = express();

// express.bodyParser() 사용
app.use(express.bodyParser());

// mongo import
var MC = require('../../lib/lib').MongoConnection;
var MQ = require('../../lib/lib').MongoMQ;

// mongo option
var options = {host: 'localhost', databaseName: 'go', queueCollection: 'queue_message', autoStart: true};

// mongo 변수 설정
var mq = module.exports = new MQ(options);

// mq 준비
mq.ready(function(){
	console.log('ready');
});

// mongo db connection 맺고
(function(){
	var logger = new MC(options);
	
	// connection open
	logger.open(function(err, mc){
		if(err){
			console.log('ERROR: ', err);
		}else{
			// mq 작동 시작
			if(!options.autoStart){
					mq.start(function(err){
					console.log('mq.start');
				});
			}
		}
	});
})();

// express post request를 받아 처리
app.post('/', function(req, res){
  
	// 클라이언트에게 성공 메세지 보내기
	res.send('success');
	
	console.log('get in');
	console.log(req.body);
	
	// mq 에 emit, put a message on the queue
	mq.emit('greet', req.body, function(err, data){
		console.log('Response:');
		console.log(' err>', err);
		console.log(' dat>', data);
	});


});

app.listen(3000);
