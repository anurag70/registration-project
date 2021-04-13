require('dotenv').config();
const express = require('express');
const path = require("path")
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

require("./db/conn");
const hbs = require("hbs");
const Register = require("../src/models/register");
const { json } = require("express");
const { log } = require("console");

const port = process.env.PORT || 5000;

//console.log(path.join(__dirname, "../public"));
const staticpath = path.join(__dirname, "../public")
app.use(express.static(staticpath))

const viewsPath = path.join(__dirname, "../templates/views")
const partialsPath = path.join(__dirname, "../templates/partials")
app.set("view engine", "hbs");
app.set("views", viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }))

console.log(process.env.SECRET_KEY);
app.get("/", (req, res) => {
    //res.send("jod")
    res.render("register");
});

app.get("/register", (req, res) => {
        res.render("register");
    })
    //create a new user in database
app.post("/register", async(req, res) => {
    try {
        //console.log(req.body.firstname);
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword,


            })
            console.log(registerEmployee);
            const token = await registerEmployee.generateAuthToken();
            console.log(`the token part ${token}`);
            //password hash before saving(middleware)

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 300000),
                httpOnly: true
            });
            console.log(cookie)


            const registered = await registerEmployee.save();
            console.log(registered);
            res.status(201).render("index");
        } else {
            res.send("user details are not matching")
        }

    } catch (error) {
        res.status(400).send(error);
    }
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post("/login", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        //console.log(`${email} and ${password}`);

        const userEmail = await Register.findOne({ email: email });
        // res.send(userEmail);
        //console.log(userEmail);

        //checking
        const isMatch = await bcrypt.compare(password, userEmail.password);
        //adding token at the time of login
        const token = await userEmail.generateAuthToken();
        //console.log(`the token part ${token}`);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 600000),
            httpOnly: true,
            //secure:true
        });
        //console.log(cookie)
        console.log(`${req.cookies.jwt}`);

        if (isMatch) {
            res.status(201).render("index");
        } else {
            res.send("password is not matching")
        }
        // console.log(isMatch);


    } catch (error) {
        res.status(400).send("invalid email");
    }
});
app.listen(port, () => {
    console.log(`server is running in port no ${port}`);
})