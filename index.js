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
    var upsert  = "UPDATE json_table SET json='" + (req.body) + "' WHERE id=1;" +
                  "INSERT INTO json_table (id, json)" +
                  "SELECT 1, '" + (req.body) + "'" +
                  "WHERE NOT EXISTS (SELECT 1 FROM json_table WHERE id = 1);";

    client.query(upsert, function(err, result) {
      if (err) {
        console.log(err);
      }

      done();

      res.send("lol");
    });
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});