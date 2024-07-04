const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token, decoded;
  try {
    if (req.get("Authorization") == undefined) {
      res.status(401).json({
        status_code: 401,
        data: null,
        message: "You should register first",
      });
    } else token = req.get("Authorization").split(" ")[1];
    decoded = jwt.verify(token, process.env.secret);
    req.id = decoded.id;
    req.name = decoded.name;
    req.email = decoded.email;
    req.avatar = decoded.avatar;
    req.role = decoded.role;
  } catch (error) {
    error.status = 401;
    error.message = "You are not authorized to access this resource";
    // next(error);
    res.status(401).json({
      status_code: 401,
      data: null,
      message: error.message,
    });
  }
  if (decoded !== undefined) {
    next();
  }
};
