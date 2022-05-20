

var username = document.getElementById("userName");
var password = document.getElementById("password");
var flag1=0;
var flag2=0;

var db = openDatabase("pharmacy", "", "", 24 * 1024 * 1024);
db.transaction(createDB);

// console.log(db);

function checkUserName(){
    var userNameRegEx = /^[a-zA-Z0-9]+$/; // \D
    var result = userNameRegEx.test(username.value);
    if(!result){
        alert("username must contain characters or numbers");
        username.value ="";
    }
}

function checkPassword() {
    // var passwordRegEx = /^(?=.*\d)(?=.*[a-zA-Z]).{4}$/;
    var passwordRegEx = /^[0-9]{4}$/;
    var result = passwordRegEx.test(password.value);
    if (!result) {
    //   alert("password must contain upper letter characters, lower letter characters and numbers and must be 4 digits");
    alert("password must be 4 numbers ");  
    password.value = "";
    }
}

function logIn(){
db.transaction(checking);

}


function checking(tx) {
  tx.executeSql(
    "select userName from users where userName = ?",
    [username.value],
    function (tx, success) {
        console.log(success);
      if (success.rows.length > 0) {
        if (success.rows[0].userName == username.value) {
          flag1 = 1;
        }
      } else {
        alert("username is incorrect");
      }
    },
    function (tx, error) {
      console.log("error :"+ error.message);
      alert("cant find this username in database");
    }
  );

  tx.executeSql(
    "select password from users where userName = (?)",
    [username.value],
    function (tx, success) {
      console.log(success);
     if (success.rows.length > 0) {
       if (success.rows[0].password == password.value) {
        flag2 = 1;
        if (flag1 && flag2) {
           //    alert("flag1 and 2 changed");
           document.location.assign("../HTML/main.html");
        }
       } else {
         alert("password is incorrect");
       }
     }
    },
    function (tx, error) {
      console.log("error :" + error.message);
      alert("cant find this password in database");
    }
  );

}


function createDB(tx) {
  // console.log(tx);
  tx.executeSql(
    "create table if not exists users (userName char (50) primary key, password char (50), type char(10) )",
    null,
    function (tx, success1) {
      console.log("create table: " + success1);
      tx.executeSql(
        "insert into users (userName,password,type) values(?,?,?)",
        ["fady", "0000", "admin"],
        function (tx, success) {
          console.log("insert row: " + success);
        },
        function (tx, error) {
          console.log("insert error:" + error.message);
        }
      );
    },
    function (tx, error) {
      console.log("create error:" + error.message);
    }
  );
}