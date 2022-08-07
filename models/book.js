const mongoose = require('../db');


var BookSchema = mongoose.Schema({
    title: String,
    author:String,
    genre:{type:Array,default:["Unknown"]},
    publisher: {type:String,default:"Unknown"},
    pages: {type:Number,default:null},
    publish_year:{type:Number,default:null},
    cover_image:{type:String, default:"null"},
    time_added:{type: Date, default:Date.now()},
    modified:{type: Date, default:Date.now()}
});

var Book = mongoose.model("Book",BookSchema);

module.exports = Book;