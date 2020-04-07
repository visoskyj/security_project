
module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var curCash = -1

    function getBalance(res, mysql, context, complete, ID){
        mysql.pool.query("SELECT cashBalance FROM Accounts a WHERE a.accountID = " + ID, 
            function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            if(results != undefined)
                curCash = results[0].cashBalance
                context.balance = (results[0].cashBalance).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
            complete(); 
        });
    }

    function getAccountIDs(res, mysql, context, complete, ID){
        mysql.pool.query("SELECT accountID FROM Accounts WHERE accountID != " + ID + " ORDER BY accountID", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.accounts = results;
            complete();
        });
    }

    function updateBalance(res, mysql, context, complete, ID, wireAmount){
        mysql.pool.query("UPDATE Accounts SET cashBalance = cashBalance - " + wireAmount + 
            " WHERE accountID = " + ID, 
            function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                complete()
            });
    }

    router.get('/', function(req, res){
        var context = {};
        var callbackCount = 0;

        if(!req.session.userLogin){
            res.redirect('loginPage')
            return;
        }
        var ID = req.session.userLogin

        var mysql = req.app.get('mysql');
        context.myID = ID

        if(ID > 0 && ID < 20)
            getBalance(res, mysql, context, complete, ID);
        else complete()

        if(ID > 0 && ID < 20)
            getAccountIDs(res, mysql, context, complete, ID)
        else complete()        

        function complete(){
            callbackCount++;
            if(callbackCount == 2){
                context.layout = 'alt'
                res.render('clientPortal/transfer', context)
            }
        }
    });

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var context = {};
        var callbackCount = 0;

        if(!req.session.userLogin){
            res.redirect('loginPage')
            return;
        }
        var ID = req.session.userLogin

        context.myID = ID

        var otherAccountID = req.body.accountSelection
        var wireAmount = req.body.wireAmount

        if(wireAmount <= 0 || wireAmount > curCash){
            callbackCount = 4;
            console.log('Requested transfer amount invalid.')
            complete()
        }
        // if (transferAmount > accountBalance) or (amount < 0) refresh page, alert
        
        else{
            if(ID > 0 && ID < 20)
                updateBalance(res, mysql, context, complete, ID, wireAmount)
            else complete()

            if(ID > 0 && ID < 20)
                updateBalance(res, mysql, context, complete, otherAccountID, -wireAmount)
            else complete()

            if(ID > 0 && ID < 20)
                getBalance(res, mysql, context, complete, ID);
            else complete()

            if(ID > 0 && ID < 20)
                getAccountIDs(res, mysql, context, complete, ID)
            else complete()
        }

        function complete(){
            callbackCount++;
            if(callbackCount >= 4){
                context.layout = 'alt'
                res.redirect('../transfer')
            }
        }
    });



    return router;
}();
