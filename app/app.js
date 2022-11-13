// use strict
'use strict';

require('dotenv').config();

// create express app
const express = require('express');
const app = express();

// cors
const cors = require('cors');
app.use(cors());

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// use body-parser
const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// register public folder
app.use(express.static('public'));

const Url = require('./models/urls.js');

const { validateUrl, generateShortUrl, saveUrl, getUrl} = require('./modules/urls.js');

// route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// create post route
app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;
  if (validateUrl(url)) {
    const shortUrl = generateShortUrl(url);
    // is shorturl exists in db?
    const urlExists = await Url.findOne({ short_url: shortUrl });
    if (urlExists) {
      res.json({
        original_url: urlExists.original_url,
        short_url: process.env.BASE_URL + urlExists.short_url
      });
    } else {
      await saveUrl(url, shortUrl);
      res.json({
        original_url: url,
        short_url: process.env.BASE_URL+shortUrl
      });
    }
  } else {
    res.json({
      error: 'invalid url'
    });
  }
});

// create get route
app.get('/:shortUrl', async (req, res) => {
  const shortUrl = req.params.shortUrl;
  try {
    const url = await getUrl(shortUrl);
    if (!url) {
      throw new Error('invalid url');
    }
    return res.redirect(url.original_url);
  }
  catch (err) {
    return res.json({ error: err });
  }
});

// listen on port
app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});
