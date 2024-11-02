const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");


const registerUser = async (req, res) => {
    const {userName, email, password} = req.body;

    try {
        const checkUser = await User.findOne({email});
        if (checkUser)
            return res.json({
                success: false,
                message: "User Already exists with the same email! Please try again",
            });

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            userName,
            email,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(200)
            .json({success: true, message: "Registered successfully"});


    } catch (err) {
        console.log(err);
        res.status(500)
            .json({success: false, message: "Error occurred could not register user: " + err.message});
    }

}

const loginUser = async (req, res) => {
    const {email, password} = req.body;

    try {
        /** @type {import('../models/User').User} */
        const checkUser = await User.findOne({email});

        if (!checkUser)
            return res.json({
                success: false,
                message: "User doesn't exists! Please register first",
            });

        const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
        if (!checkPasswordMatch) {
            return res.json({success: false, message: "Invalid username or password! Please try again"});
        }

        const jwtToken = jwt.sign(
            {
                id: checkUser._id,
                role: checkUser.role,
                email: checkUser.email,
                userName: checkUser.userName,
            },
            process.env.JWT_SECRET_KEY,
            {expiresIn: "60m"}
        );


        res.cookie("token", jwtToken, {httpOnly: true, secure: false})
            .json({
                success: true,
                message: "Logged in successfully",
                user: {
                    email: checkUser.email,
                    role: checkUser.role,
                    id: checkUser._id,
                    userName: checkUser.userName,
                },
            });

    } catch (err) {
        console.log(err);
        res.status(500)
            .json({success: false, message: "Error occurred could not log in: " + err.message});
    }

}

const logoutUser = (req, res) => {
    res.clearCookie("token")
        .json({
            success: true,
            message: "Logged out successfully",
        })
}

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized user",
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decoded);
        req.user = decoded;
        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized user",
        })
    }
}

module.exports = {registerUser, loginUser, logoutUser, authMiddleware};