
const MongoClient = require('mongodb').MongoClient;
const User = require("../models/userSchema")
const uri = "mongodb+srv://mp2_carreonpunovelascco:carreonpunovelasco@cluster0.dhmee.mongodb.net/MP2?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
const collection = client.db("test").collection("devices");



  exports.create = function (req, res) {
    console.log(req.body)
    const newUser = new User({
        let = username=req.body.username,
        let = password=req.body.password
    });

    newUser.save(function (err, newUser) {
        if (err) throw err;
        console.log(newUser);
        console.log("Successfully Registered New User")
        res.redirect("/")
    })
}





  client.close();
});
