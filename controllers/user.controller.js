const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
const imgMw = require("../middlewares/imageMw.js");
const Users_path = process.env.SERVER_HOST + "/public/images/users/";
const usersPath = process.cwd() + "/public/images/users/";
const jwt = require("jsonwebtoken");
const fs = require("fs");
const config = require("../config/middlewares.js");

exports.createNewUser = async (req, res, next) => {
  const { name, email, password, avatar, role, hash, file_name } = req.body;
  let avatarObj;
  try {
    await bcrypt.hash(password, 10).then(async (hashedPass) => {
      if (avatar) {
        avatarObj = imgMw.uploadFilesAndPdf(avatar, file_name, "users");
      }
      let user = await User.create({
        name: name,
        email: email,
        password: hashedPass,
        avatar: avatar ? avatarObj[0].fileName : "defaultUser.png",
        role: "user",
      });
      if (user == null) {
      } else {
        const user_id = user.dataValues.id;
        const user_email = user.dataValues.email;
        const user_name = user.dataValues.name;
        const user_avatar = user.dataValues.avatar;
        const user_role = user.dataValues.role;
        // here we will handel res and add user token
        let token;
        token = jwt.sign(
          {
            id: user_id,
            name: user_name,
            email: user_email,
            avatar: user_avatar,
            role: user_role,
          },
          process.env.secret,
          { expiresIn: "1d" }
        );
        return res.status(200).json({
          status_code: 200,
          data: {
            user: {
              name: user_name,
              email: user_email,
              avatar: config.checkAttachmentType(user_avatar)
                ? Users_path + user_avatar
                : user_avatar,
              role: user_role,
            },
            token,
          },
          message: `success`,
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      status_code: 500,
      data: null,
      message: `${err}`,
    });
  }
};

exports.forgetPassword = async (req, res, next) => {
  const email = req.body.email;
  try {
    let user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (user != null) {
      let hashed = config.generateRandomString();
      let currentDate = new Date();
      let expire_date = currentDate.setMinutes(currentDate.getMinutes() + 120);
      const subject = "reset password pm-camp";
      const message = "reset password";
      dynamicData = {
        expiration_date: expire_date,
        email: email,
        logo: `${process.env.SERVER_FRONT_HOST}/assets/email/logo.png`,
        icon: `${process.env.SERVER_FRONT_HOST}/public/images/email-template/reset_password.png`,
        hash: `${process.env.SERVER_FRONT_HOST}/login/password/reset/${hashed}`,
        subject,
        message,
      };

      info = await emailMw.sendEmail("reset", email, dynamicData);

      let success = config.myCash
        .getMyCash()
        .set(
          `${hashed}`,
          { hash: hashed, expire_date: expire_date, email: email },
          7200
        );
      return res.status(200).json({
        status_code: 200,
        message: `${getMyLang().__("successMsg")}`,
        data: null,
      });
    } else throw new Error(`${getMyLang("emailNotExist")}`);
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      message: `${getMyLang().__("serverError")}`,
      data: null,
    });
  }
};

exports.checkForgetHash = async (req, res, next) => {
  const hash = req.params.hash;
  const { password, confirm_password } = req.body;
  try {
    // here get expiration date and check if it not expire
    let current_date = new Date();
    let hashed_obj = config.myCash.getMyCash().get(`${hash}`);
    if (hashed_obj && hashed_obj.expire_date > current_date) {
      // console.log("hashed obj   ====>>> ", hashed_obj);
      const email = hashed_obj.email;
      let user_obj = await User.findOne({
        where: {
          email: email,
        },
      });
      if (user_obj != null) {
        if (password != undefined && confirm_password != undefined) {
          if (password == confirm_password) {
            await bcrypt.hash(password, 10).then(async (hashedPass) => {
              await user_obj.update({
                password: hashedPass,
              });
            });
            // here delete hash from cache
            config.myCash.getMyCash().del(hash);
            res.status(200).json({
              status_code: 200,
              data: null,
              message: `${getMyLang().__("successMsg")}`,
            });
          }
        } else {
          throw new Error(`${getMyLang().__("passMatch")}`);
        }

        //  check for pass,confirm_pass
      } else {
        throw new Error(`${getMyLang().__("serverError")}`);
      }
    }
    // then here we will find the email and user id to update if hash does not expired
    else {
      console.log("expired");
      throw new Error("hash is expired!");
    }
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      data: null,
      message: `${getMyLang().__("serverError")}`,
    });
  }
};

