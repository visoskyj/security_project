function filterEmployeesByBranch() {
  console.log("here in filter");
  //get the id of the selected homeworld from the filter dropdown
  var branchID = document.getElementById("branch_filter").value;
  //construct the URL and redirect to it
  window.location = "/employees/filter/" + parseInt(branchID);
}
