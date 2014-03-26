// module import
var MC = require('../../lib/lib').MongoConnection;
var MQ = require('../../lib/lib').MongoMQ;

// mongo db 세팅, capped collection 세팅
var options = {host: 'localhost', databaseName: 'go', queueCollection: 'queue_user', autoStart: false,
    serverOptions: {
		socketOptions: {
			connectTimeoutMS: 15000,
			socketTimeoutMS: 15000
		}
	}
};

// mq 변수 설정
var mq = module.exports = new MQ(options);
var log;


// capped collection 테이블에서 데이타 가져와서 지정된 테이블에 저장하기
var handleRecord = function(err, data, next){

	//err 가 없으면 target 컬렉션에 insert
	if(!err){			
		console.log('listener err:'+err+', data:'+JSONtoString(data));
		console.log('data.collection:'+data.collection);
		
		log.insert(data,{w:1},  function(err, details){
			if(!err){
			   console.log('insert success');
			} else {
			   console.log('insert fail');
			}
		});
		next((data));
	  }else{
	    console.log('err: ', err);
	    next();
	  }
};

// mq 활성화, server 에서 greet 으로 emit
mq.on('greet', handleRecord);

// listener 실행될때 target collection 세팅, capped collection start
(function(){
	var logger = new MC(options);
	logger.open(function(err, mc){
		if(err){
			console.log('ERROR: ', err);
		}else{
			mc.collection('user', function(err, loggingCollection){
				log = loggingCollection;
				if(!options.autoStart){
					mq.start(function(err){
						if(err){
							console.log(err);
						}
					});
				}
			});
		}
	});
})();


// json to string function
function JSONtoString(object) {
	var results = [];
	for (var property in object) {
		var value = object[property];
		if (value) {
			results.push(property.toString() + ': ' + value);
		}
	}
	
	return '{' + results.join(', ') + '}';
}
