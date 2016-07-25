var User = require('./models/user')
var Patient = require('./models/patient')
var PatientActivities = require('./models/patientActivities')
var CaregiverPatActivities = require('./models/caregiverPatActivities')
var PatientCallLogs = require('./models/patientCallLogs')
var PatientAppUsage = require('./models/patientAppUsage')
var MasterCsv = require('./models/masterCsv');
var gcm = require('node-gcm');
var json2csv = require('json2csv');
var fs = require('fs');
var schedule = require('node-schedule');
var path  = require("path");

module.exports = function(app,passport){

	/*app.get('/:username/:password',function(req, res){
		var newUser = new User();
		newUser.local.username = req.params.username;
		newUser.local.password = req.params.password;
		console.log(newUser.local.username+" "+newUser.local.password);
		newUser.save(function(err){
			if(err){
				throw err;
			}
		})
		res.send("success");
	})*/

	app.post("/api/app/register/patient", function(req, res){
		var reqData = new Array();
		reqData["aiimsId"] = req.body.aiimsId;
		reqData["emailId"] = req.body.emailId;
		reqData["patientName"] = req.body.patientName;
		reqData["selfPhn"] = req.body.self_ph_Number;
		reqData["caretakerPhn"] = req.body.caretaker_ph_Number;
		reqData["gcmToken"] = req.body.gcm_token;
		reqData["accessToken"] = req.body.access_token;

		registerPatient(reqData["aiimsId"], reqData["emailId"], reqData["patientName"], reqData["selfPhn"], reqData["caretakerPhn"],reqData["accessToken"],reqData["gcmToken"],function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  });
	})

	app.post("/api/app/login/patient", function(req, res){
		var reqData = new Array();
		reqData["emailId"] = req.body.userId;
		reqData["accessToken"] = req.body.access_token;
		reqData["gcmToken"] = req.body.gcm_token;
		//console.log(reqData);
		findPatient( reqData["emailId"], reqData["accessToken"], reqData["gcmToken"],function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  });
	})

	app.post("/api/app/gcm", function(req, res){
		var reqData = new Array();
		reqData["emailId"] = req.body.userId;
		reqData["accessToken"] = req.body.access_token;
		reqData["gcmToken"] = req.body.gcm_token;
		reqData["appIdToken"] = req.body.appId_token;
		console.log(reqData);
		updateGcm( reqData["emailId"], reqData["accessToken"], reqData["gcmToken"],function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  });
	})

	app.post("/api/app/patient/usageStats", function(req, res){
		//console.log(req.body);
		var reqData = new Array();
		reqData["emailId"] = req.body.patient.emailId;
		reqData["aiimsId"] = req.body.patient.aiimsId;
		reqData["accessToken"] = req.body.userInfo.access_token;
		reqData["gcmToken"] = req.body.userInfo.gcm_token;
		//reqData["activities"] = req.body.activities;
		reqData["timeMillies"] = req.body.currentTime;
		reqData["usageStats"] = req.body.customUsageStats;
		//reqData["usageStats"].splice(4,160);
		//console.log(reqData["usageStats"]);
		savePatientAppUsage( reqData["emailId"], reqData["aiimsId"], reqData["accessToken"], reqData["gcmToken"],reqData["timeMillies"], reqData["usageStats"], function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  });
	})

	app.post("/api/app/patient/activities", function(req, res){
		var reqData = new Array();
		reqData["emailId"] = req.body.emailId;
		reqData["aiimsId"] = req.body.aiimsId;
		reqData["accessToken"] = req.body.access_token;
		reqData["gcmToken"] = req.body.gcm_token;
		reqData["activities"] = req.body.activities;
		reqData["timeMillies"] = req.body.currentTime;
		//console.log("&&&&&&&&&&&",reqData);
		updatePatientActivities( reqData["emailId"], reqData["aiimsId"], reqData["accessToken"], reqData["gcmToken"], reqData["activities"],reqData["timeMillies"], function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  });
	})

	app.post("/api/app/patient/callLogs", function(req, res){
		var reqData = new Array();
		reqData["emailId"] = req.body.patient.emailId;
		reqData["aiimsId"] = req.body.patient.aiimsId;
		reqData["accessToken"] = req.body.userInfo.access_token;
		reqData["gcmToken"] = req.body.userInfo.gcm_token;
		//reqData["activities"] = req.body.activities;
		reqData["timeMillies"] = req.body.currentTime;
		reqData["callLogData"] = req.body.callLogData;
		//console.log(reqData);
		savePatientcallLogs( reqData["emailId"], reqData["aiimsId"], reqData["accessToken"], reqData["gcmToken"],reqData["timeMillies"], reqData["callLogData"], function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  });
	})


	app.post("/api/app/register", function(req, res){
		var reqData = new Array();
		reqData["appId"] = req.body.appId;
		reqData["emailId"] = req.body.emailId;
		reqData["regToken"] = req.body.regToken;
		reqData["name"] = req.body.name;
		registerUser(reqData["name"], reqData["appId"],reqData["emailId"], reqData["regToken"],function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  });
	})

	app.post("/api/app/register/caregiver", function(req, res){
		var reqData = new Array();
		console.log(req.body);
		reqData["gcmToken"] = req.body.gcm_token;
		reqData["aiimsId"] = req.body.aiimsId;
		registerCaregiver(reqData["gcmToken"], reqData["aiimsId"],function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  });
	})

	app.post("/api/app/caregiver/activities", function(req, res){
		var reqData = new Array();
		reqData["aiimsId"] = req.body.aiimsId;
		reqData["gcmToken"] = req.body.gcm_token;
		reqData["activities"] = req.body.activities;
		reqData["timeMillies"] = req.body.currentTime;
		console.log(reqData);
		updateCaregiverPatientAct(reqData["aiimsId"], reqData["gcmToken"], reqData["activities"],reqData["timeMillies"], function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  });
	})
} 

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

