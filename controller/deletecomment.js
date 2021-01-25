const MongoClient = require('mongodb').MongoClient;
const User = require("../models/commentSchema")
const uri = "mongodb+srv://mp2_carreonpunovelascco:carreonpunovelasco@cluster0.dhmee.mongodb.net/MP2?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
const collection = client.db("test").collection("devices");



exports.delete_comment = function (req, res) {
    Post.updateOne({ _id: req.body["comment_id"] },
        { $pull: { comment: {_id: req.body.comment_id} } },
        function (err, post) {
            if (err) throw err;
            console.log("Comment has been removed.")
            res.send(200)

        })
}




  client.close();
});
