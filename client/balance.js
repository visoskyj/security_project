var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = function(){
    var express = require('express');
    var router = express.Router();

    var currGoldPrice;

    function formatPrice(oldPrice){            
        return (oldPrice).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    function goldMarketPrice(finish, goldOz){
        var req = new XMLHttpRequest();
        req.open("GET", "https://data-asg.goldprice.org/dbXRates/USD", true);
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                var goldAPI_response = JSON.parse(req.responseText)
                currGoldPrice =  formatPrice(goldOz * goldAPI_response.items[0].xauPrice)
                finish()
            } else console.log("Error in network request: " + req.statusText);
            })
        req.send(null);
    }

    function getBalances(res, mysql, context, complete, ID){
        mysql.pool.query("SELECT firstName, lastName, cashBalance, goldBalance FROM Accounts a INNER JOIN AccountUsers au ON a.accountID = au.accountID INNER JOIN Clients c ON au.clientID = c.clientID WHERE a.accountID = " + ID, 
            function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }

            if(results == ''){
                mysql.pool.query("SELECT cashBalance, goldBalance FROM Accounts WHERE accountID = " + ID, 
                    function(error, results, fields){
                        goldOz = results[0].goldBalance
                        context.firstName = '{No Active Account Users}'
                        context.lastName = ''
                        context.myID = ID
                        context.balance = formatPrice(results[0].cashBalance)
                        context.gold = results[0].goldBalance.toFixed(2)
                        goldMarketPrice(finish, goldOz);
                    })
            }
            else {
                goldOz = results[0].goldBalance
                context.firstName = results[0].firstName
                context.lastName = results[0].lastName
                context.myID = ID
                context.balance = formatPrice(results[0].cashBalance)
                context.gold = results[0].goldBalance.toFixed(2)
                goldMarketPrice(finish, goldOz);
            }

            // goldOz = results[0].goldBalance
            // context.client = results[0]
            // context.myID = ID
            // context.balance = formatPrice(results[0].cashBalance)
            // context.gold = results[0].goldBalance.toFixed(2)
            // goldMarketPrice(finish, goldOz);

            function finish(){
                context.goldEquiv = currGoldPrice
                complete();
            } 
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
        
        if(ID > 0 || ID < 20)
            getBalances(res, mysql, context, complete, ID);
        else complete()

        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                context.layout = 'alt'
                res.render('clientPortal/balance', context)
            }
        }
    });
    return router;
}();
