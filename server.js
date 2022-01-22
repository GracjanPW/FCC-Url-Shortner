require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const { redirect } = require('express/lib/response');
const dns = require('dns')
const urlparser = require('url')

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const shortUrlSchema = new mongoose.Schema({
  long: { type: String, required: true },
  short: { type: Number, required: true }
})
const counterSchema = new mongoose.Schema({
  count: { type: Number, required: true, default: 0 }
})
const ShortUrl = mongoose.model("Urls", shortUrlSchema)
const Counter = mongoose.model('Counter', counterSchema)


const port = process.env.PORT || 3000;



app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  const reqUrl = req.body.url

  dns.lookup(urlparser.parse(reqUrl).hostname, (err, address) => {
    if (!address || err) {
      res.json({ error: 'invalid url' })
    } else {
      Counter.findOneAndUpdate({}, { $inc: { count: 1 } }, { returnOriginal: false, upsert: true }, (err, data) => {
        const url = new ShortUrl({ long: reqUrl, short: data.count })
        url.save()
        res.json({ original_url: url.long, short_url: url.short });
      })
    }
  })


})
app.get('/api/shorturl/:url', (req, res) => {
  const { url } = req.params
  ShortUrl.findOne({ short: url.toString() }, (err, data) => {
    if (!data) res.json({ error: 'invalid url' })
    else res.redirect(data.long)
  })
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
