const crypto = require('crypto-js');
const Url = require('../models/urls.js');

function validateUrl(url) {
  const regex = /^(http|https):\/\/[^ "]+$/;
  if (regex.test(url)) {
    return true;
  } else {
    return false;
  }
}

function generateShortUrl(url) {
    const hash = crypto.SHA256(url);
    const hashString = hash.toString(crypto.enc.Hex);
    const shortUrl = hashString.slice(0, 8);
    return shortUrl;
}

async function saveUrl(originalUrl, shortUrl) {
    const url = new Url({
      original_url: originalUrl,
      short_url: shortUrl
    });
    await url.save();
  }

async function getUrl(shortUrl) {
  const url = await Url.findOne({ short_url: shortUrl });
  return url;
}

module.exports = {
  validateUrl,
  generateShortUrl,
  saveUrl,
  getUrl
};