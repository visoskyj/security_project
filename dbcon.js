var mysql = require("mysql");
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_visoskyj',
  password        : '8718',
  database        : 'cs340_visoskyj'
});
module.exports.pool = pool;

// var pool = mysql.createPool({
//   connectionLimit: 10,
//   host: "localhost",
//   user: "root",
//   password: "anqi340pw",
//   database: "anqi340"
// });
// module.exports.pool = pool;
