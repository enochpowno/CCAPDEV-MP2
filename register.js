
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://mp2_carreonpunovelascco:<password>@cluster0.dhmee.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
const collection = client.db("test").collection("devices");



  exports.create = function (req, res) {
    console.log(req.body)
    const newUser = new User({
        let = username=req.body.username,
        let = password=req.body.password
    });

    newPost.save(function (err, newPost) {
        if (err) throw err;
        console.log(newPost);
        console.log("Successfully Registered New User")
        res.redirect("/")
    })
}





  client.close();
});
