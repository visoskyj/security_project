-- These are some Database Manipulation queries for a partially implemented Project Website 
-- using the bsg database.
-- Your submission should contain ALL the queries required to implement ALL the
-- functionalities listed in the Project Specs.



-- ACCOUNTS

-- get all Account IDs, Gold Balance, Cash Balance and Branch City from BANK BRANCH table and Accounts table 
SELECT accountID, goldBalance, cashBalance FROM Accounts
	INNER JOIN BankBranches ON Accounts.branchID = BankBranches.branchID;

-- add a new Bank Account
INSERT INTO BankAccounts (accountID, goldBalance, cashBalance, branchCity) VALUES (:AccountIDInput, :GoldBalanceInput, :CashBalanceInput, :BranchCityInput);



-- CLIENTS

-- get all Client IDs, first name, last name and coutry of residency from Account Holders table.
SELECT clientID, firstName, lastName, countryResidency FROM AccountHolders;

-- add a new client
INSERT INTO AccountHolders (clientID, firstName, lastName, countryResidency) VALUES (:ClientIDInput, :FirstNameInput, :LastNameInput, :CountryOfResidencyInput);



-- EMPLOYEES

-- get all Employee IDs, first name, last name and username from Account Manager table.
SELECT employeeID, firstName, lastName, username FROM AccountManagers;

-- add a new employee
INSERT INTO AccountManagers (employeeID, firstName, lastName, username) VALUES (:EmployeeIDInput, :FirstNameInput, :LastNameInput, :usernameInput);



-- USERS

-- delete an authorized user
DELETE FROM AccountManagers WHERE username = :username_selected_from_Account_Managers_table;

-- update the User information on Authorized User Page 
UPDATE AccountManagers SET firstName = :FirstNameInput, lastName= :LastNameInput, username = :usernameInput WHERE id= :accountID_from_the_Accounts_table;

UPDATE Accounts SET accountType = :AccountTypeInput WHERE id = :accountID_from_the_Accounts_table;



-- BANK BRANCHES

-- get all Branch IDs, Branch City, Branch Phone numbers from Bank Branch table
SELECT branchID, branchCity, branchPhone FROM BankBranches;

-- add a new Bank Branch
INSERT INTO BankBranches (branchID, branchCity, branchPhone) VALUES (:BranchIDInput, :BranchCityInput, :BranchPhoneNumberInput);
