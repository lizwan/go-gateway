var express = require("express");
  var app = express();
app.use(express.bodyParser());



var MC = require('../../lib/lib').MongoConnection;
var MQ = require('../../lib/lib').MongoMQ;

var options = {host: 'localhost', databaseName: 'go', queueCollection: 'capped_collection', autoStart: false};

var mq = module.exports = new MQ(options);

var emitRecord = function(i){
    console.log('emitting '+i+recordNumber(i,new Date()));
    mq.emit('greet', recordNumber(i,new Date()), function(err, data){
        console.log('Response:');
        console.log(' err>', err);
        console.log(' dat>', data);
    });
};

mq.ready(function(){
    console.log('ready');
});

(function(){
  var logger = new MC(options);
  logger.open(function(err, mc){
    if(err){
      console.log('ERROR: ', err);
    }else{

          if(!options.autoStart){

                        mq.start(function(err){
                          console.log('mq.start');
                        });

          }

    }
  });
})();

app.post('/', function(req, res){
  res.send('success');
  console.log('get in');
  console.log(req.body);

        mq.emit('greet', req.body, function(err, data){
                console.log('Response:');
                console.log(' err>', err);
                console.log(' dat>', data);
        });


});

app.listen(3000);
