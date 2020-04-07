module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getEmployees(res, mysql, context, complete){
        mysql.pool.query("SELECT a_m.employeeID, firstName, lastName, branchCity FROM AccountManagers a_m INNER JOIN BankBranches b_b ON a_m.branchID = b_b.branchID ORDER BY a_m.employeeID", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.employees = results;
            complete();
        });
    }

    function getBranches(res, mysql, context, complete){
        mysql.pool.query("SELECT branchID, branchCity FROM BankBranches", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.branches  = results; 
            complete();
        });
    }

    function getEmployeesByBranch(res, mysql, context, complete, branchID){
      mysql.pool.query("SELECT a_m.employeeID, firstName, lastName, branchCity, a_m.branchID FROM AccountManagers a_m INNER JOIN BankBranches b_b ON a_m.branchID = b_b.branchID WHERE a_m.branchID = " + branchID, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.employees = results;
            complete();
        });
    }

    /* Display all people. Requires web based javascript to delete users with AJAX */

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        if(!req.session.userLogin){
          res.redirect('loginPage')
          return;
        }
        var mysql = req.app.get('mysql');

        var branchID = req.query.branch
        
        if(branchID == undefined || branchID == 0) // if no branch has been selected for filtering
            getEmployees(res, mysql, context, complete);
        else getEmployeesByBranch(res, mysql, context, complete, branchID)

        getBranches(res, mysql, context, complete);

        function complete(){
            callbackCount++;

            if(callbackCount >= 2){
                res.render('adminPortal/employeesHB', context);
            }

        }
    });

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO AccountManagers (firstName, lastName, branchID) VALUES (?,?,?)";
        var inserts = [req.body.fname, req.body.lname, req.body.branch];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('employees');
            }
        });
    });



    return router;
}();
