let express = require('express');
let app = express();

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
});

app.get('/about', function(req, res) {
});

app.listen(8080);
console.log('Server is listening on port 8080');