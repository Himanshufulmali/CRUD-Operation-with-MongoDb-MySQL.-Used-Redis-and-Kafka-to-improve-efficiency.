const express = require("express");
const {PORT} = require("./configs/server-config");
const {User} = require("./models/user-model");

const app = express();
app.use(express.json({urlencoded : {extended:true}}));


User.sync();
 


require("./routes/user-route")(app);
 
const start = async(err) => { 
    if(err){
        console.log(`error while connecting server`);
    } 
    await app.listen(PORT);
    console.log(`server is started on port : ${PORT}`);
}
start();