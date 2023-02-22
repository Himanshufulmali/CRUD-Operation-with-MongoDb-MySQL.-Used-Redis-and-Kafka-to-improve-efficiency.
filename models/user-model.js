const Sequelize = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB,
    process.env.USER,
    process.env.PASSWORD,
    {
    dialect : process.env.dialect,
    host : process.env.host
    }
)

exports.User = sequelize.define("user",{
    id : {
      type : Sequelize.INTEGER,
      allowNull : false,
      autoIncrement : true,
      primaryKey : true
    }, 
    name : {
        type : Sequelize.STRING,
        allowNull : false,  
    },
    email : {
        type : Sequelize.STRING,
        allowNull : false, 
        unique : true 
    }, 
    password : { 
        type : Sequelize.STRING,
        allowNull : false
    }

})