var mongoose = require("mongoose");

var capsuleUserSchema = mongoose.Schema({
	uId:String,
	gender:String,
	emailId:String,
	age:Number,
	primaryContact:Number,
	altContact:Number,
	savedPreferencesPosition:[],
	savedPreferences:[]
});
module.exports = mongoose.model("capsuleUser",capsuleUserSchema);