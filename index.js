/*  Aaron Lambou-Selgestad  */
/*  12/02/24  */
/*  index.js  */
/*  This is the primary .js for the Exam Registration system. This document should handle the GET and POST methods required for a user to navigate
    and operate the exam registration system. If the user is a student, they should be able to register a new account, login with valid credentials,
    schedule an exam with confirmation, query an exam history, and cancel any booked exams. If user is an instructor, they should be able to login,
    view their profile, and filter search through scheduled exams. */


/******************************************************** DEPENDENCIES **************************************************/
import express from "express";         // allows the use of express logic for server communication and dynamic .ejs files
import bodyParser from "body-parser";  // use body parser to collect data from the user input forms
import pg from "pg";                   // allows for connection for the postgreSQL database
import { dirname } from "path";        // this may not be needed...  allows for pathing to files if needed
import { fileURLToPath } from "url";   // this may not be needed...  allows for url pathing to files if needed

//import * as fs from 'fs';            // this may not be needed...  allows for js to read and write files.text
//const fs = require("fs");            // this may not be needed...  file stream read/write variavble

// dependency variables
const app = express();  // the app will be using express()
const port = 3000;      // the port where the website is hosting
const __dirname = dirname(fileURLToPath(import.meta.url)); // this may not be needed...  is a shorthand for the redirect pathing string
/*****************************************************END DEPENDENCIES **************************************************/

/************************************************ DATABASE CREDENTIALS **************************************************/
// databse object that holds key database information
// we us db for database commands
const db = new pg.Client({
  user: "postgres",         // default username for postgres
  host: "localhost",        // where the server will be hosted for postgres, currently is hosted on local machine
  database: "examReg",      // the name of database we will be using for the exam registration system
  password: "Puppies_123",  // nobody knows what this cryptic text could mean... (hint: its a password to log into the database)
  port: 5432,               // we are using port 5432 to listen for database commands
});

//let list = [];

db.connect();               // will enable the connection to the database

/*
db.query("SELECT * FROM systemUsers", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    list = res.rows;
  }
  //db.end();
});
*/
/********************************************** END DATABASE CREDENTIALS ***************************************************/

/****************************** MIDDLEWARE (FUINCTIONS) ******************************************/
app.use(bodyParser.urlencoded({ extended: true })); // allows data extraction from front end
app.use(express.static("public"));                  // allows for the use of a public folder

// this function is used on the registerNewStudent.ejs page
// this function will capture the data entered in the first name field and NSHE# field
/*
function captureRegisteringStudentData(req, res, next) {
  const registeringPassword = req.body["registeringPassword"];
  const registeringUserName = req.body["registeringUserName"];
  var enteredUserName = registeringUserName;
  var enteredPassword = registeringPassword;
  
  next();
}

app.use(captureRegisteringStudentData);
*/
/*************************** END MIDDLEWARE (FUINCTIONS) ******************************************/

/************************************** VARIABLES *********************************************/
// variables to help manage the student profile TOP button
var buttonMsgTOP = "Schedule Exam?";  // this is the text that will display on the TOP button, should only ever be schedule or delete exam
var examLabelTOP = "Exam A";       // this is the TOP label, it should either be exam A or the current scheduled exam for that slot
var topID = "";                    // this is the unique identifier that will alowe the exams to be 'cancelled' in the db
var topIsAlreadyScheduled = false; // this variable keeps track if there is already a scheduled exam for the TOP scheduled slot

// variables to help manage the student profile MIDDLE button
var buttonMsgMIDDLE = "Schedule Exam?";  // this is the text that will display on the MIDDLE button, should only ever be schedule or delete exam
var examLabelMIDDLE = "Exam B";       // this is the MIDDLE label, it should either be exam B or the current scheduled exam for that slot
var middleID = "";                    // this is the unique identifier that will alowe the exams to be 'cancelled' in the db
var middleIsAlreadyScheduled = false; // this variable keeps track if there is already a scheduled exam for the MIDDLE scheduled slot

// variables to help manage the student profile bottom button
var buttonMsgBOTTOM = "Schedule Exam?";  // this is the text that will display on the bottom button, should only ever be schedule or delete exam
var examLabelBOTTOM = "Exam C";       // this is the bottom label, it should either be exam C or the current scheduled exam for that slot
var bottomID = "";                    // this is the unique identifier that will alowe the exams to be 'cancelled' in the db
var bottomIsAlreadyScheduled = false; // this variable keeps track if there is already a scheduled exam for the bottom scheduled slot

// current logged in information of user
var currentLoggedInUser;           // this is the current logged in user
var currentLoggedInNSHE;           // this is the current logged in user's nshe number
var currentSelectedExamSlot = "";       // the current exam being scheduled top, middle, bottom... make it a string for easy visual comparison

