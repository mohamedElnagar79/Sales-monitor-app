const Sequelize = require("sequelize");
const { username, password, database, host, dialect } =
  require("./config").development;
const sequelize = new Sequelize(database, username, password, {
  dialect: dialect,
  host: host,
});
module.exports = sequelize;
