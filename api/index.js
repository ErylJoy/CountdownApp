const express = require('express')
const app = express();
const cors = require('cors');
const port = 4000
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
app.use(cors());
app.use(express.json());
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("mom i made it");
});

const levelSchema = new mongoose.Schema({
    user: String,
    numbers: [],
    theNumber: Number,
});

// const kittySchema = new mongoose.Schema({
//     name: String
//   });


//   kittySchema.methods.speak = function () {
//     const greeting = this.name
//       ? "Meow name is " + this.name
//       : "I don't have a name";
//     console.log(greeting);
//   }
  
//   const Kitten = mongoose.model('Kitten', kittySchema);

// const silence = new Kitten({ name: 'Silence' });
// console.log(silence.name); // 'Silence'

// const fluffy = new Kitten({ name: 'fluffy' });
// fluffy.save(function (err, fluffy) {
//     if (err) return console.error(err);
//     fluffy.speak();
//   });

//   Kitten.find(function (err, kittens) {
//     if (err) return console.error(err);
//     console.log(kittens);
//   })


app.post('/save', (req, res) => {
  if(req.body.numbers.length === 6 && req.body.theNumber){
    const level = mongoose.model('Level', levelSchema);
    level.find({numbers: req.body.numbers, theNumber: req.body.theNumber,}, function(err, levels){
      if (err) return console.error(err);
      console.log(levels);
      if(levels.length === 0){
        console.log("saving");
        const newLevel = new level({ user: req.body.username, numbers: req.body.numbers, theNumber: req.body.theNumber,});
        newLevel.save(function (err) {
        if (err) return console.error(err);
        });
      }
    });
  }
})

app.post('/get', (req, res) => {
    const level = mongoose.model('Level', levelSchema);
    level.find(function (err, levels) {
        if (err) return console.error(err);
        res.json(levels);
        console.log(req.ip)
      });
      
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})