// examConfirmation.ejs variables, these are the variables that are being confirmed during the current edit session
// var studentNameConfirmation = "";    // helps to display and query the student name on the confirmation page 
// var studentNumberConfirmation = "";  // helps to display and query the student number on the confirmation page
var examTypeConfirmation = "";          // helps to display and query the exam subject on the confirmation page
var examCampusConfirmation = "";        // helps to display and query the campus on the confirmation page
var dateConfirmation = "";              // helps to display and query the date on the confirmation page
var timeConfirmation = "";              // helps to display and query the time on the confirmation page

/***********************************END VARIABLES *********************************************/

/*********************************************************************************************************************************************/
/************************************************************** MAIN *************************************************************************/
/*********************************************************************************************************************************************/

/************************************************ * METHODS THAT EXIST ON THE LOGIN PAGE *************************************************/
// this method is the primary default method, it is what will allow the .....ejs home page to be rendered
// when user is on this page, they should have the option to login or register
// if a student logs in, it should navigate to their profile OR be able to register a new account with unique credentials
// if an instructor logs in, it should navigate to their profile
app.get("/", (req, res) => {
  res.render("loginPage.ejs", {
    loginErrorMessage: "",
  });
});
// from loginPage.ejs to registerNewStudent.ejs
// this method is how the user can navigate to the registration page. This is where students can register their accounts
app.get("/register", (req, res) => {
  res.render("registerNewStudent.ejs", {
    registrationMessage: "Please enter your first name, student email, and NSHE# to act as your password.",
  });
});

app.post("/login", async (req,res) => {
  
  const logPassword = req.body["logPassword"];        // the password (nshe) the user is attempting to log in with
  const logUserName = req.body["logUserName"];        // the username the user is attempting to log in with

  // console.log(logUserName + " " + logPassword);
  // this will set the entered username to lower case to prepare for query to see if the user exists in the database
  var sql = 'SELECT * FROM systemUsers WHERE username = ' + "'" + logUserName.toLowerCase() + "';";
    // we will begin the query
    await db.query(sql, function (err, result) {
      //console.log(result.rows);
      if (result.rows[0] == null) { // the user does not exist so re-render the login page with error message
        res.render("loginPage.ejs", {
          loginErrorMessage: "User does not exist.",
        });
      } else {  // the user exists but we must check the pass word
        if (result.rows[0].userpassword == logPassword) {  // we check the password because the password is the only value that must be unique
          if (result.rows[0].username === "karen.coombs") { // this is a default database value for the instructor, so we will redirect
            // redirects to the instructor profile
            res.render("instructorProfile.ejs", {
              
            });
          } else {
            // redirects to the student profile
            // we need to query the database to check if the user logging in has any previously scheduled exams
            // if they dont, log in as normal but if they do we must set the .ejs render variables for display
            // there is no order preservation, the top, middle, and bottom exam slots will display in order of query results
            var sql3 = 'SELECT * FROM registeredExams WHERE studentnshe = ' + "'" + logPassword + "' AND status = " + true + ";";
            //console.log(sql3);
            db.query(sql3, function (err, result) {
              //console.log(err);
              //console.log(result.rows);
              //console.log("149" + result.rows[0]);
              //console.log("150" + result.rows[2]);
              //console.log("151" + result.rows[3]);

              // this is a series of if - else blocks that will check for up to 3 slots of scheduled exams (max is 3)
              // there proberbly is a more efficient way to code this because if rows[0] is null then we know for a fact rows[1] and [2]
              // must also be null. However, I will keep these if-else blocks seperate for code clarity
              if (result.rows[0] == null) {
                topID = "";                     // there is nothing scheduled so we do not need to remember what id is stored there
                topIsAlreadyScheduled = false; // the top exam is not scheduled, so set to false
                buttonMsgTOP = "Schedule Exam";
                examLabelTOP = "Exam A";
              } else {
                topID = result.rows[0].id;      // this is the id of the top slot, it must be remembered for potential exam deletion
                topIsAlreadyScheduled = true;  // since this exam is already scheduled, we must remember this for the top
                buttonMsgTOP = "Delete Exam?";     // inform the user that the exam can be deleted
                examLabelTOP = result.rows[0].examtype + " scheduled for " + result.rows[0].examtime + " on " + result.rows[0].examdate.toISOString().slice(0, 10).replace('T', ' ') + " at " + result.rows[0].campus;
              }
              // middle exam slot
              if (result.rows[1] == null) {
                middleID = "";                     // there is nothing scheduled so we do not need to remember what id is stored there
                middleIsAlreadyScheduled = false; // the top exam is not scheduled, so set to false
                buttonMsgMIDDLE = "Schedule Exam";
                examLabelMIDDLE = "Exam B";
              } else {
                middleID = result.rows[1].id;      // this is the id of the top slot, it must be remembered for potential exam deletion
                middleIsAlreadyScheduled = true;  // since this exam is already scheduled, we must remember this for the top
                buttonMsgMIDDLE = "Delete Exam?";     // inform the user that the exam can be deleted
                examLabelMIDDLE = result.rows[1].examtype + " scheduled for " + result.rows[1].examtime + " on " + result.rows[1].examdate.toISOString().slice(0, 10).replace('T', ' ') + " at " + result.rows[1].campus;
              }
              // bottom exam slot
              if (result.rows[2] == null) {
                bottomID = "";                     // there is nothing scheduled so we do not need to remember what id is stored there
                bottomIsAlreadyScheduled = false; // the top exam is not scheduled, so set to false
                buttonMsgBOTTOM= "Schedule Exam";
                examLabelBOTTOM = "Exam C";
              } else {
                bottomID = result.rows[2].id;      // this is the id of the top slot, it must be remembered for potential exam deletion
                bottomIsAlreadyScheduled = true;  // since this exam is already scheduled, we must remember this for the top
                buttonMsgBOTTOM = "Delete Exam?";     // inform the user that the exam can be deleted
                examLabelBOTTOM = result.rows[2].examtype + " scheduled for " + result.rows[2].examtime + " on " + result.rows[2].examdate.toISOString().slice(0, 10).replace('T', ' ') + " at " + result.rows[2 ].campus;
              }

              // we must set the current logged in user
              currentLoggedInUser = logUserName;
              currentLoggedInNSHE = logPassword;


              res.render("studentProfile.ejs", {
                studentUserName: currentLoggedInUser, //.slice(0, -4),  will display the users name, slice if we just want name
                studentNumber: currentLoggedInNSHE,   // will display their student number
                buttonMsgTOP: buttonMsgTOP,    // since the user already has an existing exam, the button must display the option to delete
                examLabelTOP: examLabelTOP,     // displays the label above the top button, will display exam A or the exam itself
                buttonMsgMIDDLE: buttonMsgMIDDLE,    // since the user already has an existing exam, the button must display the option to delete
                examLabelMIDDLE: examLabelMIDDLE,     // displays the label above the top button, will display exam A or the exam itself
                buttonMsgBOTTOM: buttonMsgBOTTOM,    // since the user already has an existing exam, the button must display the option to delete
                examLabelBOTTOM: examLabelBOTTOM     // displays the label above the top button, will display exam A or the exam itself
              });
            });
          }
        } else {
          // the user is invalid or passwords do not match, reject them back to login with error message
          res.render("loginPage.ejs", {
            loginErrorMessage: "Invalid username or password.",
          });
        }
      }
    });
})
/************************************** * END METHODS THAT EXIST ON THE LOGIN PAGE loginPage.ejs *********************************/

