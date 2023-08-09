'use strict';

require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
const bodyParser = require('body-parser');
const Url = require('./models/urls.js');
const { validateUrl, generateShortUrl, saveUrl, getUrl } = require('./modules/urls.js');

// Middleware
app.use(cors());
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
app.use(bodyParser.json());
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Shorten URL route
app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;
  if (validateUrl(url)) {
    const shortUrl = generateShortUrl(url);
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
        short_url: process.env.BASE_URL + shortUrl
      });
    }
  } else {
    res.json({
      error: 'invalid url'
    });
  }
});

// Redirect to original URL
app.get('/:shortUrl', async (req, res) => {
  const shortUrl = req.params.shortUrl;
  try {
    const url = await getUrl(shortUrl);
    if (!url) {
      throw new Error('invalid url');
    }
    return res.redirect(url.original_url);
  } catch (err) {
    // console.error(err); // Log the error
    return res.json({ error: 'Invalid URL' });
  }
});

// Set up server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running at ${process.env.BASE_URL}`);
});
