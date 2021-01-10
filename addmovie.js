
const MongoClient = require('mongodb').MongoClient;
const User = require("../models/movieSchema")
const uri = "mongodb+srv://mp2_carreonpunovelascco:carreonpunovelasco@cluster0.dhmee.mongodb.net/MP2?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
const collection = client.db("test").collection("devices");



  exports.create = function (req, res) {
    console.log(req.body)
    const newMovie = new Movie({
        let = title=req.body.title,
        let = poster=req.body.poster,
        let = snyopsis=req.body.poster
    });

    newMovie.save(function (err, newMovie) {
        if (err) throw err;
        console.log(newMovie);
        console.log("Successfully Uploaded New Movie")
        res.redirect("/")
    })
}





  client.close();
});
