function updatePerson(id){
    $.ajax({
        url: '/people/' + id,
        type: 'PUT',
        data: $('#update-person').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};
function logHello(){
    console.log('Hello')
};

function disableWeight(){
    console.log('in disableWeight()')
	document.getElementById("weightInput").disabled = true;
	document.getElementById("cashInput").disabled = false;
	document.getElementById("weightInput").value = ""
};

function disableCash(){
    console.log('in disableCash()')
	document.getElementById("cashInput").disabled = true;
	document.getElementById("weightInput").disabled = false;
	document.getElementById("cashInput").value = ""
}