var cronRule = new schedule.RecurrenceRule();
cronRule.minute = 1;
//cronRule.second = 30;
cronRule.hour = 1;
var j = schedule.scheduleJob(cronRule, function(){ //every 3 second - */3 * * * * *, every 1 minute - */1 * * * *, every day at 11:30pm - */30 */23 * * *
	Patient.find({}, function (err, patObjs){
		if(err){
			console.log(err);
		}
		if(patObjs==null)
			console.log("No patients found.");
		else{
			console.log("Number of patients found - ",patObjs.length, ", sending GCM");
			var registrationTokens = new Array();
			for(var i = 0;i<patObjs.length;i++){
				registrationTokens.push(patObjs[i].gcmToken);
			}
			var message = new gcm.Message();
			var d = new Date();
			message.addData('type', 'sendPatientData');
			message.addData('time', d.getTime().toString());
			var sender = new gcm.Sender('AIzaSyBE_xAnxBh2Z22wPU5dPLTrJm7PtWADKVY');
			sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
				if(err) 
					console.error(err);
				else 	
					console.log(response);
			});
		}
	})
});

function updateCaregiverPatientAct(aiimsId, gcmToken, activities,timeMillies,callback){
	var d = new Date(timeMillies);
	var patTime;
	Patient.findOne({"aiimsId":aiimsId}, function (err, patObj){
		if(err){
			console.log("masterCsv not updated.", err);
		}
		if(patObj==null){
			console.log("Patient not found for the given aiimsId, masterCsv not updated.");
		}
			
		else{
			var activityNameObj = {
				Brushing: "caregiverResBrushing", 
				Bathing: "caregiverResBathing", 
				Breakfast: "caregiverResBreakfast",
				Walking: "caregiverResWalking", 
				Yoga: "caregiverResYoga"
			}
			var masterCsvObj = {};
			var basicActivities = Object.keys(activityNameObj);
			for(key in activities){
				if(basicActivities.indexOf(key)>-1){
					masterCsvObj[activityNameObj[key]] = activities[key];
				}
			}
			updateMasterCsv(patObj.emailId, masterCsvObj);
		}
	})

	CaregiverPatActivities.find({aiimsId:aiimsId, timeMillies:{$gt:timeMillies-86400000}}, function (err, patActObjs){
		if (err) {
			console.log(err);
			callback(err,JSON.stringify({response:"error"}));
		} 
		else if (patActObjs.length>=1) {
			var patientActivities;
			patTime = new Date(patActObjs[patActObjs.length-1].timeMillies);
			if(d.getDay()==patTime.getDay()){
				patientActivities = patActObjs[patActObjs.length-1];
				patientActivities.aiimsId = aiimsId;
				patientActivities.timeMillies = d.getTime();
				patientActivities.activities = activities;
			}
			else{
				patientActivities = new CaregiverPatActivities({aiimsId:aiimsId, gcmToken:gcmToken, timeMillies:d.getTime(), activities:activities});	
			}
	      	patientActivities.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		console.log('Caregiver activities- Updated');
		      		callback(null,JSON.stringify({"response":"success"}));
		      	}
	      	});
	  	}	
		else {
			console.log('Caregiver - Patient activity object not found!');
			var patientActivities = new CaregiverPatActivities({aiimsId:aiimsId, gcmToken:gcmToken, timeMillies:d.getTime(), activities:activities});		
			patientActivities.save(function (err, patActObj) {
			 	if (err) {
			    	console.log(err);
			    	callback(err,JSON.stringify({"response":"error"}));
			  	}
			  	else {
			    	console.log('saved successfully caregiver - Patient activity');
			    	callback(null,JSON.stringify({"response":"success"}));
			  	}
			});
		}
	})
}

