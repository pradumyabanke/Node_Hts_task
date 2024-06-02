const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CreateModel = require("../Models/UserRegister");


//===================== [ Create User ] =====================/

const createUser = async function (req, res) {
    try {
        let data = req.body;
        let { first_name,last_name, email, password } = data;

        if (await CreateModel.findOne({ email: email }))
            return res
                .status(400)
                .send({ status: false, message: "Email already exist" });

        const encryptedPassword = bcrypt.hashSync(password, 12);
        req.body["password"] = encryptedPassword;

        var token = jwt.sign(
            {
                userId: CreateModel._id,
            },
            "project"
        );
        data.token = token;

        let savedData = await CreateModel.create(data);
        res.status(201).send({
            status: true,
            msg: "User Register Successfull",
            data: {
                first_name: savedData.first_name,
                last_name: savedData.last_name,
                email: savedData.email,
                password: savedData.password,

            },
        });
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//===================== [ User Login ] =====================/

const userLogin = async function (req, res) {
    try {
        let data = req.body;
        let { email, password } = data;

        let userExists = await CreateModel.findOne({ email: email });

        if (!userExists) {
            return res.status(400).send({
                status: false,
                msg: "Email and Password is Invalid",
            });
        }

        let compared = await bcrypt.compare(password, userExists.password);
        if (!compared) {
            return res.status(400).send({
                status: false,
                message: "Your password is invalid",
            });
        }
        var token = jwt.sign(
            {
                userId: userExists._id,
            },
            "project"
        );

        let updateToken = await CreateModel.findByIdAndUpdate(
            { _id: userExists._id },
            { token },
            { new: true }
        );
        userExists.token = updateToken.token;

        return res.status(200).send({
            status: true,
            msg: " Admin Login successfully",
            data: userExists,
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message,
        });
    }
};


//=======================================//
module.exports = {
    createUser,
    userLogin,

}




