-- DROP DATABASE IF EXISTS Group37_Project_Step4;

-- CREATE DATABASE Group37_Project_Step4;

-- USE Group37_Project_Step4;

-- Table structure for table `BANK BRANCH TABLE`


DROP TABLE IF EXISTS `BankBranches`;

CREATE TABLE `BankBranches` (
  `branchID` int(11) NOT NULL AUTO_INCREMENT,
  `branchCity` varchar(255) NOT NULL,
  `branchPhone` varchar(255) NOT NULL,
  PRIMARY KEY (`branchID`)
) ENGINE=InnoDB;


--
-- Dumping data for table `BankBranches`
--

LOCK TABLES `BankBranches` WRITE;

INSERT INTO `BankBranches` (branchCity, branchPhone) VALUES 
  ('San Jose', '479-833-7817'),
  ('New York', '808-1234-5656'),
  ('Paris', '612-891-2619'),
  ('Tokyo', '628-820-2019');

UNLOCK TABLES;

--
-- Table structure for table `Account Managers TABLE`
--

DROP TABLE IF EXISTS `AccountManagers`;

CREATE TABLE `AccountManagers` (
  `employeeID` int(11) NOT NULL AUTO_INCREMENT,
  `branchID` int(11) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  PRIMARY KEY (`employeeID`),
  CONSTRAINT `AccountManagers` FOREIGN KEY (`branchID`) REFERENCES `BankBranches` (`branchID`)
) ENGINE=InnoDB;

--
-- Dumping data for table `AccountManagers`
--

LOCK TABLES `AccountManagers` WRITE;

INSERT INTO `AccountManagers` (firstName, lastName, branchID) VALUES 
  ('Jim', 'Wilky', 1),
  ('Johnny', 'Quinn', 2),
  ('Bill', 'Jackson', 3),
  ('Margie', 'Freeman', 4);

UNLOCK TABLES;

--
-- Table structure for table `Accounts`
--

DROP TABLE IF EXISTS `Accounts`;

CREATE TABLE `Accounts` (
  `accountID` int(11) NOT NULL AUTO_INCREMENT,
  `employeeID` int(11),
  `branchID` int(11) NOT NULL,
  `accountType` varchar(255) NOT NULL,
  `goldBalance` float DEFAULT NULL,
  `cashBalance` float DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`accountID`),
  CONSTRAINT `Accounts1` FOREIGN KEY (`employeeID`) REFERENCES `AccountManagers` (`employeeID`),
  CONSTRAINT `Accounts2` FOREIGN KEY (`branchID`) REFERENCES `BankBranches` (`branchID`)
) ENGINE=InnoDB;

--
-- Dumping data for table `Accounts`
--

LOCK TABLES `Accounts` WRITE;

INSERT INTO `Accounts` 
  (employeeID, branchID, accountType, goldBalance, cashBalance, username, password) VALUES 
  (1, 1, 'Joint',   10.5, 20000, 'acct1', '1111'),
  (2, 2, 'Personal', 2.6, 10000, 'acct2', '2222'),
  (3, 3, 'Corporate', 49, 49000, 'acct3', '3333'),
  (4, 4, 'Personal', 1.1, 4000,  'acct4', '4444');

UNLOCK TABLES;

--
-- Table structure for table `Clients`
--

DROP TABLE IF EXISTS `Clients`;

CREATE TABLE `Clients` (
  `clientID` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `countryResidency` varchar(255) NOT NULL, 
  PRIMARY KEY (`clientID`)
  -- CONSTRAINT `Clients` FOREIGN KEY (`branchID`) REFERENCES `BankBranches` (`branchID`)
) ENGINE=InnoDB;

--
-- Dumping data for table `Clients`
--

LOCK TABLES `Clients` WRITE;

INSERT INTO `Clients` (firstName, lastName, countryResidency) VALUES 
  ('David', 'Lee', 'United States'),
  ('Stuart', 'Little', 'United States'),
  ('John', 'Snow', 'France'),
  ('Tom', 'Belknap', 'Japan');

UNLOCK TABLES;

--
-- Table structure for table `AccountUsers`
--

DROP TABLE IF EXISTS `AccountUsers`;

CREATE TABLE `AccountUsers` (
  `accountID` int(11) NOT NULL,
  `clientID` int(11) NOT NULL,
  PRIMARY KEY (`accountID`, `clientID`),
  CONSTRAINT `AccountUsers1` FOREIGN KEY (`accountID`) REFERENCES `Accounts` (`accountID`),
  CONSTRAINT `AccountUsers2` FOREIGN KEY (`clientID`) REFERENCES `Clients` (`clientID`)
) ENGINE=InnoDB;


--
-- Dumping data for table `AccountUsers`
--

LOCK TABLES `AccountUsers` WRITE;

INSERT INTO `AccountUsers` VALUES (1, 1), (2, 2), (3, 3), (4, 4);

UNLOCK TABLES;