/************************************** METHODS THAT EXIST ON THE REGISTER NEW STUDENT PAGE registerNeStudent.ejs ******************/
// from registerNewStudent.ejs to loginPage.ejs
// this method is so that the user can cancel their registration and return back to the login page
app.get("/returnToLogin", (req, res) => {
  res.render("loginPage.ejs", {
    loginErrorMessage: "",
  });
});

// this occurs on registerNewStudent.ejs
// this should capture the first name and nshe number during the registration process
app.post("/check", async (req, res) => {
  const registeringPassword = req.body["registeringPassword"];  // the password (nshe) the user is attempting to register with
  var registeringEmail = req.body["registeringEmail"];         // the email that the user will be attempting to register with
  var registeringUserName = req.body["registeringUserName"];    // the user FIRST NAME the user will be attempting to register with
  registeringUserName = registeringUserName.toLowerCase();      // all names should be stored as lower case for comparison
  //console.log("We capture: " + registeringUserName + " and " + registeringPassword + " and " + registeringEmail.slice(0,10));

  /* USED LOGIC FOR THIS METHOD
  /********************************************************************************************************** */
  /* logic to check that the password only contains digits*/
  var isGood = true;  // everything is okay by default
  // parse through the entire string
  for (var i = 0; i < registeringPassword.length; ++i) {
      var ch = registeringPassword.charCodeAt(i);  // converts the current char at index i to it's ASCII value
      // if the ASCII value is less than 48 or greater than 57, we have a num alphabeta character
      if (ch < 48 || ch > 57) {
          isGood = false;  // bad user, set to false
      }
  }
  /****************************************************************************************************/

  // if the password is less than 10 digits, we must reject the input
  if (registeringPassword.length < 10) {
    res.render("registerNewStudent.ejs", {
      registrationMessage: "NSHE# must be at least 10 digits.",
    });
  // if the password contains a character we must reject the input
  } else if (!isGood) {
    res.render("registerNewStudent.ejs", {
      registrationMessage: "NSHE# is invalid.",
    });
  } else if ((registeringPassword != registeringEmail.slice(0,10))) {
    res.render("registerNewStudent.ejs", {
      registrationMessage: "NSHE# does not match student email.",
    });
  } else if (registeringEmail.length < 26) {
    res.render("registerNewStudent.ejs", {
      registrationMessage: "Student Email is invalid.",
    });
  } else {
    // logic to check if the username already exists
    // query for password because password = NSHE and NSHE must be unique
    var sql = 'SELECT * FROM systemUsers WHERE userpassword = ' + "'" + registeringPassword + "';";
    //console.log(sql);
    //console.log(registeringPassword);

    // QUERY THE DATABASE FOR EXISTING USER
    // if the user does not exist already we will add them, otherwise the user already exists and we throw an error message
    await db.query(sql, function (err, result) {
      if ((err == null)) {
        //console.log(result.rows);
        if (result.rows[0] == null) {
          // ADD NEW USER
          registeringUserName = registeringUserName + registeringPassword.slice(6,10);

          db.query("INSERT INTO systemUsers (username, userpassword) VALUES ($1, $2)", [
            registeringUserName, registeringPassword
          ]);
          res.render("registerNewStudent.ejs", {
            registrationMessage: "Registration Successful! Welcome " + registeringUserName + "! Return to Login to continue.",
          });
        } else {
          // THIS USER ALREADY EXISTS
          res.render("registerNewStudent.ejs", {
            registrationMessage: "User already exists.",
          });
        }
      } 
    });
  }
});
/********************************** END METHODS THAT EXIST ON THE REGISTER NEW STUDENT PAGE registerNeStudent.ejs *************************/

