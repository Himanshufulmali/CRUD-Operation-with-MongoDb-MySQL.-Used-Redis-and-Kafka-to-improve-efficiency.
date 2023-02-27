const {Kafka} = require("kafkajs");

const brokers = ["localhost:9092"];
const topic = "my-enter"
const clientId = "Himanshu1"

const kafka = new Kafka({brokers,clientId})
const producer = kafka.producer();


exports.startKafka = async(msg,response) => {

    await producer.connect();

    await producer.send({
      topic,
      messages : [{
       value : `${msg} : ${JSON.stringify(response)}` 
        }]
    })

  }
