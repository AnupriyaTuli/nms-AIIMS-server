var mongoose = require("mongoose");

var patientAppUsageSchema = mongoose.Schema({
	gcmToken:String,
	accessToken:String,
	emailId:String,
	aiimsId:String,
	timeMillies:Number,
	appUsage:[]
});
module.exports = mongoose.model("patientAppUsage",patientAppUsageSchema);