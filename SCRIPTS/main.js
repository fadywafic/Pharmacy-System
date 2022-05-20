
var Item = document.getElementById("item");
var Price = document.getElementById("price");
var Qty = document.getElementById("qty");
var vid = document.getElementById("vid");
var canvas = document.getElementById("canvas");
var Img = document.getElementById("img");
var ImgContainer = document.getElementsByClassName("imgContainer")[0];
var table = document.getElementById("itemsTable");
var remove = document.getElementsByClassName("deleteAndSearch")[0];
var search = document.getElementsByClassName("deleteAndSearch")[1];
var searchDiv = document.getElementsByClassName("search")[0];
// var count=1;

/***************************** camera btns  *******************************************/
async function startCamera(){
    if(navigator.mediaDevices.getUserMedia){
        var stream = await navigator.mediaDevices.getDisplayMedia();
        vid.srcObject = stream;
    }
    ImgContainer.style.display = "block";
    ImgContainer.style.backgroundColor = "darkgray";
    document.getElementsByClassName("imgbtns")[0].style.display ="none";
    document.getElementsByClassName("imgbtns")[1].style.display = "none";
}

function takeScreenShot() {
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    var confirming = confirm("save this photo to database");
    if(confirming){
        var ctx = canvas.getContext("2d");
        ctx.drawImage(vid, 0, 0);
        var imgSrc = canvas.toDataURL("image/webp");
        Img.src = imgSrc;  
    }
}

function stopCamera() {
    var stream = vid.srcObject;
    var tracks = stream.getTracks();
    for(var i=0; i< tracks.length; i++){
        tracks[i].stop();
    }
    vid.srcObject =null;
    ImgContainer.style.display = "none";
    ImgContainer.style.backgroundColor = "white";
document.getElementsByClassName("imgbtns")[0].style.display = "inline-block";
document.getElementsByClassName("imgbtns")[1].style.display = "inline-block";
}

/***************************** img btns  *******************************************/

function deleteImage() {
  Img.src = "";
}

function changeImage() {
  deleteImage();
  document.getElementsByClassName("cameraContainer")[0].style.display = "block";
  startCamera();
}

/***************************** db functionality btns  *******************************************/

//create db and insert record for testing
var db = openDatabase("pharmacy","","", 4*1024*1024);
db.transaction(function (tx) {
  tx.executeSql(
    "create table if not exists items (item char(100) primary key, price int, qty int, img varchar)",
    null,
    function (tx, success) {
      console.log("db created successfully");
      // tx.executeSql(
      //   "insert into items (item, price, qty, img) values (?,?,?,?)",
      //   ["panadol extra", 150, 4, "../images/download.jpg"],
      //   function () {
      //     console.log("insert successfully in table items");
      //   },
      //   function (error) {
      //     console.log("error of insertion is " + error.message);
      //   }
      // );

      // tx.executeSql(
      //   "insert into items (item, price, qty, img) values (?,?,?,?)",
      //   ["panadol ", 10, 40, "../images/download.jpg"],
      //   function () {
      //     console.log("insert successfully in table items");
      //   },
      //   function (error) {
      //     console.log("error of insertion is " + error.message);
      //   }
      // );

      // tx.executeSql(
      //   "insert into items (item, price, qty, img) values (?,?,?,?)",
      //   ["rivo", 5, 10, "../images/download.jpg"],
      //   function () {
      //     console.log("insert successfully in table items");
      //   },
      //   function (error) {
      //     console.log("error of insertion is " + error.message);
      //   }
      // );
    },
    function (tx, error) {
      console.log("create db error: " + error.message);
    }
  );
});

// show db data on screen (accompained with all methods in order to show updated data usually)
function showDatabase(){
    db.transaction(
        function(tx){
            tx.executeSql(
              "select * from items",
              null,
              function (tx, success) {
                // console.log(success);
                table.innerHTML = `
                <thead>
                        <tr>
                            <td>Id</td>
                            <td>Item</td>
                            <td>Price</td>
                            <td>Qty</td>
                            <td>Picture</td>
                            <td>Actions</td>
                        </tr>
                </thead>`;
                for (var i = 0; i < success.rows.length; i++) {
                //   console.log(success.rows);
                  table.innerHTML += `
                  <tr>
                    <td> ${i+1} </td>
                    <td>  ${success.rows[i].item} </td>
                    <td>  ${success.rows[i].price} </td>
                    <td>  ${success.rows[i].qty} </td>
                    <td>  <img src="${success.rows[i].img}" width="150px" height="150px"/> </td>
                    <td> 
                        <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                    </td>
                 </tr>`;
                }
              },
              function (tx, error) {
                console.log("add error: " + error.message);
              }
            );
        }
    );
    
}

showDatabase();

// insert record
function add(){
    if(Price.value =="" || Item.value =="" || Qty.value ==""){
        alert("make sure you entered item name, price and qty");
    }else{
        db.transaction(adding);
        showDatabase();
    }
}

