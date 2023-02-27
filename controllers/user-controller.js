 const {User} = require("../models/user-model");
 const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("redis");
const { startKafka } = require("../utils/kafka-function");
const { mapData } = require("../utils/map-data");

const key = "userlist";
const field = "userfield";
let tempArr = [];

const client = redis.createClient();

const startRedis = async(err) => {
    if(err){
        console.log("error while connecting redis",err);
    }
    await client.connect();
    console.log("redis connected successfully");
} 
startRedis();


 exports.signup = async(req,res) => {
    try{
    const userObj = {
        name : req.body.name,
        email : req.body.email,
        password : bcrypt.hashSync(req.body.password,8)
    }
    const createUser = await User.create(userObj);

    const response = mapData(createUser);

    tempArr.push(response);
    // console.log(tempArr);
    await client.hSet(key,field,JSON.stringify(tempArr));
    console.log("added data in redis");

    let msg = `new user created`
    startKafka(msg,response);

    res.status(201).send(response); 


}catch(err){
    res.status(500).send("error while signup",err);
}
 }


 exports.signin = async(req,res) => {
    try{
    const user = await User.findOne({email : req.body.email});

    if(user === null){
     return res.status(500).send("user is not present");
    }
    const validPass = bcrypt.compareSync(req.body.password,user.password);
    if(!validPass){
        return res.status(500).send("password is incorrect");
    }
    const token = jwt.sign({
        id : user.email
    },process.env.secret,{
        expiresIn : 600
    })

    const response = {
        id : user.id,
        name : user.name,
        email : user.email,
        createdAt : user.createdAt,
        updatedAt : user.updatedAt,
        accessToken : token
    }

    let msg = `new user signed in`
    startKafka(msg,response);

    res.status(200).send(response);
    }catch(err){
        res.status(500).send("error while signin",err)
    }

 }


 exports.findData = async(req,res) => {
    try{
        let user;
        
        // const key = "userlist";
        // const field = "userfield";
        const redisData = await client.hGet(key,field);

        const nameQ = req.query.name;
        const idQ = req.query.id;

         if(redisData){
        
            user = JSON.parse(redisData);
             console.log(`got the data from redis`);
    
            }
       else if(nameQ){
       user = await User.findAll({
        where : {
        name : nameQ 
        }
    });
        }
        else if(idQ){ 
           user = await User.findAll({
            where : {
            id : idQ
           }
        });
        }

      else{
        user = await User.findAll();
         await client.hSet(key,field,JSON.stringify(user));
         console.log(`set data in redis`);
      }

      let msg = `find call is responded with`
      startKafka(msg,response);

        res.status(200).send(user.map((users) => {
           return {
            id : users.id,
            name : users.name,
            email : users.email,
            createdAt : users.createdAt,
            updatedAt : users.updatedAt,
           }
        }))

    }catch(err){
        res.status(500).send("error in finding data",err)
 }
 }


 exports.findById = async(req,res) => {
    try{
    const user = await User.findOne({
        where : {
            id : req.params.id
        }
    });

    const response = mapData(user);

    let msg = `find by id call is responded with`
      startKafka(msg,response);

    res.status(200).send(response);
}catch(err){
    res.status(500).send("error while finding by id", err)
}
 }


 exports.updateData = async(req,res) => {
    try{

    const user = await User.findOne({
        where : {
            id : req.params.id
        }
    });

    user.name = req.body.name ? req.body.name : user.name; 
    user.email = req.body.email ? req.body.email : user.email;
    user.password = req.body.password ? bcrypt.hashSync(req.body.password) : user.password;

    await user.save(); 

    const response = mapData(user);

    let msg = `user updated his data`
    startKafka(msg,response);

    return res.status(201).send(response); 

}catch(err){
    res.status(500).send("error while updating",err)
}
 }

 
 exports.deleteData = async(req,res) => {
    try{
        const user = await User.findOne({where : {
            id : req.params.id
        }})
    //    await User.destroy({
    //         where : {
    //             id : req.params.id
    //         }
    //     });

    let msg = `user deleted his data`
      startKafka(msg,user);
     await user.destroy();
        res.status(200).send("user is deleted successfully");

    }catch(err){
        res.status(500).send("error in deletion".err)
    }
 }