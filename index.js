var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser')

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());


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
      } else {
        response.send(result.rows[0].json);
      }
    });
  });
})

app.post('/save', function(req, res) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var data = JSON.stringify(req.body);

    var update = "UPDATE json_table SET json = $1 WHERE id=1;";
    var insert = "INSERT INTO json_table (id, json)" +
                 "SELECT 1, $1" +
                 "WHERE NOT EXISTS (SELECT 1 FROM json_table WHERE id = 1);";

    client.query(update, data, function(err, result) {
      if (err) console.log(err);

      client.query(insert, data, function(err, result) {
        if (err) console.log(err);

        done();

        res.send("lol");
      });
    });
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});