// edit record
function edit(j){
    db.transaction(function(tx){
        tx.executeSql(
        "select * from items",
        null,
        function(tx,success){
            // console.log( success.rows[j]);
            item1 = Item.value = success.rows[j].item;
            Price.value = success.rows[j].price;
            Qty.value = success.rows[j].qty;
            Img.src = success.rows[j].img;
            ImgContainer.style.display = "block";
            document.getElementById("btn").style.display = "none";
            document.getElementById("btn2").style.display = "block";
            document.getElementsByClassName("cameraContainer")[0].style.display = "none";
            console.log(item1)
        },
        function(tx,error){console.log("edit error"+ error.message);}
      );
    });

    showDatabase();
}

// save btn to edit data in db
function save(){
    db.transaction(saving);
    ImgContainer.style.display = "none";
    document.getElementById("btn").style.display = "block";
    document.getElementById("btn2").style.display = "none";
    document.getElementsByClassName("cameraContainer")[0].style.display = "block";
    
    showDatabase();
}

// delete record
function deleteRecord(){
    if(remove.value == ""){
        alert("insert the name of item you want to delete");
    }else{
        db.transaction(function(tx){
        tx.executeSql(
        "delete from items where item = (?)",
        [remove.value.toLowerCase()],
        function(tx,success){
            console.log(success);
            if (success.rowsAffected > 0) {
              alert("record deleted successfully");
              remove.value="";
            } else {
              alert("cant find this item in database");
            }
        },
        function(tx,error){console.log("delete error"+ error.message);}
      );
    });
    }

    showDatabase();
}

// search by item name
function searchRecord() {
  if (search.value == "") {
    alert("insert the name of item you want to search on");
  }else
  {
    db.transaction(function (tx) {
      tx.executeSql(
        "select * from items where item = ?",
        [search.value.toLowerCase()],
        function (tx, success) {
          console.log(success.rows);
          if (success.rows.length > 0) {
            alert("record found successfully");
            searchDiv.innerHTML = `
            <table>
                <thead>
                        <tr>
                            <td>Item</td>
                            <td>Price</td>
                            <td>Qty</td>
                            <td>Picture</td>
                        </tr>
                </thead>                    
                <tr>
                    <td>  ${success.rows[0].item} </td>
                    <td>  ${success.rows[0].price} </td>
                    <td>  ${success.rows[0].qty} </td>
                    <td>  <img src="${success.rows[0].img}" width="150px" height="150px"/> </td>
                 </tr>

            </table>
            `;
            search.value = "";
          } else {
            alert("cant find this item in database");
            search.value ="";
            searchDiv.innerHTML="";
          }
        },
        function (tx, error) {
          console.log("search error" + error.message);
        }
      );
    });
  }
}

/************* helping fns **************/
function adding(tx) {
    tx.executeSql(
        "insert into items (item, price, qty, img) values (?,?,?,?)",
        [Item.value.toLowerCase(), Price.value*1, Qty.value*1, Img.src],
        function(tx,success){
            console.log(success);
        },
        function(tx,error) {
            console.log("add error: "+ error.message);
            alert("couldn't add this item to database");
        }
    );
}

function saving(tx) {
    tx.executeSql(
        "update items set item = ?, price = ?, qty = ?, img = ? where item = ? ",
        [Item.value.toLowerCase(),Price.value*1,Qty.value*1,Img.src,item1],
        function(tx,success){
            console.log(success);
            alert("update successfully");
            Item.value = "";
            Price.value = "";
            Qty.value = "";
        },
        function(tx,error) {
            console.log("add error: "+ error.message);
        }
    );
}


// function assignCount(){
//     db.transaction(function(tx){
//         tx.executeSql(
//             "select * from items",
//             null,
//             function(tx,success){
//                 count = success.rows.length +1;
//                 console.log(count);
//             },
//             function(error){console.log("error of count assign :"+ error.message)}
//         );
//     });
//     // count++;
// }

// function adding(tx) {
//   if (count > 0) {
//     tx.executeSql(
//       "select * from items",
//       null,
//       function (tx, success) {
//         count = success.rows.length + 1;
//         console.log(count);
//          tx.executeSql(
//            "insert into items (id, item, price, qty, img) values(?,?,?,?,?)",
//            [count * 1, Item.value, Price.value * 1, Qty.value * 1, Img.src],
//            function (tx, success) {
//              console.log(success);
//            },
//            function (tx, error) {
//              alert("this item is already in database");
//              console.log(error.message);
//            }
//          );
//       },
//       function (error) {
//         console.log("error of count assign :" + error.message);
//       }
//     );
//   }else{
//       count =1;
//       tx.executeSql(
//         "select * from items",
//         null,
//         function (tx, success) {
//           count = success.rows.length + 1;
//           console.log(count);
//           tx.executeSql(
//             "insert into items (id, item, price, qty, img) values(?,?,?,?,?)",
//             [count * 1, Item.value, Price.value * 1, Qty.value * 1, Img.src],
//             function (tx, success) {
//               console.log(success);
//             },
//             function (tx, error) {
//               console.log("add error: " + error.message);
//             }
//           );
//         },
//         function (error) {
//           console.log("error of count assign :" + error.message);
//         }
//       );
//   }
  
// }















