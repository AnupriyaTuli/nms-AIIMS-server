var mongoose = require("mongoose");

var patientWalkLogSchema = mongoose.Schema({
	gcmToken:String,
	accessToken:String,
	emailId:String,
	aiimsId:String,
	timeMillies:Number,
	walkLogs:[]
});
module.exports = mongoose.model("patientWalkLog",patientWalkLogSchema);

/*TIMESTAMP,
IS_WOKEN_UP,
ALARM_TYPE,
TOTAL_NUMBER_OF_ITERATIONS,
Ith_ITERATION,
TIME_TAKEN_TO_WAKE*/