/****************************** METHODS THAT EXIST ON THE STUDENT PROFILE PAGE studentProfile.ejs *************************************************/
// this should occur on studentProfile.ejs
// this should log out the user and send them back to the login page (loginPage.ejs)
app.get("/logout", (req, res) => {
  //console.log("the outside id is: " + topID);
  res.render("loginPage.ejs", {
    loginErrorMessage: "",
  });
});

// top button attempting to schedule
app.get("/scheduleTOP", (req, res) => {
  // we HAVE to check if there is already a scheduled exam before proceeding
  if (topIsAlreadyScheduled) {  // if the exam is already scheduled then it should ask the user to delete the exam on hover
    topIsAlreadyScheduled = false;
    examLabelTOP = "Exam A";
    buttonMsgTOP = "Schedule Exam?";
    /*
    db.query("INSERT INTO systemUsers (username, userpassword) VALUES ($1, $2)", [
      registeringUserName, registeringPassword
    ]);
    */

    // testing to cancel exam
    db.query("UPDATE registeredExams SET status=$1 WHERE id = $2", [
      false, topID
    ]);
    // render the student profile with all teh relevent information
    res.render("studentProfile.ejs", {
      studentUserName: currentLoggedInUser, //.slice(0, -4),  will display the users name, slice if we just want name
      studentNumber: currentLoggedInNSHE,   // will display their student number
      buttonMsgTOP: buttonMsgTOP,    // since the user already has an existing exam, the button must display the option to delete
      examLabelTOP: examLabelTOP,     // displays the label above the top button, will display exam A or the exam itself
      buttonMsgMIDDLE: buttonMsgMIDDLE,    // since the user already has an existing exam, the button must display the option to delete
      examLabelMIDDLE: examLabelMIDDLE,     // displays the label above the top button, will display exam A or the exam itself
      buttonMsgBOTTOM: buttonMsgBOTTOM,    // since the user already has an existing exam, the button must display the option to delete
      examLabelBOTTOM: examLabelBOTTOM     // displays the label above the top button, will display exam A or the exam itself
    });
  } else {
    //console.log(topIsAlreadyScheduled);
    currentSelectedExamSlot = "top";
    res.render("scheduleNewExam.ejs", {
      scheduleExamErrorMessage: "",
    });
  }
});

