
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
            // var user_pw_map = {}
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
        getUsers_PW(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                context.layout = 'blank'
                res.render('loginPortal/clientLogin', context)
            }
        }
    });

/* Used for login purposes */

    router.post('/', function(req, res){
    	var userIn = req.body.username
    	var pwIn = req.body.password
        if(user_pw_map[userIn] == pwIn){
        	var loginID = user_ID_map[userIn]
        	res.redirect('../balance/' + loginID);
        } 
        else { 
        	console.log('Login or Username Invalid') 
            var delayInMilliseconds = 1000; //1 second

            setTimeout(function() {
                res.redirect('clientLogin');
            }, delayInMilliseconds); 

        	
        }
    });


    return router; 
}();
