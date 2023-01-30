const mongoose  =require('mongoose');
const Schema = mongoose.Schema;
const eventSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        required:true,
        type:Number
    },
    date:{
        type:Date,
        required:true
    }

});
module.exports = mongoose.model('Event', eventSchema);