// middle button attempting to schedule
app.get("/scheduleMIDDLE", (req, res) => {
  // we HAVE to check if there is already a scheduled exam before proceeding
  if (middleIsAlreadyScheduled) {  // if the exam is already scheduled then it should ask the user to delete the exam on hover
    middleIsAlreadyScheduled = false;
    examLabelMIDDLE = "Exam B";
    buttonMsgMIDDLE = "Schedule Exam?";
    /*
    db.query("INSERT INTO systemUsers (username, userpassword) VALUES ($1, $2)", [
      registeringUserName, registeringPassword
    ]);
    */

    // testing to cancel exam
    db.query("UPDATE registeredExams SET status=$1 WHERE id = $2", [
      false, middleID
    ]);
    // render the student profile with all teh relevent information
    res.render("studentProfile.ejs", {
      studentUserName: currentLoggedInUser, //.slice(0, -4),  will display the users name, slice if we just want name
      studentNumber: currentLoggedInNSHE,   // will display their student number
      buttonMsgTOP: buttonMsgTOP,    // since the user already has an existing exam, the button must display the option to delete
      examLabelTOP: examLabelTOP,     // displays the label above the top button, will display exam A or the exam itself
      buttonMsgMIDDLE: buttonMsgMIDDLE,    // since the user already has an existing exam, the button must display the option to delete
      examLabelMIDDLE: examLabelMIDDLE,     // displays the label above the top button, will display exam A or the exam itself
      buttonMsgBOTTOM: buttonMsgBOTTOM,    // since the user already has an existing exam, the button must display the option to delete
      examLabelBOTTOM: examLabelBOTTOM     // displays the label above the top button, will display exam A or the exam itself
    });
  } else {
    
    currentSelectedExamSlot = "middle";
    res.render("scheduleNewExam.ejs", {
      scheduleExamErrorMessage: "",
    });
  }
});

// bottom button attempting to schedule
app.get("/scheduleBOTTOM", (req, res) => {
  // we HAVE to check if there is already a scheduled exam before proceeding
  if (bottomIsAlreadyScheduled) {  // if the exam is already scheduled then it should ask the user to delete the exam on hover
    bottomIsAlreadyScheduled = false;
    examLabelBOTTOM = "Exam A";
    buttonMsgBOTTOM = "Schedule Exam?";
    /*
    db.query("INSERT INTO systemUsers (username, userpassword) VALUES ($1, $2)", [
      registeringUserName, registeringPassword
    ]);
    */

    // testing to cancel exam
    db.query("UPDATE registeredExams SET status=$1 WHERE id = $2", [
      false, bottomID
    ]);
    // render the student profile with all teh relevent information
    res.render("studentProfile.ejs", {
      studentUserName: currentLoggedInUser, //.slice(0, -4),  will display the users name, slice if we just want name
      studentNumber: currentLoggedInNSHE,   // will display their student number
      buttonMsgTOP: buttonMsgTOP,    // since the user already has an existing exam, the button must display the option to delete
      examLabelTOP: examLabelTOP,     // displays the label above the top button, will display exam A or the exam itself
      buttonMsgMIDDLE: buttonMsgMIDDLE,    // since the user already has an existing exam, the button must display the option to delete
      examLabelMIDDLE: examLabelMIDDLE,     // displays the label above the top button, will display exam A or the exam itself
      buttonMsgBOTTOM: buttonMsgBOTTOM,    // since the user already has an existing exam, the button must display the option to delete
      examLabelBOTTOM: examLabelBOTTOM     // displays the label above the top button, will display exam A or the exam itself
    });
  } else {
    //console.log(topIsAlreadyScheduled);
    currentSelectedExamSlot = "bottom";
    res.render("scheduleNewExam.ejs", {
      scheduleExamErrorMessage: "",
    });
  }
});

// this should redirect to the studentHistory.ejs
// all values should be found before redirect
app.get("/viewStudentHistory", (req, res) => {
  //var noScheduledExamsMessage = "";
  let studentScheduledExams = [];
  let studentExamHistory = [];
  var sql6 = 'SELECT * FROM registeredExams WHERE studentnshe =' + "'" + currentLoggedInNSHE + "' AND status =" + true + ";";
  //console.log(sql2);
  db.query(sql6, function (err, result) {
    //console.log(result.rows);
    if (result.rows[0] == null) {
      var noScheduledExamsMessage = "You have no upcoming exams.";
      var sql7 = 'SELECT * FROM registeredExams WHERE studentnshe =' + "'" + currentLoggedInNSHE + "' AND status =" + false + ";";
      db.query(sql7, function (err, results) {
        if (results.rows[0] == null) {
          var noPastExamsMessage = "You have no exam history.";
        } else {
          studentExamHistory = results.rows;
        }
        res.render("studentHistory.ejs", {
          noScheduledExamsMessage: noScheduledExamsMessage,
          noPastExamsMessage: noPastExamsMessage,
          studentScheduledExams: studentScheduledExams,
          studentExamHistory, studentExamHistory
        });
      });
    } else {
      studentScheduledExams = result.rows;
      var sql7 = 'SELECT * FROM registeredExams WHERE studentnshe =' + "'" + currentLoggedInNSHE + "' AND status =" + false + ";";
      db.query(sql7, function (err, results) {
        if (results.rows[0] == null) {
          var noPastExamsMessage = "You have no exam history.";
        } else {
          studentExamHistory = results.rows;
        }
        res.render("studentHistory.ejs", {
          noScheduledExamsMessage: noScheduledExamsMessage,
          noPastExamsMessage: noPastExamsMessage,
          studentScheduledExams: studentScheduledExams,
          studentExamHistory, studentExamHistory
        });
      });
    }
  });
});
/**************************END METHODS THAT EXIST ON THE STUDENT PROFILE PAGE studentProfile.ejs *****************************************/

