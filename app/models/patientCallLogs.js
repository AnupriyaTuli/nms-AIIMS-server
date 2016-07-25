var mongoose = require("mongoose");

var patientCallLogsSchema = mongoose.Schema({
	gcmToken:String,
	accessToken:String,
	emailId:String,
	aiimsId:String,
	timeMillies:Number,
	callLogs:[]
});
module.exports = mongoose.model("patientCallLogs",patientCallLogsSchema);