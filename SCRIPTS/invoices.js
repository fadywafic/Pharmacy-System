

var main = document.getElementById("mainTable");
var sub = document.getElementById("subTable");
var radioDiv = document.getElementById("radioDiv");
var subTotal = document.getElementById("subTableTotal");

var mainDiv = document.getElementsByClassName("mainDiv")[0];
var mainTableEditDiv = document.getElementsByClassName("mainTableEditDiv")[0];
var subTableEditDiv = document.getElementsByClassName("subTableEditDiv")[0];


var sell = document.getElementById("sell");
var buy = document.getElementById("buy");
var Customer = document.getElementById("customer");
var Item = document.getElementById("item");
var Qty = document.getElementById("qty");
var today = new Date();

var count=0;
var subRows =0;

/***************************** db functionality btns  *******************************************/

var db = openDatabase("pharmacy","","", 4*1024*1024);

//create db 
db.transaction(function (tx) {
  tx.executeSql(
    "create table if not exists invoices (id int primary key, name char(100), date date, type char(10), total int)",
    null,
    function (tx, success) {
      console.log("db main created successfully");
    },
    function (tx, error) {
      console.log("create db main error: " + error.message);
    }
  );

tx.executeSql(
  "create table if not exists sub_invoices (id int ,item char(50), qty int, total int, type char(10), constraint compositePK primary key(id,item))",
  null,
  function (tx, success) {
    console.log("db sub created successfully");
  },
  function (tx, error) {
    console.log("create db sub error: " + error.message);
  }
);

});

// show db data on screen (accompained with all methods in order to show updated data usually)
function showDatabase(){
    sub.style.display ="inline-block";
    db.transaction(
        function(tx){
          tx.executeSql(
            "select * from invoices",
            null,
            function (tx, success) {
              // console.log(success);
              main.innerHTML = `
                <thead> <h2>main invoice table</h2> </thead>
                <thead>
                        <tr>
                            <td>Id</td>
                            <td>Name</td>
                            <td>date</td>
                            <td>Type</td>
                            <td>Total</td>
                            <td>Actions</td>
                        </tr>
                </thead>`;
              for (var i = 0; i < success.rows.length; i++) {
                //   console.log(success.rows);
                main.innerHTML += `
                  <tr>
                    <td> ${success.rows[i].id} </td>
                    <td>  ${success.rows[i].name} </td>
                    <td>  ${success.rows[i].date} </td>
                    <td> ${success.rows[i].type} </td>
                    <td>  ${success.rows[i].total} </td>
                    <td> 
                        <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                    </td>
                 </tr>`;
              }
            },
            function (tx, error) {
              console.log("add error: " + error.message);
            }
          );

          tx.executeSql( // get count for id (auto increment blta7iwl 3la el kanon )
                    "select * from invoices",
                    null,
                    function (tx, success) {
                      if(success.rows.length){
                        subRows = success.rows.length ;
                        tx.executeSql(
                          "select * from sub_invoices where id =(?)",
                          [subRows*1],
                          function (tx, success) {
                            // console.log(success);
                            sub.innerHTML = `
                              <thead> <h2>sub invoice table</h2> </thead>
                              <thead>
                                      <tr>
                                          <td>customer/supplier Id</td>
                                          <td>Item</td>
                                          <td>Qty</td>
                                          <td>Total</td>
                                          <td>Actions</td>
                                      </tr>
                              </thead>`;
                            for (var i = 0; i < success.rows.length; i++) {
                              //   console.log(success.rows);
                              sub.innerHTML += `
                                <tr>
                                  <td> ${success.rows[i].id} </td>
                                  <td>  ${success.rows[i].item} </td>
                                  <td>  ${success.rows[i].qty} </td>
                                  <td>  ${success.rows[i].total} </td>
                                  <td> 
                                      <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                      <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                  </td>
                               </tr>`;
                            }
                          },
                          function (tx, error) {
                            console.log("add error: " + error.message);
                          }
                        );
                       }else{
                        alert("no data in main invoices table to retrieve"); 
                      }
                    },
                      function (error) {
                    console.log("error of count assign :" + error.message);
                    }
                  );
        }
    );
    
}


// insert record
function add(){
    if(Customer.value =="" || Item.value =="" || Qty.value =="" || (buy.checked == false && sell.checked == false) ){
        alert("make sure you entered customer/supplier name, item name, qty and have checked one option (buy or sell)");
    } else {
        sub.style.display = "inline-block";
        main.style.display = "none";
        db.transaction(function(tx){
          tx.executeSql(
            "select * from invoices",
            null,
            function (tx, success) {
              // console.log(success);
              if (success.rows.length != count || count ==0){
                db.transaction(addingmain);
                db.transaction(addingsub);       
              }else{
                db.transaction(addingsub);       
              }
            },function(err){console.log(err.message)}
          );
        });
    }
}

// edit record
function editRecord(j) {//main invoice table
  console.log(j + "from edit record");
  db.transaction(function (tx) {
    tx.executeSql(
      "select * from invoices where id = (?) ",
      [j],
      function (tx, success) {
        console.log(success);
        mainDiv.style.display = "none";
        mainTableEditDiv.style.display = "inline-block";
        subTableEditDiv.style.display = "none";
        id = document.getElementById("mainTableId").value = success.rows[0].id;
        document.getElementById("mainTableCustomer").value = success.rows[0].name;
        document.getElementById("mainTableDate").value = success.rows[0].date;
        document.getElementById("mainTableType").value = success.rows[0].type;
        document.getElementById("mainTableTotal").value = success.rows[0].total;
        tx.executeSql(
          "select * from sub_invoices where id = (?)",
          [id],
          function (tx, success) {
            console.log(success);
            sub.innerHTML = `
              <thead> <h2>sub invoice table</h2> </thead>
              <thead>
                      <tr>
                          <td>customer/supplier Id</td>
                          <td>Item</td>
                          <td>Qty</td>
                          <td>Total</td>
                          <td>Actions</td>
                      </tr>
              </thead>`;
            for (var i = 0; i < success.rows.length; i++) {
              console.log(success.rows);
              sub.innerHTML += `
                <tr>
                  <td> ${success.rows[i].id} </td>
                  <td>  ${success.rows[i].item} </td>
                  <td>  ${success.rows[i].qty} </td>
                  <td>  ${success.rows[i].total} </td>
                  <td> 
                      <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                      <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                  </td>
               </tr>
               `;
            }
            sub.style.display = "inline-block";
          }
        );
      },
      function (tx, error) {
        console.log("edit error" + error.message);
      }
    );
  });
}

function edit(j){//sub_invoice table
  console.log(j + "from edit record ");
    db.transaction(function(tx){
      try{
        tx.executeSql(
        "select * from sub_invoices where id = (?) ",
        [id],
        function(tx,success){
          mainDiv.style.display = "none";
          if(mainTableEditDiv.style.display == "none"){}else{mainTableEditDiv.style.display = "block"};
          subTableEditDiv.style.display ="inline-block";
          console.log( success.rows);
          document.getElementById("subTableId").value = success.rows[j].id;
          document.getElementById("subTableitem").value = success.rows[j].item;
          document.getElementById("subTableQty").value = success.rows[j].qty;
          document.getElementById("subTableTotal").value = success.rows[j].total;
          document.getElementById("subTableType").value = success.rows[j].type;
          // show special div to edit main invoice record in it (we 2 edit fns one for edit in main table and other for edit in sub table)
          // console.log(id);
        },
        function(tx,error){console.log("edit error"+ error.message);}
      );

      }catch(err){
        
        tx.executeSql(
          "select * from sub_invoices where id = (?) ",
          [count],
          function (tx, success) {
            mainDiv.style.display = "none";
            mainTableEditDiv.style.display = "none"
              ? (mainTableEditDiv.style.display = "none")
              : (mainTableEditDiv.style.display = "inline-block");
            subTableEditDiv.style.display = "inline-block";
            console.log(success.rows);
            document.getElementById("subTableId").value = success.rows[j].id;
            document.getElementById("subTableitem").value = success.rows[j].item;
            document.getElementById("subTableQty").value = success.rows[j].qty;
            document.getElementById("subTableTotal").value = success.rows[j].total;
            document.getElementById("subTableType").value = success.rows[j].type;
            // show special div to edit main invoice record in it (we 2 edit fns one for edit in main table and other for edit in sub table)
            // console.log(id);
          },
          function (tx, error) {
            console.log("edit error" + error.message);
          }
        );

      }
    });

}



// save btn to edit data in sub_invoices table and re-render the updates
function saveSub(){
    db.transaction(saving);
}

function saveMain(){
    db.transaction(function(tx){
      tx.executeSql(
        "update invoices set name = (?) where id = (?)",
        [
          document.getElementById("mainTableCustomer").value,
          document.getElementById("mainTableId").value,
        ],
        function (tx, success) {
          console.log(success);
          if(success.rowsAffected>0){
            tx.executeSql(
              "select * from invoices",
              null,
              function (tx, success) {
                // console.log(success);
                main.innerHTML = `
                <thead> <h2>main invoice table</h2> </thead>
                <thead>
                        <tr>
                            <td>Id</td>
                            <td>Name</td>
                            <td>date</td>
                            <td>Type</td>
                            <td>Total</td>
                            <td>Actions</td>
                        </tr>
                </thead>`;
                for (var i = 0; i < success.rows.length; i++) {
                  //   console.log(success.rows);
                  main.innerHTML += `
                  <tr>
                    <td> ${success.rows[i].id} </td>
                    <td>  ${success.rows[i].name} </td>
                    <td>  ${success.rows[i].date} </td>
                    <td> ${success.rows[i].type} </td>
                    <td>  ${success.rows[i].total} </td>
                    <td> 
                        <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                    </td>
                 </tr>`;
                }
              },
              function (tx, error) {
                console.log("add error: " + error.message);
              }
            );
          }
        },
        function (err) {
          console.log(err.message);
        }
      );
    });
}

