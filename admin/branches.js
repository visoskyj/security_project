module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getPeople(res, mysql, context, complete){
        mysql.pool.query("SELECT branchID, branchCity, branchPhone FROM BankBranches", 
            function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.branches = results;
            complete();
        });
    }

    /* Display all people. Requires web based javascript to delete users with AJAX */

    router.get('/', function(req, res){
        var context = {};
        if(!req.session.userLogin){
            res.redirect('loginPage')
            return;
        }
        var mysql = req.app.get('mysql');
        getPeople(res, mysql, context, complete);
        function complete(){
            res.render('adminPortal/branchesHB', context);
        }
    });

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO BankBranches (branchCity, branchPhone) VALUES (?,?)";
        var inserts = [req.body.location, req.body.phone];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('branches');
            }
        });
    });

    return router;
}();
