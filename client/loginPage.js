
module.exports = function(){
    var express = require('express');
    var router = express.Router();
    
    var user_pw_map = {}
    var user_ID_map = {}

    function getUsers_PW(res, mysql, context, complete){
        mysql.pool.query("SELECT username, password, accountID FROM Accounts", 
            function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            results.forEach(
                element => user_pw_map[element.username] = element.password
            )
            results.forEach(
                element => user_ID_map[element.username] = element.accountID
            )
            complete();
        });
    }

    /* Display all people. Requires web based javascript to delete users with AJAX */

    router.get('/', function(req, res){
        var context = {};
        var callbackCount = 0;
        var mysql = req.app.get('mysql');
        complete();
        req.session.userLogin = 0 // reset session

        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('loginPage', context)
            }
        }
    });

    /* Used for login purposes */

    router.post('/', function(req, res){
        var userIn = req.body.username
        var pwIn = req.body.password
        var portal = req.body.portal

        var context = {};
        var callbackCount = 0;

        var mysql = req.app.get('mysql');
        getUsers_PW(res, mysql, context, complete);

        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                if(userIn == 'admin12' && pwIn == '1234' && portal == 'admin'){
                    req.session.userLogin = 'admin12'
                    res.redirect('../accounts')
                } 
                else if(user_pw_map[userIn] == pwIn && portal == 'client'){
                    var loginID = user_ID_map[userIn]
                    req.session.userLogin = loginID
                    res.redirect('../balance');
                }
                else { 
                    console.log('Login or Username Invalid') 
                    var delayInMilliseconds = 1000; //1 second

                    setTimeout(function() {
                        res.redirect('loginPage');
                    }, delayInMilliseconds);             
                }
            }
        } 
    });
    return router;
}();
