/*
    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
*/

var express = require("express");
var mysql = require("./dbcon.js");
var bodyParser = require("body-parser");
var session = require('express-session');

var app = express();
var handlebars = require("express-handlebars").create({
  defaultLayout: "main"
});

app.engine("handlebars", handlebars.engine);
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'SuperSecretPassword',
    resave: true,
    saveUninitialized: true
}));

app.use("/static", express.static("public"));
app.set("view engine", "handlebars");
app.set("port", process.argv[2]);
app.set("mysql", mysql);
app.use("/", express.static("public"));

app.use("/loginPage", require("./client/loginPage.js"));

app.use("/clients", require("./admin/clients.js"));
app.use("/employees", require("./admin/employees.js"));
app.use("/branches", require("./admin/branches.js"));
app.use("/accounts", require("./admin/accounts.js"));
app.use("/users", require("./admin/users.js"));

app.use("/balance", require("./client/balance.js"));
app.use("/transfer", require("./client/transfer.js"));
app.use("/buyGold", require("./client/buyGold.js"));
app.use("/account_info", require("./client/account_info.js"));

app.use(function(req, res) {
  res.status(404);
  res.render("404");
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render("500");
});

app.listen(app.get("port"), function() {
  console.log(
    "Express on http://localhost:" +
      app.get("port") +
      "\nPress Ctrl-C to terminate."
  );
});
