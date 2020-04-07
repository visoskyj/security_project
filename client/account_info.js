
module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getPeople(res, mysql, context, complete, ID){
        mysql.pool.query("SELECT a.accountID, accountType, username, branchCity, firstName, lastName FROM Accounts a INNER JOIN AccountUsers au ON a.accountID = au.accountID INNER JOIN Clients c ON au.clientID = c.clientID INNER JOIN BankBranches bb ON a.branchID = bb.branchID WHERE a.accountID = " + ID, 
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
            context.myID = ID

            complete();
        });
    }

    /* Display all people. Requires web based javascript to delete users with AJAX */

    router.get('/', function(req, res){
        var context = {};
        var callbackCount = 0;

        if(!req.session.userLogin){
            res.redirect('loginPage')
            return;
        }
        var ID = req.session.userLogin
        var mysql = req.app.get('mysql');
        
        if(ID > 0 || ID < 20)
            getPeople(res, mysql, context, complete, ID);
        else complete()

        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                context.layout = 'alt'
                res.render('clientPortal/account_info', context)
            }
        }
    });

    return router;
}();




