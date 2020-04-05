//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser : true, useUnifiedTopology : true});
mongoose.connect("mongodb+srv://admin-belgin:Belg123@cluster0-uqfih.mongodb.net/todolistDB",{useNewUrlParser : true, useUnifiedTopology : true});

const itemsSchema = {
  name :String
};
const Item = mongoose.model("Item",itemsSchema);


const listSchema ={
  name :String,
  items:[itemsSchema]
}
const List = mongoose.model("List",listSchema);




const item1 = new Item({
  name : "Welcome to your todolist!"
});

const item2 = new Item({
  name : "Hit the + button to add a new item."
});

const item3 = new Item({
  name : "<-- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {

const day = date.getDate();
Item.find({},function(err,foundItems){

  if(foundItems.length === 0){
    Item.insertMany(defaultItems,function(err){
      if(err){console.log(err);}
      else{console.log("Items successfully added");}
    });}

  res.render("list", {listTitle: "Today", newListItems: foundItems});
});
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){console.log("successfully deleted checked item.");
    res.redirect("/");}
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items :{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name : itemName
  });

  if(listName =="Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});


app.get("/:customListName",function(req,res){
  // console.log("My Params :"+req.params.customListName);
  var customListName = _.capitalize(req.params.customListName);
  // console.log(customListName);
  if(customListName != "Favicon.ico")
  {
    List.findOne({name:customListName},function(err,foundList){
      if(!err){
        if(!foundList){
          const list = new List({
            name : customListName,
            items:defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
        }
        else{
          res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
        }
      }
    })
  }
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
//
// app.get("/about", function(req, res){
//   res.render("about");
// });

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server has started successfully");
});