/*********************************** METHODS THAT EXIST ON THE SCHEDULE NEW EXAM PAGE scheduleNewExam.ejs ***************************/
// this is simply canceling the schedule exam processm we simple just need to render all teh current variables
app.get("/returnToProfile", (req, res) => {
  currentSelectedExamSlot = "";  // reset on cancel
  res.render("studentProfile.ejs", {
    studentUserName: currentLoggedInUser, //.slice(0, -4),  will display the users name, slice if we just want name
    studentNumber: currentLoggedInNSHE,   // will display their student number
    buttonMsgTOP: buttonMsgTOP,    // since the user already has an existing exam, the button must display the option to delete
    examLabelTOP: examLabelTOP,     // displays the label above the top button, will display exam A or the exam itself
    buttonMsgMIDDLE: buttonMsgMIDDLE,    // since the user already has an existing exam, the button must display the option to delete
    examLabelMIDDLE: examLabelMIDDLE,     // displays the label above the top button, will display exam A or the exam itself
    buttonMsgBOTTOM: buttonMsgBOTTOM,    // since the user already has an existing exam, the button must display the option to delete
    examLabelBOTTOM: examLabelBOTTOM     // displays the label above the top button, will display exam A or the exam itself
  });
});

// this is an attempt to confirm, it should not have any logic other than confirming all values have been selected for each field
// it should redirect to the examConfirmation.ejs
app.post("/confirmRoute", (req,res) => {
  var selectedCampus = req.body["campus"];    // grabs the selected campus from the campus radios
  var selectedSubject = req.body["sub"];      // grabs the selected subject from the subject radios
  var selectedDate = req.body["datePicker"];  // grabs the selected date from the datePicker
  var selectedTime = req.body["time"];
  //console.log(selectedCampus + " " + selectedSubject + " " + selectedDate + " " + selectedTime);
  // we check if the time is selected, all other fields are required by the .ejs, the time picker is the only exception with 0 = not selected
  if (selectedTime === '0') {
    //console.log(topIsAlreadyScheduled);
      res.render("scheduleNewExam.ejs", {
        scheduleExamErrorMessage: "Please finish filling out the form to completion.",
      });
  } else {
    if (selectedTime >= 9 && selectedTime < 12) {
      selectedTime = selectedTime + ":00 am";
    } else {
      selectedTime = selectedTime + ":00 pm";
    }
    examTypeConfirmation = selectedSubject; // the selected exam will now be held for confirmation
    //console.log("The selected Time is: " + selectedTime);
    timeConfirmation = selectedTime;        // the selected time will now be held for confirmation
    //console.log("The confirmedTime is: " + selectedTime);
    dateConfirmation = selectedDate;        // the selected date will now be held for confirmation
    examCampusConfirmation = selectedCampus;// the selected campus will now be held for confirmation
    // we head to the confirmation page and render all the information that is currently selected
  // we need to make sure there are not 20 of the same exact type of exams currently being scheduled
  // if there are less than 20, go ahead and schedule the exam, otherwise we are at 20 and we must kick the user back and inform them
    var sql5 = 'SELECT * FROM registeredexams WHERE examtype =' + "'" + examTypeConfirmation + "' AND status =" + true + " AND examdate ='" + dateConfirmation + "' AND examtime='" + timeConfirmation + "';" ;
    console.log(sql5);
    db.query(sql5, function (err, result) {
      console.log(err);
      console.log(result.rows.length);
      // less than 20 proceed
      if (result.rows.length < 20) {
        var remainingSeats = 20 - result.rows.length;
      // we need to query the database to make sure that the current user has NOT already scheduled the same exam
      // the criteria is only that the current exam type can not be duplicate for the same student and status 'true'
      // date criteria is not required by the assignment specifics so I will not be implementing logic to account for it - Aaron
        var sql4 = 'SELECT * FROM registeredexams WHERE examtype =' + "'" + examTypeConfirmation + "' AND status =" + true + " AND studentnshe ='" + currentLoggedInNSHE + "';";
        console.log(sql4);
        db.query(sql4, function (err, result) {
          // if the result is null then that means it does NOT exist in the database yet and we can safely add it
          // otherwise, this exam can not be duplicated and we must kick the user back the selection process
          if (result.rows[0] == null) {
            console.log("we are in default...")
            // converts the selected time into a presentable string for the user
            res.render("examConfirmation.ejs", {
              studentNameConfirmation: currentLoggedInUser,
              studentNumberConfirmation: currentLoggedInNSHE,
              examTypeConfirmation: selectedSubject,
              examCampusConfirmation: selectedCampus,
              dateTimeConfirmation: selectedTime + " on " + selectedDate,
              remainingSeats: remainingSeats
            }); 
          } else {
            // this exam already exists in the database and the student can NOT schedule it
            res.render("scheduleNewExam.ejs", {
              scheduleExamErrorMessage: "You already have an exam scheduled for " + examTypeConfirmation +".",
            });
          }
        });
      } else {  // we are greater than 20 and must kick the user back
        res.render("scheduleNewExam.ejs", {
        scheduleExamErrorMessage: examTypeConfirmation +"is already full for the selected date and time."
        });
      }
    });
  }
});
/********************************END METHODS THAT EXIST ON THE SCHEDULE NEW EXAM PAGE scheduleNewExam.ejs ***************************/