function registerCaregiver(gcmToken, aiimsId, callback){
	Patient.findOne({"aiimsId":aiimsId}, function (err, patObj){
		if(err){
			console.log(err);
			callback(null,JSON.stringify({"response":"error"}));
		}
		if(patObj==null){
			console.log("Patient not found for the given aiimsId.");
			callback(null,JSON.stringify({"response":"error"}));	
		}
			
		else{
			//console.log("!!!!!!!!!!!!!","\n", gcmToken, "\n", aiimsId)
			patObj.caregivers = new Array(); //This allows only one caregiver at a time
			/*if(patObj.caregivers==null){
				patObj.caregivers = new Array();	
			}*/
			patObj.caregivers.push(gcmToken);
			console.log(patObj);
	      	patObj.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		//console.log('Updated', patObj.id, patObj.emailId);
		      		callback(null,JSON.stringify({"response":"success"}));
		      	}
	      	});
		}
	})
}

function updateMasterCsv(emailId, obj){

	console.log(Object.keys(obj));
	var fieldsChanged = Object.keys(obj);
	var d = new Date();
	console.log(obj)
	MasterCsv.find({emailId:emailId, timeMillies:{$gt:d.getTime()-86400000}}, function (err, masterObj){
		if (err) {
			console.log(err);
		} 
		else if (masterObj.length>=1) {
			var masterCsvObj;
			patTime = new Date(masterObj[masterObj.length-1].timeMillies);
			console.log("2 documents found for past 24hours.")
			console.log(patTime);
			if(d.getDay()==patTime.getDay()){
				masterCsvObj = masterObj[masterObj.length-1];
				masterCsvObj.emailId = emailId;
				for(var i = 0;i<fieldsChanged.length;i++){
					masterCsvObj[fieldsChanged[i]] = obj[fieldsChanged[i]];
				}
				masterCsvObj.timeMillies = d.getTime();
				//masterCsvObj.appUsage = appUsageData;
				console.log("Updating MasterCsv, emailId - ",emailId);
			}
			else{
				masterCsvObj = new MasterCsv({emailId:emailId, aiimsId:"", patientName:"", timeMillies:d.getTime(), alarmStartTime:"",numberOfSteps:"", stepsWaitingTime:"", totalIncoming:0, totalOutgoing:0, brushing: 0, bathing: 0, breakfast: 0,walking: 0, yoga: 0, caregiverResBrushing: 0, caregiverResBathing: 0, caregiverResBreakfast: 0,caregiverResWalking: 0, caregiverResYoga: 0});	
				for(var i = 0;i<fieldsChanged.length;i++){
					masterCsvObj[fieldsChanged[i]] = obj[fieldsChanged[i]];
				}
				console.log("Creating new appUsage data document, emailId - ",emailId);
			}
	      	masterCsvObj.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      	} else {
		      		console.log('masterCsvObj saved successfully.');
		      	}
	      	});
	  	}	
		else {
			console.log('Patient masterCsv object not found!');
			console.log("Creating new masterCsv data document, emailId - ",emailId);
			masterCsvObj = new MasterCsv({emailId:emailId, aiimsId:"", patientName:"", timeMillies:d.getTime(), alarmStartTime:"",numberOfSteps:"", stepsWaitingTime:"", totalIncoming:0, totalOutgoing:0, brushing: 0, bathing: 0, breakfast: 0,walking: 0, yoga: 0, caregiverResBrushing: 0, caregiverResBathing: 0, caregiverResBreakfast: 0,caregiverResWalking: 0, caregiverResYoga: 0});
			for(var i = 0;i<fieldsChanged.length;i++){
				masterCsvObj[fieldsChanged[i]] = obj[fieldsChanged[i]];
			}
			masterCsvObj.save(function (err, patActObj) {
			 	if (err) {
			    	console.log(err);
			  	}
			  	else {
			    	console.log('saved successfully: masterCsvObj');
			  	}
			});
		}	
	})
}

