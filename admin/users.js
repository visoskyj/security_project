module.exports = (function() {
  var express = require("express");
  var router = express.Router();

  var clientArr = [];
  var accountArr = [];

  function getPeople(res, mysql, context, complete) {
    mysql.pool.query(
      "SELECT c.clientID, firstName, lastName, accountType, a.accountID FROM AccountUsers au INNER JOIN Clients c ON c.clientID = au.clientID INNER JOIN Accounts a ON a.accountID = au.accountID ",
      function(error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }
        accountArr = [];
        clientArr = [];

        results.forEach(element => {
          accountArr.push(element.accountID);
          clientArr.push(element.clientID);
        });

        context.users = results;
        complete();
      }
    );
  }

  function getAccounts(res, mysql, context, complete) {
    mysql.pool.query(
      "SELECT accountID FROM Accounts ORDER BY accountID",
      function(error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }
        context.accounts = results;
        complete();
      }
    );
  }

  function getClients(res, mysql, context, complete) {
    mysql.pool.query(
      "SELECT clientID, firstName, lastName FROM Clients",
      function(error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }
        context.clients = results;
        complete();
      }
    );
  }

  /* Display all people. Requires web based javascript to delete users with AJAX */

  router.get("/", function(req, res) {
    var callbackCount = 0;
    var context = {};
    if(!req.session.userLogin){
      res.redirect('loginPage')
      return;
    }
    var mysql = req.app.get("mysql");
    getPeople(res, mysql, context, complete);
    getAccounts(res, mysql, context, complete);
    getClients(res, mysql, context, complete);
    function complete() {
      callbackCount++;
      if (callbackCount >= 3) {
        res.render("adminPortal/usersHB", context);
      }
    }
  });

  /* Adds a person, redirects to the people page after adding */

  router.post("/", function(req, res) {
    var mysql = req.app.get("mysql");
    var acctIDinput = req.body.accountSelection;
    var clientIDinput = req.body.clientSelection;
    var userExists = 0;

    for (var i = 0; i < accountArr.length; i++) {
      if (accountArr[i] == acctIDinput)
        if (clientArr[i] == clientIDinput) {
          res.redirect("users");
          userExists = 1;
          break;
        }
    }

    if (!userExists) {
      var sql = "INSERT INTO AccountUsers (accountID, clientID) VALUES (?,?)";
      var inserts = [req.body.accountSelection, req.body.clientSelection];
      sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
        if (error) {
          console.log(JSON.stringify(error));
          res.write(JSON.stringify(error));
          res.end();
        } else {
          res.redirect("users");
        }
      });
    }
  });

  router.delete("/", function(req, res) {
    var mysql = req.app.get("mysql");
    var accountID = req.query.accountID;
    var clientID = req.query.clientID;

    mysql.pool.query(
      "DELETE FROM AccountUsers WHERE accountID = ? AND clientID = ?",
      [accountID, clientID],
      function(err, result) {
        if (err) {
          throw err;
        }

        res.sendStatus(200);
      }
    );
  });

  return router;
})();
