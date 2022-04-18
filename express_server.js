let express = require('express');
let app = express();

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  const mascots = [
    {name: 'Sammy', organization: 'DigitalOcean', birthYear: 2012},
    {name: 'Tux', organization: 'Linux', birthYear: 1996},
    {name: 'Moby Dock', organization: 'Docker', birthYear: 2013},
  ];
  const tagline = 'No programming concept is complete without a cute animal mascot.';
  res.render('pages/index', {
    mascots,
    tagline
  });
});

app.get('/about', function(req, res) {
  res.render('pages/about');
});

app.listen(8080);
console.log('Server is listening on port 8080');