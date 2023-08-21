const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const user = require("../models/user_model")
const akay = "akshya bal"





const signup = async (req, res) => {
  try {
    const usertoken=req.params.token;
    console.log(usertoken)
  const decode = jwt.verify(usertoken,"secret_key")
  console.log(decode.name);


  try {
      const existing = await user.findOne({ email:decode.email })
      if (existing) {
          return res.send("user already exit")
      }
      else {
          const hashedpass = await bcrypt.hash(decode.password, 10);
          var user_data = new user({
              name: decode.name,
              telephone: decode.telephone,
              email:decode. email,
              address: decode.address,
              password: hashedpass,
              gender:decode.gender,
              Dob: decode.Dob


          })
          await user_data.save()

          const token = jwt.sign({ email: user_data.email, id: user_data.id, role: user_data.role }, akay)

          res.cookie("jwt", token)


      }

      await res.redirect("/sucessfull.hbs")

  }
  catch (error) {
      console.log("Internal error");
  }
  } catch (error) {
   console.log("SErver error"); 
  };
  
}
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const existing = await user.findOne({ email: email });
      if (existing) { // check if user exists
        const match = await bcrypt.compare(password, existing.password);
        if (match) {
          const token = jwt.sign({ email: existing.email, id: existing.id, role: existing.role }, akay);
          res.cookie("jwt", token);
          res.redirect("/");
        } else {
          const errormessage = "Wrong Credentials";
          res.render("login", { errormessage });
        }
      } else {
        const errormessage = "User not found";
        res.render("login", { errormessage });
      }
    } catch (error) {
      console.log(error);
      const errormessage = "An error occurred, please try again later";
      res.render("login", { errormessage });
    }
  };

const logout = (req, res, next) => {
    res.cookie("jwt", "", {
        maxAge: 1
    })
    res.redirect("/")
    next();


}




module.exports = { signup, login, akay, logout };