/*********************************** METHODS THAT EXIST ON THE CONFIRM EXAM PAGE examConfirmation.ejs ***************************/
// this method should redirect back to the student profile
// it also MUST contain the logic to query the database and INSERT the current exam attempting to be scheduled
app.get("/confirmTheExam", (req,res) => {
  var dateTimeConfirmation = timeConfirmation + " on " + dateConfirmation;
  
    // if the exam currently being scheduled is at the top slot, we will remember that this slot is what will be changed
    if (currentSelectedExamSlot === "top") {
      console.log("we made it to the top");
      topIsAlreadyScheduled = true;  // the exam has now been scheduled
      examLabelTOP = examTypeConfirmation + " scheduled for " + dateTimeConfirmation + " at " + examCampusConfirmation;  // create the display string
      buttonMsgTOP = "Delete Exam?";  //
    } else if (currentSelectedExamSlot === "middle") {  // same but for middle
      console.log("we made it to the middle");
      middleIsAlreadyScheduled = true;
      examLabelMIDDLE = examTypeConfirmation + " scheduled for " + dateTimeConfirmation + " at " + examCampusConfirmation;
      buttonMsgMIDDLE = "Delete Exam?";
    } else if (currentSelectedExamSlot === "bottom") {  // same but for bottom
      bottomIsAlreadyScheduled = true;
      examLabelBOTTOM = examTypeConfirmation + " scheduled for " + dateTimeConfirmation + " at " + examCampusConfirmation;
      buttonMsgBOTTOM = "Delete Exam?";
    } else {
      // this is an edge case where currentSelectedExamSlot === ""; this should not occur but if it does we should kick user back to login
    }
    // EVERYTHING SHOULD BE VALID AND BEGIN THE INSERT TO DB
    db.query("INSERT INTO registeredExams (studentNSHE, campus, examtype, examdate, examtime, status) VALUES ($1, $2, $3, $4, $5, $6)", [
      currentLoggedInNSHE, examCampusConfirmation, examTypeConfirmation, dateConfirmation, timeConfirmation, true
    ]);

    //console.log(currentLoggedInNSHE + " " + examCampusConfirmation + " " + examTypeConfirmation + " " + dateConfirmation + " " + timeConfirmation);

    // query the database and insert everything into the registeredexams table
    var sql2 = 'SELECT * FROM registeredExams WHERE examtype =' + "'" + examTypeConfirmation + "' AND status =" + true + ";";
    //console.log(sql2);
    db.query(sql2, function (err, result) {
      if (currentSelectedExamSlot === "top") {
        topID = result.rows[0].id;
      } else if (currentSelectedExamSlot === "middle") {
        middleID = result.rows[0].id;
      } else if (currentSelectedExamSlot === "bottom") {
        bottomID = result.rows[0].id;
      } else {
        // this is an edge case where currentSelectedExamSlot === ""; this should not occur but if it does we should kick user back to login
      }
    });

    // redirect back the studentProfile, we have a lot to render
    res.render("studentProfile.ejs", {
      studentUserName: currentLoggedInUser, //.slice(0, -4),  will display the users name, slice if we just want name
      studentNumber: currentLoggedInNSHE,   // will display their student number
      buttonMsgTOP: buttonMsgTOP,    // since the user already has an existing exam, the button must display the option to delete
      examLabelTOP: examLabelTOP,     // displays the label above the top button, will display exam A or the exam itself
      buttonMsgMIDDLE: buttonMsgMIDDLE,    // since the user already has an existing exam, the button must display the option to delete
      examLabelMIDDLE: examLabelMIDDLE,     // displays the label above the top button, will display exam A or the exam itself
      buttonMsgBOTTOM: buttonMsgBOTTOM,    // since the user already has an existing exam, the button must display the option to delete
      examLabelBOTTOM: examLabelBOTTOM     // displays the label above the top button, will display exam A or the exam itself
    });
});
// this returns to the scheduleNewExam.ejs page so the user can edit any values they may wish
app.get("/return", (req,res) => {
    res.render("scheduleNewExam.ejs", {
      scheduleExamErrorMessage: "",
  });
});

