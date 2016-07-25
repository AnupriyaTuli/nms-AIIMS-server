var mongoose = require("mongoose");

var masterCsvSchema = mongoose.Schema({
	emailId:String,
	aiimsId:String,
	patientName:String,
	timeMillies:Number,
	alarmStartTime:String,
	numberOfSteps:String,
	stepsWaitingTime:String,	//in seconds
	totalIncoming:Number,
	totalOutgoing:Number,
	/*com.android.dialer:Number,
	com.whatsapp:Number,
	com.instagram.android:Number,*/
	brushing: Number, 
	bathing: Number, 
	breakfast: Number,
	walking: Number, 
	yoga: Number,
	caregiverResBrushing: Number, 
	caregiverResBathing: Number, 
	caregiverResBreakfast: Number,
	caregiverResWalking: Number, 
	caregiverResYoga: Number
});
module.exports = mongoose.model("masterCsv",masterCsvSchema);