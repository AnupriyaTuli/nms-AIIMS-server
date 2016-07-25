var mongoose = require("mongoose");

var caregiverPatActivitiesSchema = mongoose.Schema({
	gcmToken:String,
	aiimsId:String,
	timeMillies:Number,
	activities:{}
});
module.exports = mongoose.model("caregiverPatActivities",caregiverPatActivitiesSchema);