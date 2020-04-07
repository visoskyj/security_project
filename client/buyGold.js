var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = function(){
    var express = require('express');
    var router = express.Router();

    var currGoldPrice;

    function formatPrice(oldPrice){            
        return (oldPrice).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    function goldMarketPrice(finish){
        var req = new XMLHttpRequest();
        req.open("GET", "https://data-asg.goldprice.org/dbXRates/USD", true);
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                var goldAPI_response = JSON.parse(req.responseText)
                currGoldPrice = goldAPI_response.items[0].xauPrice
                finish()
            } else console.log("Error in network request: " + req.statusText);
            })
        req.send(null);
    }

    function displayBalances(res, mysql, context, complete, ID){
        mysql.pool.query("SELECT cashBalance, goldBalance FROM Accounts WHERE accountID = " + ID, 
            function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            // context.client = results[0]
            context.myID = ID
            context.cashBalance = formatPrice(results[0].cashBalance)
            context.goldBalance = results[0].goldBalance.toFixed(2)
            goldMarketPrice(finish)
            function finish(){            
                context.goldPrice = formatPrice(currGoldPrice)
                complete();
            } 
        });
    }

    function getBalances(res, mysql, context, complete, ID, finish, goldToBuyOZ, goldToBuyUSD){
        mysql.pool.query("SELECT cashBalance, goldBalance FROM Accounts a  WHERE a.accountID = " + ID, 
            function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }

            var curCash = results[0].cashBalance
            var curGold = results[0].goldBalance
            var newGold, newCash

            if(goldToBuyUSD == undefined){
                newGold = curGold + goldToBuyOZ * 1
                newCash = curCash - (goldToBuyOZ * currGoldPrice)
            }
            else {
                newGold = curGold + (goldToBuyUSD / currGoldPrice)
                newCash = curCash - goldToBuyUSD * 1
            }
            // if client request leaves with negative $ or gold, do not update
            if (newGold < 0 || newCash < 0){
                finish(ID, curGold, curCash)
                console.log('Invalid gold purchase amount.')
            }
            else finish(ID, newGold, newCash)
        });
    }

    function updateBalance(res, mysql, context, complete, ID, goldToBuyOZ, goldToBuyUSD){
        var curGldBalance, curCashBalance
        getBalances(res, mysql, context, complete, ID, finish, goldToBuyOZ, goldToBuyUSD)

        function finish(ID, newGold, newCash){
            mysql.pool.query("UPDATE Accounts SET cashBalance = " + newCash + 
                ", goldBalance = " + newGold + " WHERE accountID = " + ID, 
                function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                complete()
            });
        }
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
        context.jsscripts = ["modifyInputs.js"];

        if(ID > 0 || ID < 20)
            displayBalances(res, mysql, context, complete, ID);
        else complete()

        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                context.layout = 'alt'
                res.render('clientPortal/buyGold', context)
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

        context.jsscripts = ["modifyInputs.js"];

        var goldOz = req.body.goldOz
        var goldUSD = req.body.goldUSD

        updateBalance(res, mysql, context, complete, ID, goldOz, goldUSD)
        if(ID > 0 || ID < 20)
            displayBalances(res, mysql, context, complete, ID);
        else complete()
            
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                context.layout = 'alt'
                res.redirect('../buyGold')
            }
        }
    });
    return router;
}();
