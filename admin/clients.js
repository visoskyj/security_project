module.exports = (function() {
  var express = require("express");
  var router = express.Router();

  function getPeople(res, mysql, context, complete) {
    mysql.pool.query(
      "SELECT clientID, firstName, lastName, countryResidency FROM Clients c  ORDER BY clientID",
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

  function getBranches(res, mysql, context, complete) {
    mysql.pool.query("SELECT branchID, branchCity FROM BankBranches", function(
      error,
      results,
      fields
    ) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }
      context.branches = results;
      complete();
    });
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
    getBranches(res, mysql, context, complete);
    function complete() {
      callbackCount++;
      if (callbackCount >= 2) {
        res.render("adminPortal/clientsHB", context);
      }
    }
  });

  /* Adds a person, redirects to the people page after adding */

  router.post("/", function(req, res) {
    var mysql = req.app.get("mysql");
    var sql =
      "INSERT INTO Clients (firstName, lastName, countryResidency) VALUES (?,?,?)";
    var inserts = [
      req.body.fname,
      req.body.lname,
      req.body.country,
      req.body.branch
    ];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
      if (error) {
        console.log(JSON.stringify(error));
        res.write(JSON.stringify(error));
        res.end();
      } else {
        res.redirect("clients");
      }
    });
  });

  router.get("/:id", function(req, res) {
    var mysql = req.app.get("mysql");
    var clientID = req.params.id;

    mysql.pool.query(
      "SELECT clientID, firstName, lastName, countryResidency FROM Clients WHERE clientID = ?",
      [clientID],
      function(error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }
        var client = results[0];

        mysql.pool.query(
          "SELECT branchID, branchCity, branchPhone FROM BankBranches",
          function(error, results, fields) {
            if (error) {
              res.write(JSON.stringify(error));
              res.end();
            }

            for (var i = 0; i < results.length; i++) {
              if (results[i].branchID == client.branchID) {
                results[i].selected = true;
              }
            }

            var context = {
              clientID: clientID,
              firstName: client.firstName,
              lastName: client.lastName,
              countryResidency: client.countryResidency,
              branchID: client.branchID,
              branches: results
            };

            res.render("adminPortal/updateClient", context);
          }
        );
      }
    );
  });

  router.post("/update/:id", function(req, res) {
    var mysql = req.app.get("mysql");
    var clientID = req.params.id;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var countryResidency = req.body.countryResidency;
    // var branchID = req.body.branchID;

    mysql.pool.query(
      "UPDATE Clients SET firstName = ?, lastName = ?, countryResidency = ? WHERE clientID = ?",
      [firstName, lastName, countryResidency, clientID],
      function(err, result, fields) {
        if (err) {
          throw err;
        }

        res.redirect("/clients");
      }
    );
  });

  router.delete("/:id", function(req, res) {
    var mysql = req.app.get("mysql");
    var clientID = req.params.id;

    mysql.pool.query(
      "DELETE FROM AccountUsers WHERE clientID = ?",
      [clientID],
      function(err, result) {
        if (err) {
          throw err;
        }

        mysql.pool.query(
          "DELETE FROM Clients WHERE clientID = ?",
          [clientID],
          function(err, result) {
            if (err) {
              throw err;
            }

            res.sendStatus(200);
          }
        );
      }
    );
  });

  return router;
})();
