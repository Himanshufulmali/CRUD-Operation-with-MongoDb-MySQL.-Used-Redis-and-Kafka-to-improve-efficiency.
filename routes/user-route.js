const { signup, signin, findData, findById, updateData, deleteData } = require("../controllers/user-controller");
const { signupMw, signinMw } = require("../middlewares/user-middleware");



module.exports = (app) => {
    app.post("/mysql/apis/test/user/signup",[signupMw],signup);
    app.post("/mysql/apis/test/user/signin",[signinMw],signin);
    app.get("/mysql/apis/test/user",findData);
    app.get("/mysql/apis/test/user/:id",findById);
    app.put("/mysql/apis/test/user/:id",updateData);
    app.delete("/mysql/apis/test/user/:id",deleteData);
}