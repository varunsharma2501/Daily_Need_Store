const jwt = require("jsonwebtoken")
const { akay, login } = require("../user controller/user_control")
const cookieParser = require("cookie-parser")
const user = require("../models/user_model")
const category = require("../models/category_models")

const auth = async (req, res, next) => {
    cookieParser();
    const token = req.cookies.jwt;

    if (token) {
        const decode = jwt.verify(token, "akshya bal")

        next();
    }
    else {
        const cate = await category.find()
        res.render("index", {
            cate: cate,
            err: "Login Required"
        })


    }
}
//

const auth2 = async (req, res, next) => {
    cookieParser();
    const token = req.cookies.jwt;


    if (token) {
        const decode = jwt.verify(token, "akshya bal")

        if (decode.role === "admin") {
            next()
        } else {
            res.send("<h1> -------------Access Denied------------  </h1>")
        }
    }
    else {
        res.redirect("/")


    }
}
// user name getting  from cookie
const un = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        const jwttoken = jwt.verify(token, "akshya bal", async (err, decodedtoken) => {
            if (err) {
                res.send("something went wrong")
                res.local.user = null;
                next();

            } else {
                const uname = await user.findById(decodedtoken.id);

                const userid = await user.findById({ _id: decodedtoken.id })

                const item = userid ? userid.cart.items.length : 0;
                res.locals.item = item;

                res.locals.user = uname;

                next()
            }
        })

    } else {
        res.locals.user = null;
        next();
    }
}
const auth3 = async (req, res, next) => {
    const token = req.cookies.jwt;
    const decode = jwt.verify(token, "akshya bal")
    const usert = decode.role
    console.log(usert);
    if (usert == "admin") {
        next()
    } else {
        res.json("ONLY USER CAN ACCESS THIS PAGE")
    }
}


module.exports = { auth, un, auth2, auth3 }