function savePatientAppUsage(emailId, aiimsId, accessToken, gcmToken, timeMillies, appUsageData, callback){
	//console.log(timeMillies);
	var d = new Date(timeMillies);
	//console.log("Save patient appUsage request receiving time - ", d);
	var patTime;
	PatientAppUsage.find({emailId:emailId, timeMillies:{$gt:timeMillies-86400000}}, function (err, patAppUsageObjs){
		if (err) {
			console.log(err);
			callback(err,JSON.stringify({response:"error"}));
		} 
		else if (patAppUsageObjs.length>=1) {
			var i;
			var patientAppUsage;
			patTime = new Date(patAppUsageObjs[patAppUsageObjs.length-1].timeMillies);
			console.log("2 documents found for past 24hours.")
			if(d.getDay()==patTime.getDay()){
				patientAppUsage = patAppUsageObjs[patAppUsageObjs.length-1];
				patientAppUsage.emailId = emailId;
				//patientAppUsage.gcmToken = gcmToken;
				//patientAppUsage.accessToken = accessToken;
				patientAppUsage.timeMillies = d.getTime();
				patientAppUsage.appUsage = appUsageData;
				console.log("Updating patient appUsage data, aiimsId - ",aiimsId);
			}
			else{
				patientAppUsage = new PatientAppUsage({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), appUsage:appUsageData});	
				console.log("Creating new appUsage data document, aiimsId - ",aiimsId);
			}
	      	patientAppUsage.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		console.log('PatientAppUsage saved successfully.');
		      		callback(null,JSON.stringify({"response":"success"}));
		      	}
	      	});
	  	}	
		else {
			console.log('Patient appUsage object not found!');
			console.log("Creating new appUsage data document, aiimsId - ",aiimsId);
			var patientAppUsage = new PatientAppUsage({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), appUsage:appUsageData});		
			patientAppUsage.save(function (err, patActObj) {
			 	if (err) {
			    	console.log(err);
			    	callback(err,JSON.stringify({"response":"error"}));
			  	}
			  	else {
			    	console.log('saved successfully: patientAppUsage');
			    	callback(null,JSON.stringify({"response":"success"}));
			  	}
			});
		}	
	})
}

