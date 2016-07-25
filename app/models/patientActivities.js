var mongoose = require("mongoose");

var patientActivitiesSchema = mongoose.Schema({
	gcmToken:String,
	accessToken:String,
	emailId:String,
	aiimsId:String,
	timeMillies:Number,
	activities:{}
});
module.exports = mongoose.model("patientActivities",patientActivitiesSchema);