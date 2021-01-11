

const MongoClient = require('mongodb').MongoClient;
const User = require("../models/userSchema")
const uri = "mongodb+srv://mp2_carreonpunovelascco:carreonpunovelasco@cluster0.dhmee.mongodb.net/MP2?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object


  app.post("/user", urlencoder, (req,res)=>{
    let username=req.body.username
    let password=req.body.password

    if(username=="" || password==""){
        res.render("login.hbs",{
            error: "Enter username and password"
        })
    }else{
        Users.findOne({'username': username}).then((doc)=>{
            if(doc == null){
                res.render("login.hbs",{
                    error:"User not found"
                })
            }else{
                if (doc.hash === hash) { 
                    req.body.username = username
                    res.redirect("/")
                } 
                else { 
                    res.render("login.hbs",{
                        error: "Log in error"
                    })
                }
            }
        })
    }
    
})





  client.close();
});