function savePatientcallLogs(emailId, aiimsId, accessToken, gcmToken, timeMillies, callLogData, callback){
	var d = new Date(timeMillies);
	var patTime;
	PatientCallLogs.find({emailId:emailId, timeMillies:{$gt:timeMillies-86400000}}, function (err, patCallLogObjs){
		if (err) {
			console.log(err);
			callback(err,JSON.stringify({response:"error"}));
		} 
		else if (patCallLogObjs.length>=1) {
			var i;
			var patientCallLogs;
			patTime = new Date(patCallLogObjs[patCallLogObjs.length-1].timeMillies);
			console.log(d.getDay(), patTime.getDay());
			if(d.getDay()==patTime.getDay()){
				console.log("2 documents found for past 24hours.")
				patientCallLogs = patCallLogObjs[patCallLogObjs.length-1];
				patientCallLogs.emailId = emailId;
				//patientCallLogs.gcmToken = gcmToken;
				//patientCallLogs.accessToken = accessToken;
				patientCallLogs.timeMillies = d.getTime();
				patientCallLogs.callLogs = callLogData;
				console.log("Updating patient call logs data, aiimsId - ",aiimsId);
			}
			else{
				console.log("Creating new call logs data document, aiimsId - ",aiimsId);
				patientCallLogs = new PatientCallLogs({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), callLogs:callLogData});	
			}
	      	patientCallLogs.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		console.log('Updated patient call logs');
		      		callback(null,JSON.stringify({"response":"success"}));
		      	}
	      	});
	  	}	
		else {
			console.log('Patient appUsage object not found!');
			console.log("Creating new appUsage data document, aiimsId - ",aiimsId);
			var patientCallLogs = new PatientCallLogs({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), callLogs:callLogData});		
			patientCallLogs.save(function (err, patCallLogObj) {
			 	if (err) {
			    	console.log(err);
			    	callback(err,JSON.stringify({"response":"error"}));
			  	}
			  	else {
			    	console.log('saved successfully patient call logs,');
			    	callback(null,JSON.stringify({"response":"success"}));
			  	}
			});
		}	
	})
}

