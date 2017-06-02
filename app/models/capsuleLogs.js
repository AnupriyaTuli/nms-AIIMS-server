var mongoose = require("mongoose");

var capsuleLogsSchema = mongoose.Schema({
	uId:String,
	emailId:String,
	timestmp:Number,
	log:String
});
module.exports = mongoose.model("capsuleLogs",capsuleLogsSchema);