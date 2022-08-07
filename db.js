//import mongoose from 'mongoose';
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rains_db',//);
{useNewUrlParser: true },function(err){
    if(err) {
        console.log('Some problem with the connection ' +err);
    } else {
        console.log('The Mongoose connection is ready');
    }
});

module.exports = mongoose;