function updatePatientActivities(emailId, aiimsId, accessToken, gcmToken, activities, timeMillies, callback){
	
	var d = new Date(timeMillies);
	var patTime;
	var patientActivityArr = Object.keys(activities);
	var caregiverGcmArr = new Array();
	for (var i = patientActivityArr.length - 1; i >= 0; i--) {
		if(activities[patientActivityArr[i]]==1){
			caregiverGcmArr.push(patientActivityArr[i]);
		}
	};
	PatientActivities.find({emailId:emailId, timeMillies:{$gt:timeMillies-86400000}}, function (err, patActObjs){
		if (err) {
			console.log(err);
			callback(err,JSON.stringify({response:"error"}));
		} 
		else if (patActObjs.length>=1) {
			
			var i;
			var patientActivities;
			console.log("2 patient activity documents found for the past 24hours.");
			patTime = new Date(patActObjs[patActObjs.length-1].timeMillies);
			if(d.getDay()==patTime.getDay()){
				console.log("Updating patient activity object.");
				patientActivities = patActObjs[patActObjs.length-1];
				patientActivities.emailId = emailId;
				patientActivities.timeMillies = d.getTime();
				patientActivities.activities = activities;
			}
			else{
				console.log("Creating new patient activity object.");
				patientActivities = new PatientActivities({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), activities:activities});	
			}
	      	patientActivities.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		console.log('Saved patient activity document');
		      		callback(null,JSON.stringify({"response":"success"}));
		      	}
	      	});
	  	}	
		else {
			console.log('Patient activity object not found!');
			console.log("Creating new patient activity object.");
			var patientActivities = new PatientActivities({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), activities:activities});		
			patientActivities.save(function (err, patActObj) {
			 	if (err) {
			    	console.log(err);
			    	callback(err,JSON.stringify({"response":"error"}));
			  	}
			  	else {
			    	console.log('Saved patient activity document');
			    	callback(null,JSON.stringify({"response":"success"}));
			  	}
			});
		}
		Patient.findOne({aiimsId: aiimsId}, function (err, patObj) {
			//console.log("********************", patObj, aiimsId);
			if (err) {
				console.log(err);
				//callback(err,JSON.stringify({response:"error"}));
			} 
			else if (patObj) {
				var registrationTokens = patObj.caregivers;
				console.log(registrationTokens);
				var message = new gcm.Message();
				message.addData('activities', caregiverGcmArr);
				console.log("Sending activity updation gcm to caregiver.", caregiverGcmArr);
				var sender = new gcm.Sender('AIzaSyA8IAxu6hYAybpU-3Lmi0OlDqhCu3JJCzE');
				sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
					if(err) 
						console.error(err);
					else 	
						console.log(response);
				});		  	
			}	
			else {
				console.log("Patient not registered, could not send activity updation gcm to caregiver.");
			}
		});
	})

	var activityNameObj = {
		brushing: "brushing", 
		bathing: "bathing", 
		breakfast: "breakfast",
		walking: "walking", 
		yoga: "yoga"
	}
	var masterCsvObj = {};
	var basicActivities = Object.keys(activityNameObj);
	for(key in activities){
		if(basicActivities.indexOf(key)>-1){
			masterCsvObj[activityNameObj[key]] = activities[key];
		}
	}
	//console.log("--------------------",masterCsvObj);
	updateMasterCsv(emailId, masterCsvObj);
}

function updateGcm(emailId, accessToken, gcmToken, callback){
	Patient.findOne({emailId: emailId}, function (err, patObj) {
		if (err) {
			console.log(err);
			callback(err,JSON.stringify({response:"error"}));
		} 
		else if (patObj) {
			console.log('Found:', patObj.id, patObj.emailId);
			patObj.gcmToken = gcmToken;
	      	patObj.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		console.log('Updated', patObj.id, patObj.emailId);
		      		callback(err,JSON.stringify({"response":"success"}));
		      	}
	      	});
	  	}	
		else {
			callback(err,JSON.stringify({"response":"Patient not registered."}));
		}
	});	
}

function findPatient(emailId, accessToken, gcmToken, callback){
	Patient.findOne({emailId: emailId}, function (err, patObj) {
		if (err) {
			console.log(err);
			callback(err,JSON.stringify({response:"error"}));
		} 
		else if (patObj) {
			console.log('Found:', patObj.id, patObj.emailId);
			/*var activities;
			if(!patObj.activities)
				activities = new Array();
			else
				activities = patObj.activities;*/

			var patientData = {
					"aiimsId":patObj.aiimsId,
				 	"emailId":patObj.emailId,
					"patientName":patObj.patientName,
					"self_ph_Number":patObj.selfPhn,
					"caretaker_ph_Number": patObj.caretakerPhn,
					"stepsWaitingTime":patObj.stepsWaitingTime,
					"activities":patObj.activities,
					"numberOfSteps":patObj.numberOfSteps
				};
			if(patObj.alarmStartTime!=-1){
				var d = new Date(Number(patObj.alarmStartTime));
				patientData.alarmStartTime = d.getHours()+":"+d.getMinutes();
			}
			else{
				patientData.alarmStartTime = patObj.alarmStartTime;
			}
			console.log("Patient logged in - \n", patientData);
			//patObj.gcmToken = gcmToken;
			patObj.accessToken = accessToken;
			
	      	patObj.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		//callback(err,JSON.stringify({"response":"error", "newPatient":newPatient}));
		      	} else {
		      		console.log('Updated', patObj.id, patObj.emailId);
		      		//callback(null,JSON.stringify({"response":"success", "newPatient":newPatient}));
		      	}
	      	});
			callback(err,JSON.stringify({"response":"success", "patientData":patientData}));
	  	}	
		else {
			console.log('User not found!');
			var patientData = {
				"aiimsId":"",
			 	"emailId":"",
				"patientName":"",
				"self_ph_Number":"",
				"caretaker_ph_Number": "",
				"activities":[],
				"alarmStartTime":-1,
				"stepsWaitingTime":-1,
				"numberOfSteps":-1
			};
			console.log("Patient logged in - \n", patientData);
			callback(err,JSON.stringify({"response":"success", "patientData":patientData}));
		}
	});	
}

