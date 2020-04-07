module.exports = (function() {
  var express = require("express");
  var router = express.Router();

  function formatPrice(oldPrice) {
    return oldPrice.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  }

  function getAccounts(res, mysql, context, complete) {
    mysql.pool.query(
      "SELECT accountID, accountType, username, password, cashBalance, goldBalance, firstName, lastName, branchCity FROM Accounts a LEFT JOIN AccountManagers am ON a.employeeID = am.employeeID INNER JOIN BankBranches bb ON a.branchID = bb.branchID ORDER BY accountID",
      function(error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }
        context.accounts = results;
        for (i in results) {
          results[i].cashBalance = formatPrice(results[i].cashBalance);
          results[i].goldBalance = results[i].goldBalance.toFixed(2);
        }
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

  function getAccountManagers(res, mysql, context, complete) {
    mysql.pool.query(
      "SELECT employeeID, firstName, lastName FROM AccountManagers",
      function(error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }
        context.accountManagers = results;
        complete();
      }
    );
  }

  function selectAccountManager(res, mysql, branch, complete) {
    mysql.pool.query(
      "SELECT employeeID FROM AccountManagers WHERE branchID = " + branch,
      function(error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }
        var randomIndex = Math.floor(
          Math.random() * Math.floor(results.length)
        );

        complete(results[randomIndex].employeeID);
        return results[randomIndex].employeeID;
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

    context.jsscripts = [
      "deleteperson.js",
      "filterpeople.js",
      "searchpeople.js"
    ];
    var mysql = req.app.get("mysql");
    getAccounts(res, mysql, context, complete);
    getBranches(res, mysql, context, complete);
    getAccountManagers(res, mysql, context, complete);
    function complete() {
      callbackCount++;
      if (callbackCount >= 3) {
        res.render("adminPortal/accountsHB", context);
      }
    }
  });

  /* Adds a person, redirects to the people page after adding */

  router.post("/", function(req, res) {
    var mysql = req.app.get("mysql");
    var sql =
      "INSERT INTO Accounts (accountID, accountType, username, password, cashBalance, goldBalance, branchID, employeeID) VALUES (?,?,?,?,?,?,?,?)";
    var assignedManager = selectAccountManager(
      res,
      mysql,
      req.body.branch,
      complete
    );

    function complete(assignedManager) {
      var inserts = [
        req.body.id,
        req.body.accountType,
        req.body.username,
        req.body.password,
        req.body.cashBalance,
        req.body.goldBalance,
        req.body.branch,
        assignedManager
      ];
      sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
        if (error) {
          console.log(JSON.stringify(error));
          res.write(JSON.stringify(error));
          res.end();
        } else {
          res.redirect("accounts");
        }
      });
    }
  });

  router.get("/:id", function(req, res) {
    var mysql = req.app.get("mysql");
    var accountID = req.params.id;

    mysql.pool.query(
      "SELECT accountID, employeeID, accountType, username, password, cashBalance, goldBalance, a.branchID FROM Accounts a JOIN BankBranches bb ON a.branchID = bb.branchID WHERE accountID = ?",
      [accountID],
      function(error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }

        var account = results[0];

        mysql.pool.query(
          "SELECT branchID, branchCity, branchPhone FROM BankBranches",
          function(error, results, fields) {
            if (error) {
              res.write(JSON.stringify(error));
              res.end();
            }

            var branches = results;

            mysql.pool.query(
              "SELECT employeeID, firstName, lastName FROM AccountManagers",
              function(error, results) {
                if (error) {
                  res.write(JSON.stringify(error));
                  res.end();
                }

                var accountManagers = results;

                for (var i = 0; i < branches.length; i++) {
                  if (branches[i].branchID == account.branchID) {
                    branches[i].selected = true;
                  }
                }

                for (var i = 0; i < accountManagers.length; i++) {
                  if (accountManagers[i].employeeID == account.employeeID) {
                    accountManagers[i].selected = true;
                  }
                }

                var accountTypes = [
                  { name: "Personal" },
                  { name: "Joint" },
                  { name: "Corporate" }
                ];

                for (var i = 0; i < accountTypes.length; i++) {
                  if (accountTypes[i].name == account.accountType) {
                    accountTypes[i].selected = true;
                  }
                }

                var context = {
                  accountID: accountID,
                  employeeID: account.employeeID,
                  accountType: account.accountType,
                  username: account.username,
                  password: account.password,
                  cashBalance: account.cashBalance,
                  goldBalance: account.goldBalance,
                  branchID: account.branchID,
                  accountTypes: accountTypes,
                  branches: branches,
                  accountManagers: accountManagers
                };

                res.render("adminPortal/updateAccount", context);
              }
            );
          }
        );
      }
    );
  });

  router.post("/update/:id", function(req, res) {
    var mysql = req.app.get("mysql");
    var accountID = req.params.id;
    var accountType = req.body.accountType;
    var username = req.body.username;
    var password = req.body.password;
    var cashBalance = req.body.cashBalance;
    var goldBalance = req.body.goldBalance;
    var branchID = req.body.branchID;
    var employeeID =
      req.body.employeeID === "null" ? null : req.body.employeeID;

    mysql.pool.query(
      "UPDATE Accounts SET accountType = ?, username = ?, password = ?, cashBalance = ?, goldBalance = ?, branchID = ?, employeeID = ? WHERE accountID = ?",
      [
        accountType,
        username,
        password,
        cashBalance,
        goldBalance,
        branchID,
        employeeID,
        accountID
      ],
      function(err, result, fields) {
        if (err) {
          throw err;
        }

        res.redirect("/accounts");
      }
    );
  });

  router.delete("/:id", function(req, res) {
    var mysql = req.app.get("mysql");
    var accountID = req.params.id;

    mysql.pool.query(
      "DELETE FROM AccountUsers WHERE accountID = ?",
      [accountID],
      function(err, result) {
        if (err) {
          throw err;
        }

        mysql.pool.query(
          "DELETE FROM Accounts WHERE accountID = ?",
          [accountID],
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
