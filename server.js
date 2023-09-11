//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-mohit:Atlas_12011975@cluster0.aqgis0g.mongodb.net/todolistDB");

const itemSchema = {
  name: String
} 

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name:"ok"
});

const item2 = new Item({
  name: "bye"
});

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2];
const workItems = [];

app.get("/", function(req, res){
  Item.find({})
    .then(function(items){
      if (items.length === 0 ){
        Item.insertMany(defaultItems)
          .then(function(){
            console.log("default data saved successfully");
          }) .catch(function(err){
            console.log(err);
          });
        res.redirect("/");
      } else{
        res.render("list.ejs", {listTitle: "Today", newListItems: items})
      }

    })
    .catch(function(err){
      console.log(err);
    })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  })

  if(listName === "Today"){
    newItem.save()
      .then(function(){
        res.redirect("/");
      })
      .catch(function(err){
        console.log(err);
      });
    
  }else{

    List.findOne({name: listName})
      .then(function(foundList){
        foundList.items.push(newItem);
        foundList.save()
        .then(function(){
          res.redirect("/" + foundList.name);
        })
        .catch(function(err){
          console.log(err);
        });
        
      })
      .catch(function(err){
        console.log(err);
      })

  }

  
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id: checkedItemId})
    .then(function(){
      console.log("deleted successfully");
      res.redirect("/");
    }) 
    .catch(function(err){
      console.log(err);
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
      .then(function(){
        console.log("delted successfully");
        res.redirect("/" + listName);
      })
      .catch(function(err){
        console.log(err);
      })
  }

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
    .then(function(foundItems){
      if(!foundItems){
        const list = new List ({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list.ejs", {listTitle: customListName, newListItems: foundItems.items})
      }
    }) 
    .catch(function(err){
      console.log(err);
    })
});

app.get("/about", function(req, res){
  res.render("about");
});
const port = process.env.PORT;
app.listen(port, function() {
  console.log("Server started on port 3000");
});