function registerPatient(aiimsId, emailId, patientName, selfPhn, caretakerPhn, accessToken, gcmToken, callback){
	updateMasterCsv(emailId, {emailId:emailId, aiimsId:aiimsId, patientName:patientName});

	Patient.findOne({emailId: emailId}, function (err, patObj) {
		if (err) {
			console.log(err);
			callback(err,JSON.stringify({response:"error", newPatient:0}));
		} 
		else if (patObj) {
			console.log('Found:', patObj.id, patObj.emailId);
			var newPatient = 0;
			if(patObj.aiimsId!=aiimsId){
				newPatient = 1;
				patObj.alarmStartTime = -1;
				patObj.numberOfSteps = -1;
				patObj.stepsWaitingTime = -1;
			}
			patObj.aiimsId = aiimsId;
			patObj.emailId = emailId;
			patObj.patientName = patientName;
			patObj.selfPhn = selfPhn;
			patObj.caretakerPhn = caretakerPhn;
			patObj.gcmToken = gcmToken;
			patObj.accessToken = accessToken;
			
	      	patObj.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error", "newPatient":newPatient}));
		      	} else {
		      		console.log('Updated', patObj.id, patObj.emailId);
		      		callback(null,JSON.stringify({"response":"success", "newPatient":newPatient}));
		      	}
	      	});
	  	}	
		else {
			console.log('User not found!');
			var patient = new Patient({emailId:emailId,	aiimsId:aiimsId, patientName:patientName, caretakerPhn:caretakerPhn,selfPhn:selfPhn, gcmToken:gcmToken, accessToken:accessToken, alarmStartTime:-1, numberOfSteps:-1, stepsWaitingTime:-1});
			patient.save(function (err, patObj) {
			 	if (err) {
			    	console.log(err);
			    	callback(err,JSON.stringify({"response":"error", newPatient:1}));
			  	}
			  	else {
			    	console.log('saved successfully:', patObj.id, patObj.emailId);
			    	callback(null,JSON.stringify({"response":"success", newPatient:1}));
			  	}
			});
		}
	});	
}

function registerUser(name, appId, emailId, regToken, callback){
	//console.log(regToken, emailId);
	var x = 1;
	User.findOne({emailId: emailId}, function (err, userObj) {
		if (err) {
			console.log(err);
			callback(err,JSON.stringify({response:"error"}));
		} 
		else if (userObj) {
			console.log('Found:', userObj.id, userObj.emailId);
			userObj.regToken = regToken;
	      	userObj.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		x=0;
		      		console.log('Updated', userObj.id, userObj.emailId);
		      		callback(null,JSON.stringify({"response":"success"}));
		      	}
	      	});
	  	}	
		else {
			console.log('User not found!');
			var user = new User({name:name, emailId:emailId, appId:appId, regToken: regToken, adminOf:new Array(), subscriptions:new Array()});		
			user.save(function (err, userObj) {
			 	if (err) {
			    	console.log(err);
			    	callback(err,JSON.stringify({"response":"error"}));
			  	}
			  	else {
			    	console.log('saved successfully:', userObj.id, userObj.emailId);
			    	callback(null,JSON.stringify({"response":"success"}));
			  	}
			});
		}
	});
};