var mongoose = require("mongoose");

var patientSchema = mongoose.Schema({
	gcmToken:String,
	accessToken:String,
	emailId:String,
	aiimsId:String,
	patientName:String,
	caretakerPhn:String,
	selfPhn:String,
	alarmStartTime:String,
	numberOfSteps:String,
	stepsWaitingTime:String,	//in seconds
	allotedDoctors:[String],
	activities:[String],
	caregivers:[String],
	lastAppUsageTime:Number,
	lastCallLogsTime:Number,
	lastActivitiesTime:Number
});
module.exports = mongoose.model("patient",patientSchema);