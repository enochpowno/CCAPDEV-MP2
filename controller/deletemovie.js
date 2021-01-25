const MongoClient = require('mongodb').MongoClient;
const User = require("../models/movieSchema")
const uri = "mongodb+srv://mp2_carreonpunovelascco:carreonpunovelasco@cluster0.dhmee.mongodb.net/MP2?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
const collection = client.db("test").collection("devices");



exports.delete_movie = function (req, res) {
    Post.deleteOne({ _id: req.body.movie_id }, function (err, res){
        if (err) throw err;
        console.log(res);
        console.log("Movie deleted")
    })
}





  client.close();
});
