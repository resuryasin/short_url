// use strict
'use strict';

require('dotenv').config();

// create express app
const express = require('express');
const app = express();

// cors
const cors = require('cors');
app.use(cors());

// use body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use crypto-js
const crypto = require('crypto-js');

const mongoose = require('mongoose');

// mongouri with admin
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model('Url', urlSchema)

function generateShortUrl(url) {
  const hash = crypto.SHA256(url);
  const hashString = hash.toString(crypto.enc.Hex);
  const shortUrl = hashString.slice(0, 8);
  return shortUrl;
}

// create saveUrl function, takes in original url and short url then saves to db
async function saveUrl(originalUrl, shortUrl) {
  const url = new Url({
    original_url: originalUrl,
    short_url: shortUrl
  });
  await url.save();
}

// create getUrl function, takes in short url and returns original url
async function getUrl(shortUrl) {
  const url = await Url.findOne({ short_url: shortUrl });
  return url;
}


// validate url, throw error if invalid
function validateUrl(url) {
  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  if (regex.test(url)) {
    return true;
  } else {
    return false;
  }
}

// register public folder
app.use(express.static('public'));

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