function finish(){
  mainDiv.style.display = "block";
  mainTableEditDiv.style.display = "none";
  subTableEditDiv.style.display = "none";
  sub.style.display = "none";
}


// delete record
function deleteRecord(j){//main invoice table
  db.transaction(function(tx){
  tx.executeSql(
    "select * from sub_invoices where id = (?)",
    [j],
    function(tx,success){
      if(success.rows.length){
        console.log(success);
        tx.executeSql(
            "delete from invoices where id = (?)",
            [j],
            function(tx,success){
              tx.executeSql(
            "select * from invoices",
            null,
            function (tx, success) {
              // console.log(success);
              main.innerHTML = `
                <thead> <h2>main invoice table</h2> </thead>
                <thead>
                        <tr>
                            <td>Id</td>
                            <td>Name</td>
                            <td>date</td>
                            <td>Type</td>
                            <td>Total</td>
                            <td>Actions</td>
                        </tr>
                </thead>`;
              for (var i = 0; i < success.rows.length; i++) {
                //   console.log(success.rows);
                main.innerHTML += `
                  <tr>
                    <td> ${success.rows[i].id} </td>
                    <td>  ${success.rows[i].name} </td>
                    <td>  ${success.rows[i].date} </td>
                    <td> ${success.rows[i].type} </td>
                    <td>  ${success.rows[i].total} </td>
                    <td> 
                        <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                    </td>
                 </tr>`;
              }
            },
            function (tx, error) {
              console.log("add error: " + error.message);
            }
          );
            },
            function(tx,err){
              console.log(err.message);
            }
          );
        for(n=0; n<success.rows.length; n++){
          rem(n);
        }
      }

    },
    function(tx,err){
      console.log();
    }
  );
});

}


