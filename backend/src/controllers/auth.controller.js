import { error } from "console";
import bcrypt from "bcryptjs"
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if(!fullName||!email||!password){
            return res.status(400).json({
                message: "All fields should be filled"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname: fullName,
            email,
            password: hashedPassword
        });

        if (newUser) {
            await newUser.save();

            generateToken(newUser._id, res);

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilepic: newUser.profilepic,
            });
        } else {
            res.status(400).json({
                message: "Invalid user data"
            });
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilepic: user.profilepic,
        });

    } catch (error) {
        console.log("Error in login controller:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const logout = (req,res)=>{
    res.send("logout route")
};

export const updateProfilePic = async (req, res) => {
    try {
        const { profilepic } = req.body;

        if (!profilepic) {
            return res.status(400).json({
                message: "Profile picture is required"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.profilepic = profilepic;

        await user.save();

        res.status(200).json({
            message: "Profile picture updated successfully",
            profilepic: user.profilepic
        });

    } catch (error) {
        console.log("Error in updateProfilePic:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};