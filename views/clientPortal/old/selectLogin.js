
module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getPeople(res, mysql, context, complete){
        mysql.pool.query("SELECT a.accountID, accountType, username, branchCity, firstName, lastName FROM Accounts a INNER JOIN AccountUsers au ON a.accountID = au.accountID INNER JOIN Clients c ON au.clientID = c.clientID INNER JOIN BankBranches bb ON a.branchID = bb.branchID WHERE a.accountID = 1", 
            function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                var namesArray = []
                results.forEach(
                    element => namesArray.push(' ' + element.firstName + ' ' + element.lastName)
                    )
                context.namesArray = namesArray
                context.acct = results[0]
                complete();
            });
    }

    /* Display all people. Requires web based javascript to delete users with AJAX */

    router.get('/', function(req, res){
        var context = {};
        var callbackCount = 0;
        var mysql = req.app.get('mysql');
        getPeople(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            context.layout = 'blank'
            res.render('loginPortal/selectLogin', context)

            if(callbackCount >= 1){
            }
        }
    });

    return router;
}();
