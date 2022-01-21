require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const { redirect } = require('express/lib/response');
const app = express();


mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true, useUnifiedTopology:true})

const schema = new mongoose.Schema({
  long: {type:String,required:true},
  short: {type:String,required:true}
})
const ShortUrl = mongoose.model("Urls",schema)


const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const genUrl =()=>{
  let url = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    url += possible.charAt(Math.floor(Math.random() * possible.length));

  return url;
}

const isValidHttpUrl = string => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

// Your first API endpoint
app.post('/api/shorturl',(req, res)=>{
  if(!isValidHttpUrl(req.body.url)){
    console.log('error')
    res.json({ error: 'invalid url' })
  }
  const url = new ShortUrl({long:req.body.url,short:genUrl()})
  url.save()
  res.json({long_url:url.long,short_url:url.short});
})

app.get('/api/shorturl/:url',(req, res)=>{
  const {url} = req.params
  ShortUrl.findOne({short:url},(err,data)=>{
    if (err) return
    if (data) res.redirect(data.long)
  })
  res.redirect('/')
  
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