/********************************END METHODS THAT EXIST ON THE CONFIRM EXAM PAGE examConfirmation.ejs ***************************/

/*********************************** METHODS THAT EXIST ON THE STUDENT HISTORY PAGE studentHistory.ejs ***************************/
// this should return back to their profile
app.get("/exitStudentHistory", (req,res) => {
  res.render("studentProfile.ejs", {
    studentUserName: currentLoggedInUser,     //.slice(0, -4),  will display the users name, slice if we just want name
      studentNumber: currentLoggedInNSHE,   // will display their student number
      buttonMsgTOP: buttonMsgTOP,            // since the user already has an existing exam, the button must display the option to delete
      examLabelTOP: examLabelTOP,           // displays the label above the top button, will display exam A or the exam itself
      buttonMsgMIDDLE: buttonMsgMIDDLE,     // since the user already has an existing exam, the button must display the option to delete
      examLabelMIDDLE: examLabelMIDDLE,     // displays the label above the top button, will display exam A or the exam itself
      buttonMsgBOTTOM: buttonMsgBOTTOM,     // since the user already has an existing exam, the button must display the option to delete
      examLabelBOTTOM: examLabelBOTTOM      // displays the label above the top button, will display exam A or the exam itself
  });
});

/********************************END METHODS THAT EXIST ON THE STUDENT HISTORY PAGE studentHistory.ejs ***************************/

/*********************************** METHODS THAT EXIST ON THE INSTRUCTOR PAGE instructorProfile.ejs ***************************/
// redirects to the login page from the instructor page
app.get("/logout2", (req, res) => {
  //console.log("the outside id is: " + topID);
  res.render("loginPage.ejs", {
    loginErrorMessage: "",
  });
});

// navigates to the viewReport page
app.get("/viewReport", (req, res) => {
  //console.log("the outside id is: " + topID);
  res.render("viewReport.ejs", {
    report: "",
    reportMessage: ""
  });
});

/********************************END METHODS THAT EXIST ON THE INSTRUCTOR PAGE instructorProfile.ejs ***************************/

/******************************** METHODS THAT EXIST ON THE VIEW REPORT PAGE viewReport.ejs ***************************/
app.get("/returnToInstructorProfile", (req, res) => {
  res.render("instructorProfile.ejs", {});
});

app.post("/campusReport", (req, res) => {
  var reportMessage = "No Results";
  var reportCampus = req.body["campusReport"];    // grabs the selected campus from the campus radios
  var reportSubject = req.body["subReport"];      // grabs the selected subject from the subject radios
  var reportDate = req.body["datePickerReport"];  // grabs the selected date from the datePicker

  var sqlCombo = 'SELECT * FROM registeredExams WHERE status = true';
  // attach the campus to the sql string
  if (reportCampus != null) {
    sqlCombo = sqlCombo + " AND campus = '" + reportCampus + "'";
  }

  // attach the subject to the sql string
  if (reportSubject != null) {
    sqlCombo = sqlCombo + " AND examType = '" + reportSubject + "'";
  }

  // attach the date to the sql string
  if (reportDate.length > 1) {
    //reportDate = new Date(reportDate);
    sqlCombo = sqlCombo + " AND examDate = " + "'" + reportDate + "'";
  }
  // close the sql string
  sqlCombo = sqlCombo + ';'; // close the string
  console.log(sqlCombo);
  // QUERY THE DATABASE FOR THE DESIRED RESULTS SET BY THE INSTRUCTOR'S VIEW REPORT FILTERS
  db.query(sqlCombo, function (err, result) {
    console.log(err);
    console.log(result.rows);
    res.render("viewReport.ejs", {
      report: result.rows,
      reportMessage: reportMessage,
    });
  });
});
/*****************************END METHODS THAT EXIST ON THE VIEW REPORT PAGE viewReport.ejs ***************************/

/****************************** PORT LISTENER (STAYS AT BOTTOM) *******************************/
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
