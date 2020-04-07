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

    function getEmployeesByBranch(req, res, mysql, context, complete){
      var query = "SELECT a_m.employeeID, firstName, lastName, branchCity FROM AccountManagers a_m INNER JOIN BankBranches b_b ON a_m.branchID = b_b.branchID ORDER BY a_m.employeeID WHERE bsg_people.homeworld = ?";
      console.log('here!')
      var inserts = [req.params.branch]
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            console.log(results)
            context.employees = results;
            complete();
        });
    }

    /* Display all people. Requires web based javascript to delete users with AJAX */

    router.get('/', function(req, res){
        console.log('hello, in empFilter')
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["filterEmployees.js"];
        var mysql = req.app.get('mysql');
        console.log('here original get')
        console.log(req.query.branch)
        getEmployees(res, mysql, context, complete);
        getBranches(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('adminPortal/employeesHB', context);
            }

        }
    });

    /*Display all people from a given homeworld. Requires web based javascript to delete users with AJAX*/
    router.get('/filter/:branch', function(req, res){
        var callbackCount = 0;
        var context = {};
        console.log('here')
        context.jsscripts = ["filterEmployees.js"];
        var mysql = req.app.get('mysql');
        getEmployeesByBranch(req, res, mysql, context, complete);
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
