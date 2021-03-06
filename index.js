var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
var cors = require('cors');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(cors());

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('select * from json_table', function(err, result) {
      done();

      if (err) {
        console.error(err);
        response.send("Error " + err);
        return;
      } 

      if (result.rows.length == 0) {
        // Just return an empty todo list.
        response.send('{"name":"Base","content":"","done":false,"isHeader":false,"createdDate":"Sat Mar 28 2015 11:33:07 GMT-0700 (Pacific Daylight Time)","modifiedDate":"Sat Mar 28 2015 11:33:07 GMT-0700 (Pacific Daylight Time)","archivalDate":"","archived":false,"starred":false,"tags":[],"children":['+ 
          '{"name":"Base","content":"","done":false,"isHeader":false,"createdDate":"Sat Mar 28 2015 11:33:07 GMT-0700 (Pacific Daylight Time)","modifiedDate":"Sat Mar 28 2015 11:33:07 GMT-0700 (Pacific Daylight Time)","archivalDate":"","archived":false,"starred":false,"tags":[],"children":[]}' +
        ']}');
      } else {
        response.send(result.rows[0].json);
      }
    });
  });
});

app.post('/save', function(req, res) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var data = JSON.stringify(req.body);

    var update = "UPDATE json_table SET json = $1 WHERE id=1;";
    var insert = "INSERT INTO json_table (id, json)" +
                 "SELECT 1, $1" +
                 "WHERE NOT EXISTS (SELECT 1 FROM json_table WHERE id = 1);";

    client.query(update, [data], function(err, result) {
      if (err) console.log(err);

      client.query(insert, [data], function(err, result) {
        if (err) console.log(err);

        console.log('saved new data');

        done();

        res.send("lol");
      });
    });
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