exports.getUserInfoForSettings = async (req, res) => {
  try {
    const id = +req.id;
    const user = await User.findOne({
      where: {
        id: id,
      },
      attributes: ["name", "email", "avatar", "role"],
    });
    if (user != null) {
      const avatar = user.dataValues.avatar;
      user.dataValues.avatar = Users_path + avatar;
      return res.status(200).json({
        status_code: 200,
        data: user,
        message: `success`,
      });
    } else {
      return res.status(404).json({
        status_code: 404,
        data: null,
        message: `userNotFound`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: `${error}`,
    });
  }
};

exports.updateUserAccount = async (req, res) => {
  try {
    const { name, email, file_name } = req.body;
    let avatar = req.body.avatar;
    const id = +req.id;

    const user = await User.findByPk(id);
    if (user != null) {
      let oldAvatar = user.dataValues.avatar;
      if (avatar && file_name) {
        let avatarObj = imgMw.uploadFilesAndPdf(avatar, file_name, "users");
        avatar = avatarObj[0].fileName;
      }
      await user.update({
        name: name,
        email: email,
        avatar: avatar ? avatar : oldAvatar,
      });
      let isImage = config.checkAttachmentType(oldAvatar) ? true : false;
      if (isImage && oldAvatar != "defaultUser.png") {
        imagePath = `${usersPath}${oldAvatar}`;
        fs.unlink(imagePath, (error) => {
          if (error) {
            throw new Error(error);
          }
        });
      }
      const userData = {
        name: user.dataValues.name,
        email: user.dataValues.email,
        avatar: isImage
          ? `${Users_path}${user.dataValues.avatar}`
          : user.dataValues.avatar,
      };
      // user.dataValues.id;
      return res.status(200).json({
        status_code: 200,
        data: { user: userData },
        message: "success",
      });
    } else {
      return res.status(404).json({
        status_code: 404,
        data: null,
        message: `user not found`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: `${error}`,
    });
  }
};

exports.deleteUserAccount = async (req, res) => {
  try {
    const id = +req.id;
    const user = await User.findByPk(id);
    if (user != null) {
      let oldAvatar = user.dataValues.avatar;
      let isImage = false;
      let extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
      extensions.map((extension) => {
        if (oldAvatar.includes(extension)) {
          isImage = true;
        }
      });
      if (isImage) {
        imagePath = `${usersPath}${oldAvatar}`;
        fs.unlink(imagePath, (error) => {
          if (error) {
            throw new Error(error);
          }
        });
      }
      await user.destroy();
      return res.status(200).json({
        status_code: 200,
        data: null,
        message: `succ`,
      });
    } else {
      return res.status(404).json({
        status_code: 404,
        data: null,
        message: `user not found`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: `${error}`,
    });
  }
};

exports.updateUserPassword = async (req, res) => {
  try {
    const id = +req.id;
    const user = await User.findByPk(id);
    const { originalPassword, newPassword } = req.body;
    if (user != null) {
      const userPassword = user.password;
      bcrypt.compare(originalPassword, userPassword).then(async (isEqual) => {
        if (!isEqual) {
          return res.status(400).json({
            status_code: 400,
            data: null,
            message: "Old Password Incorrect ",
          });
        }
        await bcrypt.hash(newPassword, 10).then(async (hashedPass) => {
          await user.update({
            password: hashedPass,
          });
          return res.status(200).json({
            status_code: 200,
            data: null,
            message: `success`,
          });
        });
      });
    } else {
      return res.status(404).json({
        status_code: 404,
        data: null,
        message: "User Not Found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      data: null,
      message: `serverError`,
    });
  }
};
