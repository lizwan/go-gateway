var MC = require('../../lib/lib').MongoConnection;
var MQ = require('../../lib/lib').MongoMQ;

var options = {host: 'localhost', databaseName: 'go', queueCollection: 'capped_collection', autoStart: true,
    serverOptions: {
      socketOptions: {
        connectTimeoutMS: 15000,
        socketTimeoutMS: 15000
      }
    }
};
//var options = {servers: ['ndcsrvcdep601', 'ndcsrvcdep602'], databaseName: 'tests', queueCollection: 'capped_collection', autoStart: true};

var mq = module.exports = new MQ(options);

var log;

var handleRecord = function(err, data, next){
  if(!err){

    console.log('listener err:'+err+', data:'+JSONtoString(data));

log.insert(data,{w:1},  function(err, details){
  if(!err){
     console.log('insert success');
  } else {
     console.log('insert fail');
  }
});

    next('Hello '+(data||'world')+'!');
  }else{
    console.log('err: ', err);
    next();
  }
};

mq.on('greet', handleRecord);

(function(){
  var logger = new MC(options);
  logger.open(function(err, mc){
    if(err){
      console.log('ERROR: ', err);
    }else{
      mc.collection('services', function(err, loggingCollection){
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

function JSONtoString(object) {
    var results = [];
    for (var property in object) {
        var value = object[property];
        if (value)
            results.push(property.toString() + ': ' + value);
        }

        return '{' + results.join(', ') + '}';
}
