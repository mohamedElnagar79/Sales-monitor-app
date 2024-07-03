const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const config = require("../config/middlewares");
const Users_path = process.env.SERVER_HOST + "/public/images/users/";

module.exports.login = async (req, res, next) => {
  let remember = req.body.remember_me;
  try {
    let user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      bycrypt
        .compare(req.body.password, user.password)
        .then(async (isEqual) => {
          if (!isEqual) {
            res.status(400).json({
              status_code: 400,
              data: null,
              message: `invalid email or password`,
            });
          } else {
            let token;
            let expire_date = remember == 1 ? "30d" : "2d";
            token = jwt.sign(
              {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
              },
              process.env.secret,
              { expiresIn: expire_date }
            );
            user.avatar = config.checkAttachmentType(user.avatar)
              ? Users_path + user.avatar
              : user.avatar;
            return res.status(200).json({
              status_code: 200,
              data: {
                user: {
                  name: user.name,
                  email: user.email,
                  avatar: user.avatar,
                  role: user.role,
                },
                token,
              },
              message: `you are login successfully`,
            });
          }
        });
    } else {
      res.status(400).json({
        status_code: 400,
        data: null,
        message: `invalid email or password`,
      });
    }
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      data: null,
      message: error.message,
    });
  }
};
