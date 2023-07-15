// Server
const express= require("express");
const bodyParser=require("body-parser");
const mongoose =require("mongoose");
const _=require("lodash");
//const date=require(__dirname+"/date.js");//local module being exported
const app=express();
//instead of below two lines we use mongoose for db
// const items=["Buy Food","Cook Food","Eat Food"];
// const workItem=[];



//setting the app to use ejs
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));// here server will use public folder which is static in nature


mongoose.connect("mongodb+srv://admin-girish:Test123@cluster0.d9m5rhc.mongodb.net/todolistDB",{useNewUrlParser:true});

//schema creation 
const itemsSchema={
   name:String
};

//model(collection) creation

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
   name:"Welcome to ur TODOList!"
});
const item2=new Item({
   name:"Hit the + button to add a new item. "
});
const item3=new Item({
   name:"Hit this to delete an item."
});

const defaultItems=[item1, item2, item3];

const listSchema={
   name:String,
   items:[itemsSchema]
}

const List=mongoose.model("List",listSchema);

       //rendering of database items in todolist website
app.get("/",function(req,res){
    // res.send("Hlo");
   // const day=date.getDate();
   // let day=date.getMonth();
    //render function uses view engine in order to deliver index.ejs or specified ejs
       //express will go to the views folder and search for index.ejs file
       //also here we assign value to a variable which is in ejs file 'kindOfDay'


   Item.find({}).then(function(foundItems){

if(foundItems.length===0){
   Item.insertMany(defaultItems);
   res.redirect("/");
}else{
   res.render("index",
   {
    listTitle: "Today",
    newListItem:foundItems //variable: value
    }
);
}
      
   });
  
});



//adding new items into todolist DataBase from todoList website
app.post("/",function(req,res){
   
   const itemName=req.body.newItem;
   const listName=req.body.list;

   const itemNew=new Item({
      name:itemName
   });
//default list
   if(listName==="Today"){
      itemNew.save();//use to save the object directly in db

      res.redirect("/");
   }else{//Custom list
      List.findOne({name:listName}).then(function(foundList){
         foundList.items.push(itemNew);
         foundList.save();
         res.redirect("/"+ listName);
      }).catch(function(err){
         console.log(err);
      })
   }



   
});

//deleting the item from todolist DataBase through todoList website

app.post("/delete",function(req,res){
   
   const checkedItemId=req.body.checkbox;
   const listName=req.body.listName;

   //default list
   if(listName==="Today"){
      Item.findByIdAndRemove(checkedItemId).then(function(){
         console.log("deleted successfully");
      }).catch(function (err) {
         console.log(err);
      });
      res.redirect("/");
   }else{//Custom list
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(foundList){
         res.redirect("/"+ listName);
      }).catch(function(err){
         console.log(err);
      })
   }

   // console.log(checkedItemId);
   
   
});

//creating custom list
app.get("/:customListName",function(req,res){
   const customListName=_.capitalize(req.params.customListName);

   List.findOne({name:customListName}).then(function(foundList){
      if(!foundList){
         //Create a new list
         const list=new List({
            name:customListName,
            items:defaultItems
         })
         list.save();
         res.redirect("/"+customListName);
      }else{
         //show existing list
         res.render("index",{
               listTitle: foundList.name,
               newListItem:foundList.items //variable: value   
         })
      }
   }).catch(function(err){
      console.log(err);
   })
   
   
})

app.get("/about",function(req,res){
   res.render("about");
})

app.listen(3000,function(){
    console.log("Server start on port 3000");
});