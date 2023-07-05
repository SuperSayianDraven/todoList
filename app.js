const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

mongoose.connect('mongodb+srv://admin-omares:omar741@cluster0.xb8jz60.mongodb.net/todoListDB');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const todoSchema = new mongoose.Schema({
  name: String
});
const listSchema = new mongoose.Schema({
  name:String,
  items: [todoSchema]
});

const collection = mongoose.model('item',todoSchema);
const listAll = mongoose.model('List',listSchema);

const item1 = new collection({name:'Welcome to your todoList'}) ;
const item2 = new collection({name:'Buy Some food'}) ;
const item3 = new collection({name:'Eat Some food'}) ;

const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {
  const day = date.getDate();
  collection.find().then((result) => {
    if (result.length === 0 ){
      collection.insertMany(defaultItems)
      res.redirect('/');
    }else{
      res.render("list", {title:day,listTitle: 'Today', newListItems: result});
    };
   });
});

app.post("/", function(req, res){
  const item = req.body.newItem;
  const  pageTitle = req.body.list;
  const newItem = new collection({name:item})
  if (pageTitle === 'Today'){
    newItem.save()
    res.redirect('/')
  }else{
    listAll.findOne({name:pageTitle}).then((result)=>{
      result.items.push(newItem);
      result.save();
      res.redirect('/'+pageTitle)
    });
    
    
  };
  

});

app.post("/delete",function(req,res) {
  var willBeDeleted = req.body.checkbox;
  var titleDeleted = req.body.listName;
  if (titleDeleted === 'Today'){
    collection.findByIdAndRemove(willBeDeleted).then()
    res.redirect('/')
  }else{
    listAll.findOneAndUpdate({name:titleDeleted},{$pull:{items:{_id:willBeDeleted}}}).then((result)=>{
      if(result){
        res.redirect('/'+ titleDeleted)
      }
    
    })
  }
  

});
app.get('/:paramName',(req,result)=> {
  var paramTitle = _.capitalize(req.params.paramName);
  const newList = new listAll ({
    name: paramTitle,
    items: defaultItems
  });
  listAll.findOne({name:paramTitle}).then((res) =>{
  if (!res){
    newList.save()
    result.redirect('/'+paramTitle);
    }
    else{
      result.render('list',{title:res.name,listTitle: res.name, newListItems: res.items})
    }
})
  
});
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000 || process.env.PORT, function() {
  console.log("Server started on port 3000");
});