var subId;
var subItem;
var subType;
var subQty;
function remove(j){//sub_invoice table
  db.transaction(function(tx){
    
    // console.log(j + " from remove fn");
    try{
    tx.executeSql(
    "select * from sub_invoices where id = (?) ",
    [id],
    function(tx,success){
      if(success.rows.length){
        console.log(success);
        subId = id;
        subItem = success.rows[j].item;
        subType = success.rows[j].type;
        subQty = success.rows[j].qty;
        tx.executeSql(// edit qty in items table
          "select qty from sub_invoices where id = (?) and item = (?) ",
          [
            subId,
            subItem                             
          ],function(tx,success){
            if(success.rows.length){
              var pastQty = success.rows[0].qty;
              if (subType == "sales order") {
                tx.executeSql(
                  //update items table
                  "update items set qty = qty + (?) where item =(?) ",
                  [
                    pastQty,
                    subItem,
                  ],
                  function (tx, success) {
                    if (success.rowsAffected > 0) {
                      console.log("table items updated successfully");
                      tx.executeSql(
                        //update total in sub_invoices table
                        "update sub_invoices set total = (?) where id = (?) and item = (?) ",
                        [0, subId, subItem],
                        function (tx, success) {
                          console.log(success);
                          if (success.rowsAffected > 0) {
                            //update total in main invoice table
                            tx.executeSql(
                              "select sum(total) as sum from sub_invoices where id = (?)",
                              [subId],
                              function (tx, success) {
                                console.log(success);
                                if (success.rows.length) {
                                  total = success.rows[0].sum * 1;
                                  tx.executeSql(
                                    "update invoices set total = (?) where id = (?)",
                                    [total, document.getElementById("subTableId").value],
                                    function (tx, success) {
                                      console.log(
                                        "main invoices total field successfully updated"
                                      );
                                      console.log(success);
                                      document.getElementById("mainTableTotal").value = total;
                  
                                      tx.executeSql(
                                        "delete from sub_invoices where id =(?) and item = (?)",
                                        [subId, subItem],
                                        function (tx, success) {
                                          try {
                                            tx.executeSql(
                                              "select * from sub_invoices where id = (?)",
                                              [id],
                                              function (tx, success) {
                                                console.log(success);
                                                sub.innerHTML = `
                                               <thead> <h2>sub invoice table</h2> </thead>
                                               <thead>
                                                       <tr>
                                                           <td>customer/supplier Id</td>
                                                           <td>Item</td>
                                                           <td>Qty</td>
                                                           <td>Total</td>
                                                           <td>Actions</td>
                                                       </tr>
                                               </thead>`;
                                                for (var i = 0; i < success.rows.length; i++) {
                                                  console.log(success.rows);
                                                  sub.innerHTML += `
                                                 <tr>
                                                   <td> ${success.rows[i].id} </td>
                                                   <td>  ${success.rows[i].item} </td>
                                                   <td>  ${success.rows[i].qty} </td>
                                                   <td>  ${success.rows[i].total} </td>
                                                   <td> 
                                                       <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                       <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                   </td>
                                                </tr>
                                                `;
                  
                                                  tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                    <thead> <h2>main invoice table</h2> </thead>
                                                    <thead>
                                                            <tr>
                                                                <td>Id</td>
                                                                <td>Name</td>
                                                                <td>date</td>
                                                                <td>Type</td>
                                                                <td>Total</td>
                                                                <td>Actions</td>
                                                            </tr>
                                                    </thead>`;
                                                      for (
                                                        var i = 0;
                                                        i < success.rows.length;
                                                        i++
                                                      ) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                      <tr>
                                                        <td> ${success.rows[i].id} </td>
                                                        <td>  ${success.rows[i].name} </td>
                                                        <td>  ${success.rows[i].date} </td>
                                                        <td> ${success.rows[i].type} </td>
                                                        <td>  ${success.rows[i].total} </td>
                                                        <td> 
                                                            <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                            </td>
                                                     </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                                                }
                                                sub.style.display = "inline-block";
                                              }
                                            );
                                          } catch {
                                            tx.executeSql(
                                              "select * from sub_invoices where id = (?)",
                                              [count],
                                              function (tx, success) {
                                                console.log(success);
                                                sub.innerHTML = `
                                               <thead> <h2>sub invoice table</h2> </thead>
                                               <thead>
                                                       <tr>
                                                           <td>customer/supplier Id</td>
                                                           <td>Item</td>
                                                           <td>Qty</td>
                                                           <td>Total</td>
                                                           <td>Actions</td>
                                                       </tr>
                                               </thead>`;
                                                for (var i = 0; i < success.rows.length; i++) {
                                                  console.log(success.rows);
                                                  sub.innerHTML += `
                                                 <tr>
                                                   <td> ${success.rows[i].id} </td>
                                                   <td>  ${success.rows[i].item} </td>
                                                   <td>  ${success.rows[i].qty} </td>
                                                   <td>  ${success.rows[i].total} </td>
                                                   <td> 
                                                       <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                       <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                   </td>
                                                </tr>
                                                `;
                  
                                                  tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                    <thead> <h2>main invoice table</h2> </thead>
                                                    <thead>
                                                            <tr>
                                                                <td>Id</td>
                                                                <td>Name</td>
                                                                <td>date</td>
                                                                <td>Type</td>
                                                                <td>Total</td>
                                                                <td>Actions</td>
                                                            </tr>
                                                    </thead>`;
                                                      for (
                                                        var i = 0;
                                                        i < success.rows.length;
                                                        i++
                                                      ) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                      <tr>
                                                        <td> ${success.rows[i].id} </td>
                                                        <td>  ${success.rows[i].name} </td>
                                                        <td>  ${success.rows[i].date} </td>
                                                        <td> ${success.rows[i].type} </td>
                                                        <td>  ${success.rows[i].total} </td>
                                                        <td> 
                                                            <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                            </td>
                                                     </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                                                }
                                                sub.style.display = "inline-block";
                                              }
                                            );
                                          }
                                        },
                                        function (err) {
                                          alert("cant delete from sub table");
                                          console.log("alert here");
                                        }
                                      );
                                    },
                                    function (tx, error) {
                                      alert("cant update total in main db");
                                      console.log(error.message);
                                    }
                                  );
                                }
                              },
                              function (error) {
                                console.log(
                                  "error in select statement for total counting: " + error.message
                                );
                              }
                            );
                            console.log("table sub invoices total field updated successfully");
                          }
                        },
                        function (err) {
                          console.log(err.message);
                        }
                      ); 
                    }
                  },
                  function (err) {
                    console.log(err.message);
                  }
                );
              } else {
                tx.executeSql(
                  //update items table
                  "update items set qty = qty - (?) where item =(?) ",
                  [
                    pastQty,
                    subItem,
                  ],
                  function (tx, success) {
                    if (success.rowsAffected > 0) {
                      console.log("table items updated successfully");
                       tx.executeSql(
                        //update total in sub_invoices table
                        "update sub_invoices set total = (?) where id = (?) and item = (?) ",
                        [0, subId, subItem],
                        function (tx, success) {
                          console.log(success);
                          if (success.rowsAffected > 0) {
                            //update total in main invoice table
                            tx.executeSql(
                              "select sum(total) as sum from sub_invoices where id = (?)",
                              [subId],
                              function (tx, success) {
                                console.log(success);
                                if (success.rows.length) {
                                  total = success.rows[0].sum * 1;
                                  tx.executeSql(
                                    "update invoices set total = (?) where id = (?)",
                                    [total, document.getElementById("subTableId").value],
                                    function (tx, success) {
                                      console.log(
                                        "main invoices total field successfully updated"
                                      );
                                      console.log(success);
                                      document.getElementById("mainTableTotal").value = total;
                  
                                      tx.executeSql(
                                        "delete from sub_invoices where id =(?) and item = (?)",
                                        [subId, subItem],
                                        function (tx, success) {
                                          try {
                                            tx.executeSql(
                                              "select * from sub_invoices where id = (?)",
                                              [id],
                                              function (tx, success) {
                                                console.log(success);
                                                sub.innerHTML = `
                                               <thead> <h2>sub invoice table</h2> </thead>
                                               <thead>
                                                       <tr>
                                                           <td>customer/supplier Id</td>
                                                           <td>Item</td>
                                                           <td>Qty</td>
                                                           <td>Total</td>
                                                           <td>Actions</td>
                                                       </tr>
                                               </thead>`;
                                                for (var i = 0; i < success.rows.length; i++) {
                                                  console.log(success.rows);
                                                  sub.innerHTML += `
                                                 <tr>
                                                   <td> ${success.rows[i].id} </td>
                                                   <td>  ${success.rows[i].item} </td>
                                                   <td>  ${success.rows[i].qty} </td>
                                                   <td>  ${success.rows[i].total} </td>
                                                   <td> 
                                                       <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                       <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                   </td>
                                                </tr>
                                                `;
                  
                                                  tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                    <thead> <h2>main invoice table</h2> </thead>
                                                    <thead>
                                                            <tr>
                                                                <td>Id</td>
                                                                <td>Name</td>
                                                                <td>date</td>
                                                                <td>Type</td>
                                                                <td>Total</td>
                                                                <td>Actions</td>
                                                            </tr>
                                                    </thead>`;
                                                      for (
                                                        var i = 0;
                                                        i < success.rows.length;
                                                        i++
                                                      ) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                      <tr>
                                                        <td> ${success.rows[i].id} </td>
                                                        <td>  ${success.rows[i].name} </td>
                                                        <td>  ${success.rows[i].date} </td>
                                                        <td> ${success.rows[i].type} </td>
                                                        <td>  ${success.rows[i].total} </td>
                                                        <td> 
                                                            <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                            </td>
                                                     </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                                                }
                                                sub.style.display = "inline-block";
                                              }
                                            );
                                          } catch {
                                            tx.executeSql(
                                              "select * from sub_invoices where id = (?)",
                                              [count],
                                              function (tx, success) {
                                                console.log(success);
                                                sub.innerHTML = `
                                               <thead> <h2>sub invoice table</h2> </thead>
                                               <thead>
                                                       <tr>
                                                           <td>customer/supplier Id</td>
                                                           <td>Item</td>
                                                           <td>Qty</td>
                                                           <td>Total</td>
                                                           <td>Actions</td>
                                                       </tr>
                                               </thead>`;
                                                for (var i = 0; i < success.rows.length; i++) {
                                                  console.log(success.rows);
                                                  sub.innerHTML += `
                                                 <tr>
                                                   <td> ${success.rows[i].id} </td>
                                                   <td>  ${success.rows[i].item} </td>
                                                   <td>  ${success.rows[i].qty} </td>
                                                   <td>  ${success.rows[i].total} </td>
                                                   <td> 
                                                       <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                       <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                   </td>
                                                </tr>
                                                `;
                  
                                                  tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                    <thead> <h2>main invoice table</h2> </thead>
                                                    <thead>
                                                            <tr>
                                                                <td>Id</td>
                                                                <td>Name</td>
                                                                <td>date</td>
                                                                <td>Type</td>
                                                                <td>Total</td>
                                                                <td>Actions</td>
                                                            </tr>
                                                    </thead>`;
                                                      for (
                                                        var i = 0;
                                                        i < success.rows.length;
                                                        i++
                                                      ) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                      <tr>
                                                        <td> ${success.rows[i].id} </td>
                                                        <td>  ${success.rows[i].name} </td>
                                                        <td>  ${success.rows[i].date} </td>
                                                        <td> ${success.rows[i].type} </td>
                                                        <td>  ${success.rows[i].total} </td>
                                                        <td> 
                                                            <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                            </td>
                                                     </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                                                }
                                                sub.style.display = "inline-block";
                                              }
                                            );
                                          }
                                        },
                                        function (err) {
                                          alert("cant delete from sub table");
                                          console.log("alert here");
                                        }
                                      );
                                    },
                                    function (tx, error) {
                                      alert("cant update total in main db");
                                      console.log(error.message);
                                    }
                                  );
                                }
                              },
                              function (error) {
                                console.log(
                                  "error in select statement for total counting: " + error.message
                                );
                              }
                            );
                            console.log("table sub invoices total field updated successfully");
                          }
                        },
                        function (err) {
                          console.log(err.message);
                        }
                      ); 
                    }
                  },
                  function (err) {
                    console.log(err.message);
                  }
                );
              }
            }
          }
        );

      }else{
        alert("cant get data from sub invoice table for remove fn");
        console.log("alert here");
      }

    },
    function(tx,error){console.log("edit error"+ error.message);}
  );

    
  }catch(err){
    
    tx.executeSql(
      "select * from sub_invoices where id = (?) ",
      [count],
      function (tx, success) {
        console.log(success);
        if(success.rows.length){
             subId = count;
             subItem = success.rows[j||0].item;
             subType = success.rows[j||0].type;
             tx.executeSql(// edit qty in items table
               "select qty from sub_invoices where id = (?) and item = (?) ",
               [
                 subId,
                 subItem                             
               ],function(tx,success){
                 if(success.rows.length){
                   var pastQty = success.rows[0].qty;
                   if (subType == "sales order") {
                     tx.executeSql(
                       //update items table
                       "update items set qty = qty + (?) where item =(?) ",
                       [
                         pastQty,
                         subItem,
                       ],
                       function (tx, success) {
                         if (success.rowsAffected > 0) {
                           console.log("table items updated successfully");
                           tx.executeSql( //update total in sub_invoices table
                            "update sub_invoices set total = (?) where id = (?) and item = (?) ",
                            [
                              0,
                              subId,
                              subItem
                            ],
                            function(tx,success){
                              console.log(success);
                              if(success.rowsAffected >0){//update total in main invoice table
                                tx.executeSql(
                                  "select sum(total) as sum from sub_invoices where id = (?)",
                                  [subId],
                                  function (tx, success) {
                                    console.log(success);
                                    if (success.rows.length) {
                                      total = success.rows[0].sum * 1;
                                      tx.executeSql(
                                        "update invoices set total = (?) where id = (?)",
                                        [total, document.getElementById("subTableId").value],
                                        function (tx, success) {
                                          console.log("main invoices total field successfully updated");
                                          console.log(success);
                                          document.getElementById("mainTableTotal").value = total;
                        
                                          tx.executeSql(
                                            "delete from sub_invoices where id =(?) and item = (?)",
                                            [
                                            subId,
                                            subItem
                                          ],
                                          function(tx,success){
                                            try{
                                              tx.executeSql(
                                               "select * from sub_invoices where id = (?)",
                                               [id],
                                               function (tx, success) {
                                                 console.log(success);
                                                 sub.innerHTML = `
                                                   <thead> <h2>sub invoice table</h2> </thead>
                                                   <thead>
                                                           <tr>
                                                               <td>customer/supplier Id</td>
                                                               <td>Item</td>
                                                               <td>Qty</td>
                                                               <td>Total</td>
                                                               <td>Actions</td>
                                                           </tr>
                                                   </thead>`;
                                                 for (var i = 0; i < success.rows.length; i++) {
                                                   console.log(success.rows);
                                                   sub.innerHTML += `
                                                     <tr>
                                                       <td> ${success.rows[i].id} </td>
                                                       <td>  ${success.rows[i].item} </td>
                                                       <td>  ${success.rows[i].qty} </td>
                                                       <td>  ${success.rows[i].total} </td>
                                                       <td> 
                                                           <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                           <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                       </td>
                                                    </tr>
                                                    `;
                          
                                                    tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                        <thead> <h2>main invoice table</h2> </thead>
                                                        <thead>
                                                                <tr>
                                                                    <td>Id</td>
                                                                    <td>Name</td>
                                                                    <td>date</td>
                                                                    <td>Type</td>
                                                                    <td>Total</td>
                                                                    <td>Actions</td>
                                                                </tr>
                                                        </thead>`;
                                                      for (var i = 0; i < success.rows.length; i++) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                          <tr>
                                                            <td> ${success.rows[i].id} </td>
                                                            <td>  ${success.rows[i].name} </td>
                                                            <td>  ${success.rows[i].date} </td>
                                                            <td> ${success.rows[i].type} </td>
                                                            <td>  ${success.rows[i].total} </td>
                                                            <td> 
                                                                <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                                    </td>
                                                         </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                          
                                                  }
                                                  sub.style.display = "inline-block";
                                                }
                                              );
                                              
                                            }catch{
                                              tx.executeSql(
                                               "select * from sub_invoices where id = (?)",
                                               [count],
                                               function (tx, success) {
                                                 console.log(success);
                                                 sub.innerHTML = `
                                                   <thead> <h2>sub invoice table</h2> </thead>
                                                   <thead>
                                                           <tr>
                                                               <td>customer/supplier Id</td>
                                                               <td>Item</td>
                                                               <td>Qty</td>
                                                               <td>Total</td>
                                                               <td>Actions</td>
                                                           </tr>
                                                   </thead>`;
                                                 for (var i = 0; i < success.rows.length; i++) {
                                                   console.log(success.rows);
                                                   sub.innerHTML += `
                                                     <tr>
                                                       <td> ${success.rows[i].id} </td>
                                                       <td>  ${success.rows[i].item} </td>
                                                       <td>  ${success.rows[i].qty} </td>
                                                       <td>  ${success.rows[i].total} </td>
                                                       <td> 
                                                           <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                           <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                       </td>
                                                    </tr>
                                                    `
                          
                                                    tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      //console.log(success);
                                                      main.innerHTML = `
                                                        <thead> <h2>main invoice table</h2> </thead>
                                                        <thead>
                                                                <tr>
                                                                    <td>Id</td>
                                                                    <td>Name</td>
                                                                    <td>date</td>
                                                                    <td>Type</td>
                                                                    <td>Total</td>
                                                                    <td>Actions</td>
                                                                </tr>
                                                        </thead>`;
                                                      for (var i = 0; i < success.rows.length; i++) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                          <tr>
                                                            <td> ${success.rows[i].id} </td>
                                                            <td>  ${success.rows[i].name} </td>
                                                            <td>  ${success.rows[i].date} </td>
                                                            <td> ${success.rows[i].type} </td>
                                                            <td>  ${success.rows[i].total} </td>
                                                            <td> 
                                                                <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                                    </td>
                                                         </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                          
                                                  }
                                                  sub.style.display = "inline-block";
                                                }
                                              );
                                              
                                            }
                        
                                          },function(err){
                                            alert("cant delete from sub table");
                                            console.log("alert here");
                                          }
                                          );
                        
                                        },
                                        function (tx, error) {
                                          alert("cant update total in main db");
                                          console.log(error.message);
                                        }
                                      );
                                    }
                                  },
                                  function (error) {
                                    console.log(
                                      "error in select statement for total counting: " +
                                        error.message
                                    );
                                  }
                                );      
                                console.log("table sub invoices total field updated successfully");
                              }
                            },
                            function(err){console.log(err.message);}
                          );  
                         }
                       },
                       function (err) {
                         console.log(err.message);
                       }
                     );
                   } else {
                     tx.executeSql(
                       //update items table
                       "update items set qty = qty - (?) where item =(?) ",
                       [
                         pastQty,
                         subItem,
                       ],
                       function (tx, success) {
                         if (success.rowsAffected > 0) {
                           console.log("table items updated successfully");
                           tx.executeSql( //update total in sub_invoices table
                            "update sub_invoices set total = (?) where id = (?) and item = (?) ",
                            [
                              0,
                              subId,
                              subItem
                            ],
                            function(tx,success){
                              console.log(success);
                              if(success.rowsAffected >0){//update total in main invoice table
                                tx.executeSql(
                                  "select sum(total) as sum from sub_invoices where id = (?)",
                                  [subId],
                                  function (tx, success) {
                                    console.log(success);
                                    if (success.rows.length) {
                                      total = success.rows[0].sum * 1;
                                      tx.executeSql(
                                        "update invoices set total = (?) where id = (?)",
                                        [total, document.getElementById("subTableId").value],
                                        function (tx, success) {
                                          console.log("main invoices total field successfully updated");
                                          console.log(success);
                                          document.getElementById("mainTableTotal").value = total;
                        
                                          tx.executeSql(
                                            "delete from sub_invoices where id =(?) and item = (?)",
                                            [
                                            subId,
                                            subItem
                                          ],
                                          function(tx,success){
                                            try{
                                              tx.executeSql(
                                               "select * from sub_invoices where id = (?)",
                                               [id],
                                               function (tx, success) {
                                                 console.log(success);
                                                 sub.innerHTML = `
                                                   <thead> <h2>sub invoice table</h2> </thead>
                                                   <thead>
                                                           <tr>
                                                               <td>customer/supplier Id</td>
                                                               <td>Item</td>
                                                               <td>Qty</td>
                                                               <td>Total</td>
                                                               <td>Actions</td>
                                                           </tr>
                                                   </thead>`;
                                                 for (var i = 0; i < success.rows.length; i++) {
                                                   console.log(success.rows);
                                                   sub.innerHTML += `
                                                     <tr>
                                                       <td> ${success.rows[i].id} </td>
                                                       <td>  ${success.rows[i].item} </td>
                                                       <td>  ${success.rows[i].qty} </td>
                                                       <td>  ${success.rows[i].total} </td>
                                                       <td> 
                                                           <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                           <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                       </td>
                                                    </tr>
                                                    `;
                          
                                                    tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                        <thead> <h2>main invoice table</h2> </thead>
                                                        <thead>
                                                                <tr>
                                                                    <td>Id</td>
                                                                    <td>Name</td>
                                                                    <td>date</td>
                                                                    <td>Type</td>
                                                                    <td>Total</td>
                                                                    <td>Actions</td>
                                                                </tr>
                                                        </thead>`;
                                                      for (var i = 0; i < success.rows.length; i++) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                          <tr>
                                                            <td> ${success.rows[i].id} </td>
                                                            <td>  ${success.rows[i].name} </td>
                                                            <td>  ${success.rows[i].date} </td>
                                                            <td> ${success.rows[i].type} </td>
                                                            <td>  ${success.rows[i].total} </td>
                                                            <td> 
                                                                <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                                    </td>
                                                         </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                          
                                                  }
                                                  sub.style.display = "inline-block";
                                                }
                                              );
                                              
                                            }catch{
                                              tx.executeSql(
                                               "select * from sub_invoices where id = (?)",
                                               [count],
                                               function (tx, success) {
                                                 console.log(success);
                                                 sub.innerHTML = `
                                                   <thead> <h2>sub invoice table</h2> </thead>
                                                   <thead>
                                                           <tr>
                                                               <td>customer/supplier Id</td>
                                                               <td>Item</td>
                                                               <td>Qty</td>
                                                               <td>Total</td>
                                                               <td>Actions</td>
                                                           </tr>
                                                   </thead>`;
                                                 for (var i = 0; i < success.rows.length; i++) {
                                                   console.log(success.rows);
                                                   sub.innerHTML += `
                                                     <tr>
                                                       <td> ${success.rows[i].id} </td>
                                                       <td>  ${success.rows[i].item} </td>
                                                       <td>  ${success.rows[i].qty} </td>
                                                       <td>  ${success.rows[i].total} </td>
                                                       <td> 
                                                           <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                           <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                       </td>
                                                    </tr>
                                                    `;
                          
                                                    tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                        <thead> <h2>main invoice table</h2> </thead>
                                                        <thead>
                                                                <tr>
                                                                    <td>Id</td>
                                                                    <td>Name</td>
                                                                    <td>date</td>
                                                                    <td>Type</td>
                                                                    <td>Total</td>
                                                                    <td>Actions</td>
                                                                </tr>
                                                        </thead>`;
                                                      for (var i = 0; i < success.rows.length; i++) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                          <tr>
                                                            <td> ${success.rows[i].id} </td>
                                                            <td>  ${success.rows[i].name} </td>
                                                            <td>  ${success.rows[i].date} </td>
                                                            <td> ${success.rows[i].type} </td>
                                                            <td>  ${success.rows[i].total} </td>
                                                            <td> 
                                                                <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                                    </td>
                                                         </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                          
                                                  }
                                                  sub.style.display = "inline-block";
                                                }
                                              );
                                              
                                            }
                        
                                          },function(err){
                                            alert("cant delete from sub table");
                                            console.log("alert here");
                                          }
                                          );
                        
                                        },
                                        function (tx, error) {
                                          alert("cant update total in main db");
                                          console.log(error.message);
                                        }
                                      );
                                    }
                                  },
                                  function (error) {
                                    console.log(
                                      "error in select statement for total counting: " +
                                        error.message
                                    );
                                  }
                                );      
                                console.log("table sub invoices total field updated successfully");
                              }
                            },
                            function(err){console.log(err.message);}
                          ); 
                         }
                       },
                       function (err) {
                         console.log(err.message);
                       }
                     );
                   }
                 }
               }
             );
 
           }else{
             alert("cant get data from sub invoice table for remove fn");
             console.log("alert here");
           }
      },
      function (tx, error) {
        console.log("edit error" + error.message);
      }
    );    
    }
  });
}



function rem(j){//sub_invoice table
  db.transaction(function(tx){
    
    // console.log(j + " from remove fn");
    try{
    tx.executeSql(
    "select * from sub_invoices where id = (?) ",
    [id],
    function(tx,success){
      if(success.rows.length){
        console.log(success);
        subId = id;
        subItem = success.rows[j].item;
        subType = success.rows[j].type;
        subQty = success.rows[j].qty;
        tx.executeSql(// edit qty in items table
          "select qty from sub_invoices where id = (?) and item = (?) ",
          [
            subId,
            subItem                             
          ],function(tx,success){
            if(success.rows.length){
              var pastQty = success.rows[0].qty;
              if (subType == "sales order") {
                tx.executeSql(
                  //update items table
                  "update items set qty = qty + (?) where item =(?) ",
                  [
                    pastQty,
                    subItem,
                  ],
                  function (tx, success) {
                    if (success.rowsAffected > 0) {
                      console.log("table items updated successfully");
                      tx.executeSql(
                        //update total in sub_invoices table
                        "update sub_invoices set total = (?) where id = (?) and item = (?) ",
                        [0, subId, subItem],
                        function (tx, success) {
                          console.log(success);
                          if (success.rowsAffected > 0) {
                            //update total in main invoice table
                            tx.executeSql(
                              "select sum(total) as sum from sub_invoices where id = (?)",
                              [subId],
                              function (tx, success) {
                                console.log(success);
                                if (success.rows.length) {
                                  total = success.rows[0].sum * 1;
                                  tx.executeSql(
                                    "update invoices set total = (?) where id = (?)",
                                    [total, document.getElementById("subTableId").value],
                                    function (tx, success) {
                                      console.log(
                                        "main invoices total field successfully updated"
                                      );
                                      console.log(success);
                                      document.getElementById("mainTableTotal").value = total;
                  
                                      tx.executeSql(
                                        "delete from sub_invoices where id =(?) and item = (?)",
                                        [subId, subItem],
                                        function (tx, success) {
                                          try {
                                            tx.executeSql(
                                              "select * from sub_invoices where id = (?)",
                                              [id],
                                              function (tx, success) {
                                                console.log(success);
                                                sub.innerHTML = `
                                               <thead> <h2>sub invoice table</h2> </thead>
                                               <thead>
                                                       <tr>
                                                           <td>customer/supplier Id</td>
                                                           <td>Item</td>
                                                           <td>Qty</td>
                                                           <td>Total</td>
                                                           <td>Actions</td>
                                                       </tr>
                                               </thead>`;
                                                for (var i = 0; i < success.rows.length; i++) {
                                                  console.log(success.rows);
                                                  sub.innerHTML += `
                                                 <tr>
                                                   <td> ${success.rows[i].id} </td>
                                                   <td>  ${success.rows[i].item} </td>
                                                   <td>  ${success.rows[i].qty} </td>
                                                   <td>  ${success.rows[i].total} </td>
                                                   <td> 
                                                       <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                       <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                   </td>
                                                </tr>
                                                `;
                  
                                                  tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                    <thead> <h2>main invoice table</h2> </thead>
                                                    <thead>
                                                            <tr>
                                                                <td>Id</td>
                                                                <td>Name</td>
                                                                <td>date</td>
                                                                <td>Type</td>
                                                                <td>Total</td>
                                                                <td>Actions</td>
                                                            </tr>
                                                    </thead>`;
                                                      for (
                                                        var i = 0;
                                                        i < success.rows.length;
                                                        i++
                                                      ) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                      <tr>
                                                        <td> ${success.rows[i].id} </td>
                                                        <td>  ${success.rows[i].name} </td>
                                                        <td>  ${success.rows[i].date} </td>
                                                        <td> ${success.rows[i].type} </td>
                                                        <td>  ${success.rows[i].total} </td>
                                                        <td> 
                                                            <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                            </td>
                                                     </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                                                }
                                                sub.style.display = "inline-block";
                                              }
                                            );
                                          } catch {
                                            tx.executeSql(
                                              "select * from sub_invoices where id = (?)",
                                              [count],
                                              function (tx, success) {
                                                console.log(success);
                                                sub.innerHTML = `
                                               <thead> <h2>sub invoice table</h2> </thead>
                                               <thead>
                                                       <tr>
                                                           <td>customer/supplier Id</td>
                                                           <td>Item</td>
                                                           <td>Qty</td>
                                                           <td>Total</td>
                                                           <td>Actions</td>
                                                       </tr>
                                               </thead>`;
                                                for (var i = 0; i < success.rows.length; i++) {
                                                  console.log(success.rows);
                                                  sub.innerHTML += `
                                                 <tr>
                                                   <td> ${success.rows[i].id} </td>
                                                   <td>  ${success.rows[i].item} </td>
                                                   <td>  ${success.rows[i].qty} </td>
                                                   <td>  ${success.rows[i].total} </td>
                                                   <td> 
                                                       <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                       <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                   </td>
                                                </tr>
                                                `;
                  
                                                  tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                    <thead> <h2>main invoice table</h2> </thead>
                                                    <thead>
                                                            <tr>
                                                                <td>Id</td>
                                                                <td>Name</td>
                                                                <td>date</td>
                                                                <td>Type</td>
                                                                <td>Total</td>
                                                                <td>Actions</td>
                                                            </tr>
                                                    </thead>`;
                                                      for (
                                                        var i = 0;
                                                        i < success.rows.length;
                                                        i++
                                                      ) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                      <tr>
                                                        <td> ${success.rows[i].id} </td>
                                                        <td>  ${success.rows[i].name} </td>
                                                        <td>  ${success.rows[i].date} </td>
                                                        <td> ${success.rows[i].type} </td>
                                                        <td>  ${success.rows[i].total} </td>
                                                        <td> 
                                                            <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                            </td>
                                                     </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                                                }
                                                sub.style.display = "inline-block";
                                              }
                                            );
                                          }
                                        },
                                        function (err) {
                                          alert("cant delete from sub table");
                                          console.log("alert here");
                                        }
                                      );
                                    },
                                    function (tx, error) {
                                      alert("cant update total in main db");
                                      console.log(error.message);
                                    }
                                  );
                                }
                              },
                              function (error) {
                                console.log(
                                  "error in select statement for total counting: " + error.message
                                );
                              }
                            );
                            console.log("table sub invoices total field updated successfully");
                          }
                        },
                        function (err) {
                          console.log(err.message);
                        }
                      ); 
                    }
                  },
                  function (err) {
                    console.log(err.message);
                  }
                );
              } else {
                tx.executeSql(
                  //update items table
                  "update items set qty = qty - (?) where item =(?) ",
                  [
                    pastQty,
                    subItem,
                  ],
                  function (tx, success) {
                    if (success.rowsAffected > 0) {
                      console.log("table items updated successfully");
                       tx.executeSql(
                        //update total in sub_invoices table
                        "update sub_invoices set total = (?) where id = (?) and item = (?) ",
                        [0, subId, subItem],
                        function (tx, success) {
                          console.log(success);
                          if (success.rowsAffected > 0) {
                            //update total in main invoice table
                            tx.executeSql(
                              "select sum(total) as sum from sub_invoices where id = (?)",
                              [subId],
                              function (tx, success) {
                                console.log(success);
                                if (success.rows.length) {
                                  total = success.rows[0].sum * 1;
                                  tx.executeSql(
                                    "update invoices set total = (?) where id = (?)",
                                    [total, document.getElementById("subTableId").value],
                                    function (tx, success) {
                                      console.log(
                                        "main invoices total field successfully updated"
                                      );
                                      console.log(success);
                                      document.getElementById("mainTableTotal").value = total;
                  
                                      tx.executeSql(
                                        "delete from sub_invoices where id =(?) and item = (?)",
                                        [subId, subItem],
                                        function (tx, success) {
                                          try {
                                            tx.executeSql(
                                              "select * from sub_invoices where id = (?)",
                                              [id],
                                              function (tx, success) {
                                                console.log(success);
                                                sub.innerHTML = `
                                               <thead> <h2>sub invoice table</h2> </thead>
                                               <thead>
                                                       <tr>
                                                           <td>customer/supplier Id</td>
                                                           <td>Item</td>
                                                           <td>Qty</td>
                                                           <td>Total</td>
                                                           <td>Actions</td>
                                                       </tr>
                                               </thead>`;
                                                for (var i = 0; i < success.rows.length; i++) {
                                                  console.log(success.rows);
                                                  sub.innerHTML += `
                                                 <tr>
                                                   <td> ${success.rows[i].id} </td>
                                                   <td>  ${success.rows[i].item} </td>
                                                   <td>  ${success.rows[i].qty} </td>
                                                   <td>  ${success.rows[i].total} </td>
                                                   <td> 
                                                       <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                       <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                   </td>
                                                </tr>
                                                `;
                  
                                                  tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                    <thead> <h2>main invoice table</h2> </thead>
                                                    <thead>
                                                            <tr>
                                                                <td>Id</td>
                                                                <td>Name</td>
                                                                <td>date</td>
                                                                <td>Type</td>
                                                                <td>Total</td>
                                                                <td>Actions</td>
                                                            </tr>
                                                    </thead>`;
                                                      for (
                                                        var i = 0;
                                                        i < success.rows.length;
                                                        i++
                                                      ) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                      <tr>
                                                        <td> ${success.rows[i].id} </td>
                                                        <td>  ${success.rows[i].name} </td>
                                                        <td>  ${success.rows[i].date} </td>
                                                        <td> ${success.rows[i].type} </td>
                                                        <td>  ${success.rows[i].total} </td>
                                                        <td> 
                                                            <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                            </td>
                                                     </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                                                }
                                                sub.style.display = "inline-block";
                                              }
                                            );
                                          } catch {
                                            tx.executeSql(
                                              "select * from sub_invoices where id = (?)",
                                              [count],
                                              function (tx, success) {
                                                console.log(success);
                                                sub.innerHTML = `
                                               <thead> <h2>sub invoice table</h2> </thead>
                                               <thead>
                                                       <tr>
                                                           <td>customer/supplier Id</td>
                                                           <td>Item</td>
                                                           <td>Qty</td>
                                                           <td>Total</td>
                                                           <td>Actions</td>
                                                       </tr>
                                               </thead>`;
                                                for (var i = 0; i < success.rows.length; i++) {
                                                  console.log(success.rows);
                                                  sub.innerHTML += `
                                                 <tr>
                                                   <td> ${success.rows[i].id} </td>
                                                   <td>  ${success.rows[i].item} </td>
                                                   <td>  ${success.rows[i].qty} </td>
                                                   <td>  ${success.rows[i].total} </td>
                                                   <td> 
                                                       <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                       <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                   </td>
                                                </tr>
                                                `;
                  
                                                  tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                    <thead> <h2>main invoice table</h2> </thead>
                                                    <thead>
                                                            <tr>
                                                                <td>Id</td>
                                                                <td>Name</td>
                                                                <td>date</td>
                                                                <td>Type</td>
                                                                <td>Total</td>
                                                                <td>Actions</td>
                                                            </tr>
                                                    </thead>`;
                                                      for (
                                                        var i = 0;
                                                        i < success.rows.length;
                                                        i++
                                                      ) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                      <tr>
                                                        <td> ${success.rows[i].id} </td>
                                                        <td>  ${success.rows[i].name} </td>
                                                        <td>  ${success.rows[i].date} </td>
                                                        <td> ${success.rows[i].type} </td>
                                                        <td>  ${success.rows[i].total} </td>
                                                        <td> 
                                                            <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                            </td>
                                                     </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                                                }
                                                sub.style.display = "inline-block";
                                              }
                                            );
                                          }
                                        },
                                        function (err) {
                                          alert("cant delete from sub table");
                                          console.log("alert here");
                                        }
                                      );
                                    },
                                    function (tx, error) {
                                      alert("cant update total in main db");
                                      console.log(error.message);
                                    }
                                  );
                                }
                              },
                              function (error) {
                                console.log(
                                  "error in select statement for total counting: " + error.message
                                );
                              }
                            );
                            console.log("table sub invoices total field updated successfully");
                          }
                        },
                        function (err) {
                          console.log(err.message);
                        }
                      ); 
                    }
                  },
                  function (err) {
                    console.log(err.message);
                  }
                );
              }
            }
          }
        );

      }else{
        alert("cant get data from sub invoice table for remove fn");
        console.log("alert here");
      }

    },
    function(tx,error){console.log("edit error"+ error.message);}
  );

    
  }catch(err){
    
    tx.executeSql(
      "select * from sub_invoices where id = (?) ",
      [subRows],
      function (tx, success) {
        console.log(success);
        if(success.rows.length){
             subId = subRows;
             subItem = success.rows[0].item;
             subType = success.rows[0].type;
             tx.executeSql(// edit qty in items table
               "select qty from sub_invoices where id = (?) and item = (?) ",
               [
                 subId,
                 subItem                             
               ],function(tx,success){
                 if(success.rows.length){
                   var pastQty = success.rows[0].qty;
                   if (subType == "sales order") {
                     tx.executeSql(
                       //update items table
                       "update items set qty = qty + (?) where item =(?) ",
                       [
                         pastQty,
                         subItem,
                       ],
                       function (tx, success) {
                         if (success.rowsAffected > 0) {
                           console.log("table items updated successfully");
                           tx.executeSql( //update total in sub_invoices table
                            "update sub_invoices set total = (?) where id = (?) and item = (?) ",
                            [
                              0,
                              subId,
                              subItem
                            ],
                            function(tx,success){
                              console.log(success);
                              if(success.rowsAffected >0){//update total in main invoice table
                                tx.executeSql(
                                  "select sum(total) as sum from sub_invoices where id = (?)",
                                  [subId],
                                  function (tx, success) {
                                    console.log(success);
                                    if (success.rows.length) {
                                      total = success.rows[0].sum * 1;
                                      tx.executeSql(
                                        "update invoices set total = (?) where id = (?)",
                                        [total, document.getElementById("subTableId").value],
                                        function (tx, success) {
                                          console.log("main invoices total field successfully updated");
                                          console.log(success);
                                          document.getElementById("mainTableTotal").value = total;
                        
                                          tx.executeSql(
                                            "delete from sub_invoices where id =(?) and item = (?)",
                                            [
                                            subId,
                                            subItem
                                          ],
                                          function(tx,success){
                                            try{
                                              tx.executeSql(
                                               "select * from sub_invoices where id = (?)",
                                               [id],
                                               function (tx, success) {
                                                 console.log(success);
                                                 sub.innerHTML = `
                                                   <thead> <h2>sub invoice table</h2> </thead>
                                                   <thead>
                                                           <tr>
                                                               <td>customer/supplier Id</td>
                                                               <td>Item</td>
                                                               <td>Qty</td>
                                                               <td>Total</td>
                                                               <td>Actions</td>
                                                           </tr>
                                                   </thead>`;
                                                 for (var i = 0; i < success.rows.length; i++) {
                                                   console.log(success.rows);
                                                   sub.innerHTML += `
                                                     <tr>
                                                       <td> ${success.rows[i].id} </td>
                                                       <td>  ${success.rows[i].item} </td>
                                                       <td>  ${success.rows[i].qty} </td>
                                                       <td>  ${success.rows[i].total} </td>
                                                       <td> 
                                                           <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                           <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                       </td>
                                                    </tr>
                                                    `;
                          
                                                    tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                        <thead> <h2>main invoice table</h2> </thead>
                                                        <thead>
                                                                <tr>
                                                                    <td>Id</td>
                                                                    <td>Name</td>
                                                                    <td>date</td>
                                                                    <td>Type</td>
                                                                    <td>Total</td>
                                                                    <td>Actions</td>
                                                                </tr>
                                                        </thead>`;
                                                      for (var i = 0; i < success.rows.length; i++) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                          <tr>
                                                            <td> ${success.rows[i].id} </td>
                                                            <td>  ${success.rows[i].name} </td>
                                                            <td>  ${success.rows[i].date} </td>
                                                            <td> ${success.rows[i].type} </td>
                                                            <td>  ${success.rows[i].total} </td>
                                                            <td> 
                                                                <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                                    </td>
                                                         </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                          
                                                  }
                                                  sub.style.display = "inline-block";
                                                }
                                              );
                                              
                                            }catch{
                                              tx.executeSql(
                                               "select * from sub_invoices where id = (?)",
                                               [count],
                                               function (tx, success) {
                                                 console.log(success);
                                                 sub.innerHTML = `
                                                   <thead> <h2>sub invoice table</h2> </thead>
                                                   <thead>
                                                           <tr>
                                                               <td>customer/supplier Id</td>
                                                               <td>Item</td>
                                                               <td>Qty</td>
                                                               <td>Total</td>
                                                               <td>Actions</td>
                                                           </tr>
                                                   </thead>`;
                                                 for (var i = 0; i < success.rows.length; i++) {
                                                   console.log(success.rows);
                                                   sub.innerHTML += `
                                                     <tr>
                                                       <td> ${success.rows[i].id} </td>
                                                       <td>  ${success.rows[i].item} </td>
                                                       <td>  ${success.rows[i].qty} </td>
                                                       <td>  ${success.rows[i].total} </td>
                                                       <td> 
                                                           <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                           <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                       </td>
                                                    </tr>
                                                    `
                          
                                                    tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      //console.log(success);
                                                      main.innerHTML = `
                                                        <thead> <h2>main invoice table</h2> </thead>
                                                        <thead>
                                                                <tr>
                                                                    <td>Id</td>
                                                                    <td>Name</td>
                                                                    <td>date</td>
                                                                    <td>Type</td>
                                                                    <td>Total</td>
                                                                    <td>Actions</td>
                                                                </tr>
                                                        </thead>`;
                                                      for (var i = 0; i < success.rows.length; i++) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                          <tr>
                                                            <td> ${success.rows[i].id} </td>
                                                            <td>  ${success.rows[i].name} </td>
                                                            <td>  ${success.rows[i].date} </td>
                                                            <td> ${success.rows[i].type} </td>
                                                            <td>  ${success.rows[i].total} </td>
                                                            <td> 
                                                                <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                                    </td>
                                                         </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                          
                                                  }
                                                  sub.style.display = "inline-block";
                                                }
                                              );
                                              
                                            }
                        
                                          },function(err){
                                            alert("cant delete from sub table");
                                            console.log("alert here");
                                          }
                                          );
                        
                                        },
                                        function (tx, error) {
                                          alert("cant update total in main db");
                                          console.log(error.message);
                                        }
                                      );
                                    }
                                  },
                                  function (error) {
                                    console.log(
                                      "error in select statement for total counting: " +
                                        error.message
                                    );
                                  }
                                );      
                                console.log("table sub invoices total field updated successfully");
                              }
                            },
                            function(err){console.log(err.message);}
                          );  
                         }
                       },
                       function (err) {
                         console.log(err.message);
                       }
                     );
                   } else {
                     tx.executeSql(
                       //update items table
                       "update items set qty = qty - (?) where item =(?) ",
                       [
                         pastQty,
                         subItem,
                       ],
                       function (tx, success) {
                         if (success.rowsAffected > 0) {
                           console.log("table items updated successfully");
                           tx.executeSql( //update total in sub_invoices table
                            "update sub_invoices set total = (?) where id = (?) and item = (?) ",
                            [
                              0,
                              subId,
                              subItem
                            ],
                            function(tx,success){
                              console.log(success);
                              if(success.rowsAffected >0){//update total in main invoice table
                                tx.executeSql(
                                  "select sum(total) as sum from sub_invoices where id = (?)",
                                  [subId],
                                  function (tx, success) {
                                    console.log(success);
                                    if (success.rows.length) {
                                      total = success.rows[0].sum * 1;
                                      tx.executeSql(
                                        "update invoices set total = (?) where id = (?)",
                                        [total, document.getElementById("subTableId").value],
                                        function (tx, success) {
                                          console.log("main invoices total field successfully updated");
                                          console.log(success);
                                          document.getElementById("mainTableTotal").value = total;
                        
                                          tx.executeSql(
                                            "delete from sub_invoices where id =(?) and item = (?)",
                                            [
                                            subId,
                                            subItem
                                          ],
                                          function(tx,success){
                                            try{
                                              tx.executeSql(
                                               "select * from sub_invoices where id = (?)",
                                               [id],
                                               function (tx, success) {
                                                 console.log(success);
                                                 sub.innerHTML = `
                                                   <thead> <h2>sub invoice table</h2> </thead>
                                                   <thead>
                                                           <tr>
                                                               <td>customer/supplier Id</td>
                                                               <td>Item</td>
                                                               <td>Qty</td>
                                                               <td>Total</td>
                                                               <td>Actions</td>
                                                           </tr>
                                                   </thead>`;
                                                 for (var i = 0; i < success.rows.length; i++) {
                                                   console.log(success.rows);
                                                   sub.innerHTML += `
                                                     <tr>
                                                       <td> ${success.rows[i].id} </td>
                                                       <td>  ${success.rows[i].item} </td>
                                                       <td>  ${success.rows[i].qty} </td>
                                                       <td>  ${success.rows[i].total} </td>
                                                       <td> 
                                                           <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                           <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                       </td>
                                                    </tr>
                                                    `;
                          
                                                    tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                        <thead> <h2>main invoice table</h2> </thead>
                                                        <thead>
                                                                <tr>
                                                                    <td>Id</td>
                                                                    <td>Name</td>
                                                                    <td>date</td>
                                                                    <td>Type</td>
                                                                    <td>Total</td>
                                                                    <td>Actions</td>
                                                                </tr>
                                                        </thead>`;
                                                      for (var i = 0; i < success.rows.length; i++) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                          <tr>
                                                            <td> ${success.rows[i].id} </td>
                                                            <td>  ${success.rows[i].name} </td>
                                                            <td>  ${success.rows[i].date} </td>
                                                            <td> ${success.rows[i].type} </td>
                                                            <td>  ${success.rows[i].total} </td>
                                                            <td> 
                                                                <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                                    </td>
                                                         </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                          
                                                  }
                                                  sub.style.display = "inline-block";
                                                }
                                              );
                                              
                                            }catch{
                                              tx.executeSql(
                                               "select * from sub_invoices where id = (?)",
                                               [count],
                                               function (tx, success) {
                                                 console.log(success);
                                                 sub.innerHTML = `
                                                   <thead> <h2>sub invoice table</h2> </thead>
                                                   <thead>
                                                           <tr>
                                                               <td>customer/supplier Id</td>
                                                               <td>Item</td>
                                                               <td>Qty</td>
                                                               <td>Total</td>
                                                               <td>Actions</td>
                                                           </tr>
                                                   </thead>`;
                                                 for (var i = 0; i < success.rows.length; i++) {
                                                   console.log(success.rows);
                                                   sub.innerHTML += `
                                                     <tr>
                                                       <td> ${success.rows[i].id} </td>
                                                       <td>  ${success.rows[i].item} </td>
                                                       <td>  ${success.rows[i].qty} </td>
                                                       <td>  ${success.rows[i].total} </td>
                                                       <td> 
                                                           <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                                           <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                                       </td>
                                                    </tr>
                                                    `;
                          
                                                    tx.executeSql(
                                                    "select * from invoices",
                                                    null,
                                                    function (tx, success) {
                                                      // console.log(success);
                                                      main.innerHTML = `
                                                        <thead> <h2>main invoice table</h2> </thead>
                                                        <thead>
                                                                <tr>
                                                                    <td>Id</td>
                                                                    <td>Name</td>
                                                                    <td>date</td>
                                                                    <td>Type</td>
                                                                    <td>Total</td>
                                                                    <td>Actions</td>
                                                                </tr>
                                                        </thead>`;
                                                      for (var i = 0; i < success.rows.length; i++) {
                                                        //   console.log(success.rows);
                                                        main.innerHTML += `
                                                          <tr>
                                                            <td> ${success.rows[i].id} </td>
                                                            <td>  ${success.rows[i].name} </td>
                                                            <td>  ${success.rows[i].date} </td>
                                                            <td> ${success.rows[i].type} </td>
                                                            <td>  ${success.rows[i].total} </td>
                                                            <td> 
                                                                <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                                                    </td>
                                                         </tr>`;
                                                      }
                                                    },
                                                    function (tx, error) {
                                                      console.log("add error: " + error.message);
                                                    }
                                                  );
                          
                                                  }
                                                  sub.style.display = "inline-block";
                                                }
                                              );
                                              
                                            }
                        
                                          },function(err){
                                            alert("cant delete from sub table");
                                            console.log("alert here");
                                          }
                                          );
                        
                                        },
                                        function (tx, error) {
                                          alert("cant update total in main db");
                                          console.log(error.message);
                                        }
                                      );
                                    }
                                  },
                                  function (error) {
                                    console.log(
                                      "error in select statement for total counting: " +
                                        error.message
                                    );
                                  }
                                );      
                                console.log("table sub invoices total field updated successfully");
                              }
                            },
                            function(err){console.log(err.message);}
                          ); 
                         }
                       },
                       function (err) {
                         console.log(err.message);
                       }
                     );
                   }
                 }
               }
             );
 
           }else{
             alert("cant get data from sub invoice table for remove fn");
             console.log("alert here");
           }
      },
      function (tx, error) {
        console.log("edit error" + error.message);
      }
    );    
    }
  });
}

/************* helping fns **************/

function saving(tx) {

    tx.executeSql(// edit qty in items table
      "select qty from sub_invoices where id = (?) and item = (?) ",
      [
        document.getElementById("subTableId").value,
        document.getElementById("subTableitem").value
      ],function(tx,success){
        if(success.rows.length){
          var pastQty = success.rows[0].qty;
          if (document.getElementById("subTableType").value == "sales order") {
            tx.executeSql(
              //update items table
              "update items set qty = qty - ((?)-(?)) where item =(?) ",
              [
                document.getElementById("subTableQty").value,
                pastQty,
                document.getElementById("subTableitem").value,
              ],
              function (tx, success) {
                if (success.rowsAffected > 0) {
                  console.log("table items updated successfully");
                }
              },
              function (err) {
                console.log(err.message);
              }
            );
          } else {
            tx.executeSql(
              //update items table
              "update items set qty = qty + ((?)-(?)) where item =(?) ",
              [
                document.getElementById("subTableQty").value,
                pastQty,
                document.getElementById("subTableitem").value,
              ],
              function (tx, success) {
                if (success.rowsAffected > 0) {
                  console.log("table items updated successfully");
                }
              },
              function (err) {
                console.log(err.message);
              }
            );
          }
        }
      }
    );

    tx.executeSql(//update qty in sub_invoices table
      "update sub_invoices set qty = (?) where id = (?) and item = (?) ",
      [
        document.getElementById("subTableQty").value,
        document.getElementById("subTableId").value,
        document.getElementById("subTableitem").value
      ],
      function (tx, success) {
        console.log(success);
        if(success.rowsAffected>0){
          tx.executeSql( // calc total .. total = price of item * qty of item
            "select price from items where item = ?",
            [document.getElementById("subTableitem").value],
            function (tx, success) {
              console.log(success);
              if(success.rows.length){
                total = success.rows[0].price * (document.getElementById("subTableQty").value*1);
                console.log(total);
                tx.executeSql( //update total in sub_invoices table
                  "update sub_invoices set total = (?) where id = (?) and item = (?) ",
                  [
                    total,
                    document.getElementById("subTableId").value,
                    document.getElementById("subTableitem").value
                  ],
                  function(tx,success){
                    console.log(success)
                    document.getElementById("subTableTotal").value = total;
                    if(success.rowsAffected >0){//update total in main invoice table
                      tx.executeSql(
                        "select sum(total) as sum from sub_invoices where id = (?)",
                        [document.getElementById("subTableId").value],
                        function (tx, success) {
                          console.log(success);
                          if (success.rows.length) {
                            total = success.rows[0].sum * 1;
                            tx.executeSql(
                              "update invoices set total = (?) where id = (?)",
                              [total, document.getElementById("subTableId").value],
                              function (tx, success) {
                                console.log("main invoices total field successfully updated");
                                console.log(success);
                                document.getElementById("mainTableTotal").value = total;
                                try{
                                  tx.executeSql(
                                   "select * from sub_invoices where id = (?)",
                                   [id],
                                   function (tx, success) {
                                     console.log(success);
                                     sub.innerHTML = `
                                       <thead> <h2>sub invoice table</h2> </thead>
                                       <thead>
                                               <tr>
                                                   <td>customer/supplier Id</td>
                                                   <td>Item</td>
                                                   <td>Qty</td>
                                                   <td>Total</td>
                                                   <td>Actions</td>
                                               </tr>
                                       </thead>`;
                                     for (var i = 0; i < success.rows.length; i++) {
                                       console.log(success.rows);
                                       sub.innerHTML += `
                                         <tr>
                                           <td> ${success.rows[i].id} </td>
                                           <td>  ${success.rows[i].item} </td>
                                           <td>  ${success.rows[i].qty} </td>
                                           <td>  ${success.rows[i].total} </td>
                                           <td> 
                                               <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                               <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                           </td>
                                        </tr>
                                        `;
  
                                        tx.executeSql(
                                        "select * from invoices",
                                        null,
                                        function (tx, success) {
                                          // console.log(success);
                                          main.innerHTML = `
                                            <thead> <h2>main invoice table</h2> </thead>
                                            <thead>
                                                    <tr>
                                                        <td>Id</td>
                                                        <td>Name</td>
                                                        <td>date</td>
                                                        <td>Type</td>
                                                        <td>Total</td>
                                                        <td>Actions</td>
                                                    </tr>
                                            </thead>`;
                                          for (var i = 0; i < success.rows.length; i++) {
                                            //   console.log(success.rows);
                                            main.innerHTML += `
                                              <tr>
                                                <td> ${success.rows[i].id} </td>
                                                <td>  ${success.rows[i].name} </td>
                                                <td>  ${success.rows[i].date} </td>
                                                <td> ${success.rows[i].type} </td>
                                                <td>  ${success.rows[i].total} </td>
                                                <td> 
                                                    <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                            </td>
                                             </tr>`;
                                          }
                                        },
                                        function (tx, error) {
                                          console.log("add error: " + error.message);
                                        }
                                      );
   
                                      }
                                      sub.style.display = "inline-block";
                                    }
                                  );
                                  
                                }catch{
                                  tx.executeSql(
                                   "select * from sub_invoices where id = (?)",
                                   [count],
                                   function (tx, success) {
                                     console.log(success);
                                     sub.innerHTML = `
                                       <thead> <h2>sub invoice table</h2> </thead>
                                       <thead>
                                               <tr>
                                                   <td>customer/supplier Id</td>
                                                   <td>Item</td>
                                                   <td>Qty</td>
                                                   <td>Total</td>
                                                   <td>Actions</td>
                                               </tr>
                                       </thead>`;
                                     for (var i = 0; i < success.rows.length; i++) {
                                       console.log(success.rows);
                                       sub.innerHTML += `
                                         <tr>
                                           <td> ${success.rows[i].id} </td>
                                           <td>  ${success.rows[i].item} </td>
                                           <td>  ${success.rows[i].qty} </td>
                                           <td>  ${success.rows[i].total} </td>
                                           <td> 
                                               <input class="insidebtn" type="button" value="edit" onclick="edit(${i})">
                                               <input class="insidebtn" type="button" value="delete" onclick="remove(${i})">
                                           </td>
                                        </tr>
                                        `;
  
                                        tx.executeSql(
                                        "select * from invoices",
                                        null,
                                        function (tx, success) {
                                          // console.log(success);
                                          main.innerHTML = `
                                            <thead> <h2>main invoice table</h2> </thead>
                                            <thead>
                                                    <tr>
                                                        <td>Id</td>
                                                        <td>Name</td>
                                                        <td>date</td>
                                                        <td>Type</td>
                                                        <td>Total</td>
                                                        <td>Actions</td>
                                                    </tr>
                                            </thead>`;
                                          for (var i = 0; i < success.rows.length; i++) {
                                            //   console.log(success.rows);
                                            main.innerHTML += `
                                              <tr>
                                                <td> ${success.rows[i].id} </td>
                                                <td>  ${success.rows[i].name} </td>
                                                <td>  ${success.rows[i].date} </td>
                                                <td> ${success.rows[i].type} </td>
                                                <td>  ${success.rows[i].total} </td>
                                                <td> 
                                                    <input class="insidebtn" type="button" value="edit" onclick="editRecord(${success.rows[i].id})">
                                                                            </td>
                                             </tr>`;
                                          }
                                        },
                                        function (tx, error) {
                                          console.log("add error: " + error.message);
                                        }
                                      );
   
                                      }
                                      sub.style.display = "inline-block";
                                    }
                                  );
                                  
                                }
                              },
                              function (tx, error) {
                                alert("cant update total in main db");
                                console.log(error.message);
                              }
                            );
                          }
                        },
                        function (error) {
                          console.log(
                            "error in select statement for total counting: " +
                              error.message
                          );
                        }
                      );      
                      console.log("table sub invoices total field updated successfully");
                    }
                  },
                  function(err){console.log(err.message);}
                );
              }
            },function(err){console.log(err.message);}
            );

            alert("update successfully");
            
          }
        },
        function (tx, error) {
          console.log("add error: " + error.message);
        }
      );
}

function addingmain(tx){
  tx.executeSql(
          "select * from invoices",
          null,
          function (tx, success) {
            success.rows.length ? count = success.rows.length+1 : count = 1;
            console.log(count);
              tx.executeSql(
                "insert into invoices (id, name, date, type, total) values(?,?,?,?,?)",
                [count * 1, Customer.value.toLowerCase(), today.toGMTString(), buy.checked ? "purchase order" : "sales order" ,0],
                function (tx, success) {
                  console.log("added to main db successfully");
                },
                function (tx, error) {
                  alert("cant add to main db");
                  console.log(error.message);
                }
              );
          },
          function (error) {
            console.log("error of count assign :" + error.message);
          }
        );
}


var total;
function addingsub(tx) {
  if(sell.checked){
    tx.executeSql( // get qty of required item to check if we have enough resources of it to make the sales order
      "select qty from items where item = (?)",
      [Item.value],
      function(tx,success){
        console.log(success)
        if(success.rows.length){
          if(Qty.value <= success.rows[0].qty){
              tx.executeSql( // calc total .. total = price of item * qty of item
              "select price from items where item = ?",
              [Item.value.toLowerCase()],
              function (tx, success) {
                console.log(success);
                total = success.rows[0].price * (Qty.value*1);
                tx.executeSql( // get count for id (auto increment blta7iwl 3la el kanon )
                  "select * from invoices",
                  null,
                  function (tx, success) {
                    if(success.rows.length){
                      subRows = success.rows.length+1;
                      console.log(count);
                      if (total) {
                        var itemval= Item.value;
                        var qtyval= Qty.value;
                        tx.executeSql( // insert record into sub table
                        "insert into sub_invoices (id, item, qty, total,type) values(?,?,?,?,?)",
                        [count * 1, Item.value.toLowerCase(), Qty.value * 1, total * 1,"sales order"],
                        function (tx, success) {
                          console.log("added to sub db successfully");
                          console.log(success);
                          tx.executeSql( //update item qty in items table (in case of sales order)
                            "update items set qty = qty - (?) where item = (?)",
                            [qtyval*1, itemval.toLowerCase()],
                            function(success){
                              console.log("finally dealed with items table " + success);
                            },
                            function(err){
                            alert("cant re-configure items table");
                            console.log("error from select qty in deal with items table: "+err.message);
                            }
                          );
                        },
                        function (tx, error) {
                          alert("this item is already in the invoice you can edit it");
                          console.log(error.message);
                        }
                      );
                      Item.value = "";
                      Qty.value = "";
                      radioDiv.style.display ="none";
                    }
                  }else{
                    alert("no data in main invoices table to retrieve");
                    console.log("alert here");
                  } 
                },
                function (error) {
                console.log("error of count assign :" + error.message);
                }
              );
          },
          function (error) {
         console.log("error in select statement for total counting: " + error.message);
         }
        );
      }else{
        alert("we dont have enough stock from this item to make this sales order");
      }
    }else{
      alert("we don,t have any of this item");
      console.log("alert here");
    }
  },
  function(err){console.log("cant access item table "+ err.message);}
);
}else{
  tx.executeSql( // calc total .. total = price of item * qty of item
    "select price from items where item = ?",
    [Item.value.toLowerCase()],
    function (tx, success) {
      if(success.rows.length){
        console.log(success);
        total = success.rows[0].price * (Qty.value*1);
        tx.executeSql( // get count for id (auto increment blta7iwl 3la el kanon )
          "select * from invoices",
          null,
          function (tx, success) {
            if(success.rows.length){
              subRows = success.rows.length+1;
              console.log(count);
              if (total) {
                var itemval= Item.value;
                var qtyval= Qty.value;
                tx.executeSql( // insert record into sub table
                "insert into sub_invoices (id, item, qty, total,type) values(?,?,?,?,?)",
                [count * 1, Item.value.toLowerCase(), Qty.value * 1, total * 1,"purchase order"],
                function (tx, success) {
                  console.log("added to sub db successfully");
                  console.log(success);
                  tx.executeSql( //update item qty in items table (in case of sales order)
                    "update items set qty = qty + (?) where item = (?)",
                    [qtyval*1, itemval.toLowerCase()],
                    function(success){
                      console.log("finally dealed with items table " + success);
                    },
                    function(err){
                    alert("cant re-configure items table");
                    console.log("error from select qty in deal with items table: "+err.message);
                    }
                  );
                },
                function (tx, error) {
                  alert("cant add to sub db");
                  console.log(error.message);
                }
              );
              Item.value = "";
              Qty.value = "";
              radioDiv.style.display ="none";
            }
          }else{
            alert("no data in main invoices table to retrieve");
            console.log("alert here");
          } 
        },
        function (error) {
        console.log("error of count assign :" + error.message);
        }
      );
   }else{
     alert("this item isn't defined, add this item first to database");
   }
  },
  function (error) {
  console.log("error in select statement for total counting: " + error.message);
  }
  );
}
  showDatabase();
}
                      
                

/************************************************************************************************************* */

// display main table and disapear sub table
function Done(){
count++;
main.style.display = "inline-block";
db.transaction(end);
showDatabase();
}

// get sum of totals from sub invoice table and insert customer/supplier data into invoice table
function end(tx){

tx.executeSql(
  "select * from invoices",
  null,
  function (tx, success) {
    if(success.rows.length > 0){
      subRows = success.rows.length; 
      tx.executeSql(
        "select sum(total) as sum from sub_invoices where id = (?)",
        [subRows],
        function (tx, success) {
          // console.log(success);
          if (success.rows.length) {
            total = success.rows[0].sum *1;
            tx.executeSql(
              "update invoices set total = (?) where id = (?)",
              [total,subRows],
              function (tx, success) {
                console.log("added to main db successfully");
                // console.log(success);
                Customer.value = "unknown";
                buy.checked = false;
                sell.checked = false;
                radioDiv.style.display = "block";
                sub.style.display = "none";
              },
              function (tx, error) {
                alert("cant update total in main db");
                console.log(error.message);
                }
              );
            }
          },
          function (error) {
            console.log("error in select statement for total counting: " + error.message);
          }
        );      
        }else{
          alert("we dont have any customers/ suppliers in database");
          console.log("alert here");
          sub.style.display = "none";
        }
      },
      function (error) {  
        console.log("error of count assign :" + error.message);
      }
    );
 
}
