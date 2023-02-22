const { signup, signin, findData, findById, updateData, deleteData } = require("../controllers/user-controller")



module.exports = (app) => {
    app.post("/mysql/apis/test/user/signup",signup);
    app.post("/mysql/apis/test/user/signin",signin);
    app.get("/mysql/apis/test/user",findData);
    app.get("/mysql/apis/test/user/:id",findById);
    app.put("/mysql/apis/test/user/:id",updateData);
    app.delete("/mysql/apis/test/user/:id",deleteData);
}