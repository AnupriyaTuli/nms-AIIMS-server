var mongoose = require("mongoose");

var patientAlarmLogSchema = mongoose.Schema({
	gcmToken:String,
	accessToken:String,
	emailId:String,
	aiimsId:String,
	timeMillies:Number,
	numLevels:Number,
	alarmCycle:[]
});
module.exports = mongoose.model("patientAlarmLog",patientAlarmLogSchema);