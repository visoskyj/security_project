
module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getUsers_PW(res, mysql, context, complete){
        mysql.pool.query("SELECT username, password FROM AccountManagers", 
            function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            console.log(results)
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
        complete();
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                context.layout = 'blank'
                res.render('loginPortal/indexBootstrap', context)
            }
        }
    });

    /* Used for login purposes */

    router.post('/', function(req, res){
        var userIn = req.body.username
        var pwIn = req.body.password

        console.log(userIn, pwIn)

        if(userIn == 'admin12' && pwIn == '1234'){
            res.redirect('../accounts')
        } 
        else { 
            alert('Login or Username Invalid')
            res.redirect('adminLogin');
        }
    });

    return router;
}();
