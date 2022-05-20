

var userName = document.getElementById("userName");
var password = document.getElementById("password");
var password2 = document.getElementById("password2");

var db = openDatabase("pharmacy", "", "", 24 * 1024 * 1024);
// console.log(db);
db.transaction(createDB);

function checkUserName(){
    var userNameRegEx = /^[a-zA-Z0-9]+$/; // \D
    var result = userNameRegEx.test(userName.value);
    if(!result){
        alert("username must contain characters or numbers");
        userName.value ="";
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

function confirmPassword(){
    if (password.value != password2.value) {
      alert("kindly confirm your password correctly");
      password2.value = "";
      password.value = "";
    }
}

function signUp(){

    if (password.value != password2.value) {
        alert("kindly confirm your password correctly");
        password2.value = "";
        password.value = "";
    }else{
        db.transaction(insertUserToDb);    }
}

function insertUserToDb(tx){
    tx.executeSql(
        "insert into users (userName,password,type) values(?,?,?)",
        [userName.value,password.value,"user"],
        function(tx,success){
            alert("sign up successfully");
            document.location.assign("../HTML/log in.html");
        },
        function(tx,error){alert("this user name already taken");}
    );
}

// function assignCount(tx){
    
//     tx.executeSql(
//         "select count(*) from users",
//         null,
//         function (tx, success) {
//             console.log("select statment : " + success.rows.length);
//             count = (success.rows.length*1)+2;
//             },
//         function (tx, error) {
//             console.log("select error:" + error);
//         }
//     );
// }


function createDB(tx){
    // console.log(tx);
    tx.executeSql(
        "create table if not exists users (userName char (50) primary key, password char (50), type char(10) )",
        null,
        function(tx,success1){
            console.log("create table: "+success1);
            tx.executeSql(
                "insert into users (userName,password,type) values(?,?,?)",
                ["fady","0000","admin"],
                function(tx,success){console.log("insert row: "+success);},
                function(tx,error){console.log("insert error:" + error.message);}
            );
        },
        function(tx,error){
            console.log("create error:"+error.message);
        }
    );
}




















