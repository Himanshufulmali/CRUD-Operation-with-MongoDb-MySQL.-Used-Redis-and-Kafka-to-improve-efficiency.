 const {User} = require("../models/user-model");
 const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("redis");
const {Kafka} = require("kafkajs");


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


const brokers = ["localhost:9092"];
const topic = "my-enter"
const clientId = "Himanshu1"

const kafka = new Kafka({brokers,clientId})
const producer = kafka.producer();



 exports.signup = async(req,res) => {
    try{
    const userObj = {
        name : req.body.name,
        email : req.body.email,
        password : bcrypt.hashSync(req.body.password,8)
    }
    const createUser = await User.create(userObj);

    const response = {
        id : createUser.id,
        name : createUser.name,
        email : createUser.email,
        createdAt : createUser.createdAt,
        updatedAt : createUser.updatedAt
    }

    tempArr.push(response);
    // console.log(tempArr);
    await client.hSet(key,field,JSON.stringify(tempArr));
    console.log("added data in redis");


    const startKafka = async() => {

    await producer.connect();
    await producer.send({
      topic,
      messages : [{
       value : `a new user with 
       id : ${createUser.id},
       name : ${createUser.name},
       email : ${createUser.email}
                  signed up` 
        }]
    })

    }
    startKafka();

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

  const startKafka = async() => {
  await producer.connect();
  await producer.send({
    topic,
    messages : [{
        value : `user signed in 
        id : ${response.id},
        name : ${response.name},
        email : ${response.email} ` 
    }]
  })
  }

  startKafka();

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
        // await client.hSet(key,field,JSON.stringify(user));
        // console.log(`set data in redis`);
      }

      const startKafka = async() => {
      await producer.connect(); 
      await producer.send({ 
        topic,
        messages : [{
            value : `search data ${JSON.stringify(user.map((users) => {
                return {
                    id : users.id,
                    name : users.name,
                    email : users.email
                
                }
            }))}`
        }]
      })
      }
      startKafka()

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
    res.status(200).send({
    
         id : user.id,
         name : user.name,
         email : user.email,
         createdAt : user.createdAt,
         updatedAt : user.updatedAt,

        });
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

    const startKafka = async() => {
    await producer.connect();
    await producer.send({
        topic,
        messages : [{
            value : ` user 
            id : ${user.id},
            name : ${user.name},
            email : ${user.email}
             updated info`
        }]
    })
    }
    startKafka()

    return res.status(201).send({
        id : user.id,
        name : user.name,
        email : user.email,
        createdAt : user.createdAt,
        updatedAt : user.updatedAt,
    }); 

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

        const startKafka = async() => {
            await producer.connect();
            await producer.send({
                topic,
                messages : [{
                    value : `user with
                    id : ${user.id} 
                    name : ${user.name},
                    email : ${user.email}
                    deleted account`
                }]
            }) 
            }
            startKafka()

            await user.destroy();

        res.status(200).send("user is deleted successfully");

    }catch(err){
        res.status(500).send("error in deletion".err)
    }
 }