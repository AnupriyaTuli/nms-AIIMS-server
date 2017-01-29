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


var hindiToEnglish = {
	"सुबह की सैर":"walking",
	"नहाना":"bathing",
	"सुबह का नाश्ता":"breakfast",
	"ब्रश करना":"brushing",
	"सुबह की सैर (सेंसर)":"walking_sensor",
	"ड्रेसिंग":"dressing",
	"शौच उपयोग":"toileting",
	"घूमना":"transferring",
	"संयम":"continence",
	"दोपहर का भोजन":"lunch",
	"रात का खाना":"dinner",
	"कपड़े धोने":"washing",
	"व्यायाम":"exercise",
	"वार्ड गतिविधि भागीदारी":"ward_Participation"
}

var englishToHindi = {
	yoga:"योग",
	walking:"सुबह की सैर",
	bathing:"नहाना",
	breakfast:"सुबह का नाश्ता",
	brushing:"ब्रश करना",
	walking_sensor:"सुबह की सैर (सेंसर)",
	dressing:"ड्रेसिंग",
	toileting:"शौच उपयोग",
	transferring:"घूमना",
	continence:"संयम",
	lunch:"दोपहर का भोजन",
	dinner:"रात का खाना",
	washing:"कपड़े धोने",
	exercise:"व्यायाम",
	ward_Participation:"वार्ड गतिविधि भागीदारी"
}


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
		//reqData["timeMillies"] = req.body.currentTime;
		reqData["usageStats"] = req.body.customUsageStats;
		reqData["lastTime"] = req.body.latestData;
		//reqData["usageStats"].splice(4,160);
		//console.log(reqData["usageStats"]);
		savePatientAppUsage( reqData["emailId"], reqData["aiimsId"], reqData["accessToken"], reqData["gcmToken"], reqData["usageStats"], reqData["lastTime"], function(err, result) {
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
		//reqData["activities"] = req.body.activities;
		reqData["timeMillies"] = req.body.currentTime;
		//var basicActivities = Object.keys(req.body.activities);
		var toEnglish = {};
		var eachDayActvities = req.body.eachDayActvities;
		for (var i = 0; i < eachDayActvities.length; i++) {
			for(key in req.body.activities){		//currentTime, activities
				if(hindiToEnglish[key]){
					toEnglish[hindiToEnglish[key]] = req.body.activities[key];	
				}
				else{
					toEnglish[key] = req.body.activities[key];		
				}
			}	
		}
		
		reqData["activities"] = toEnglish;
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
		//reqData["timeMillies"] = req.body.currentTime;
		reqData["callLogData"] = req.body.eachDayCallLog;
		//console.log(reqData);
		savePatientcallLogs( reqData["emailId"], reqData["aiimsId"], reqData["accessToken"], reqData["gcmToken"], reqData["callLogData"], function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  });
	})

	app.post("/api/app/patient/dataDates", function(req, res){
		var reqData = new Array();
		var aiimsId = req.body.aiimsId;

		sendLastDataDates(aiimsId, function(err, result) {
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

	app.post("/api/app/caregiver/patientAlert", function(req, res){
		var reqData = new Array();
		console.log(req.body);
		reqData["gcmToken"] = req.body.gcm_token;
		reqData["aiimsId"] = req.body.aiimsId;
		caregiverPatientAlert(reqData["aiimsId"], reqData["gcmToken"],function(err, result) {
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
		var toEnglish = {};
		for(key in req.body.activities){
			toEnglish[hindiToEnglish[key]] = req.body.activities[key];
		}

		reqData["activities"] = toEnglish;
		//reqData["activities"] = req.body.activities;
		reqData["timeMillies"] = req.body.currentTime;
		var d = new Date(req.body.currentTime);
		console.log(d, reqData);
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

var sendLastDataDates = function(aiimsId, callback){
	Patient.findOne({aiimsId: aiimsId}, function (err, patObj) {
		if (err) {
			console.log(err);
			callback(null,JSON.stringify({"response":"error"}));
		}
		else if (patObj) {
			callback(null,JSON.stringify({"response":"success", "callLogsDate":patObj.lastCallLogsTime, "dailyActivitiesDate":patObj.lastActivitiesTime, "appsUsageDate":patObj.lastAppUsageTime}));
		}	
		else {
			callback(null,JSON.stringify({"response":"error"}));
			console.log("Patient not registered, could not send last data dates.");
		}
	});
}

var getLastAppUTime = function(){
	/*DeviceData.find({timeStamp:{"$gte": startTime}, location:location, deviceId:deviceId},	//all three should match
		null, // Columns to Return
		{
		    sort:{
		        timeStamp: 1 //Sort by Date Added DESC
		    }
		},
		function(err,data){
			var returnObj = {
				pm:new Array(),
				ozone:new Array(),
				nitDioxide:new Array(),
				carbonMono:new Array(),
				aqi:new Array()
			}
			var pm, ozone, nitDioxide, carbonMono, aqi, count;
			pm=ozone=nitDioxide=carbonMono=aqi=count=0;
			var currentTime = startTime.getTime();
			for (var i = 0; i < data.length; i++) {
				while(data.timeStamp.getTime() <= currentTime+step){
					pm+=data[i].pm;
					ozone+=data[i].ozone;
					nitDioxide+=data[i].nitDioxide;
					carbonMono+=data[i].carbonMono;
					aqi+=data[i].aqi;
					count++;
				}
				returnObj.pm.push(pm/count);
				returnObj.ozone.push(ozone/count);
				returnObj.nitDioxide.push(nitDioxide/count);
				returnObj.carbonMono.push(carbonMono/count);
				returnObj.aqi.push(aqi/count);
				currentTime+=step;
				pm=ozone=nitDioxide=carbonMono=aqi=count=0;
			};
			callback(JSON.stringify({"gasData":returnObj}));
		}
	)*/
}


var notificationTest = function(){
	Patient.find({"aiimsId" : "101178716"}, function (err, patObjs){
		var date = new Date();
		if(err){
			console.log(err);
		}
		if(patObjs==null)
			console.log("No patients found, not sending daily update gcm. ", date);
		else{
			console.log("Number of patients found - ",patObjs.length, ", sending daily update GCM, ", date);
			var registrationTokens = new Array();
			var caregiverRegTokens = new Array();
			for(var i = 0;i<patObjs.length;i++){
				for(var j=0;j<patObjs[i].caregivers.length;j++){
					caregiverRegTokens.push(patObjs[i].caregivers[j]);
				}
				registrationTokens.push(patObjs[i].gcmToken);
			}
			var testDate = new Date();
			//var startDate = testDate.getTime();
			var startDate = testDate.getTime() - 8*86400000;
			for (var i = 5; i >= 0; i--) {
				var message = new gcm.Message();
				var d = new Date(startDate);
				console.log("REQUEST DATE - ",d)
				message.addData('type', 'sendPatientData');
				message.addData('time', d.getTime().toString());
				var sender = new gcm.Sender('AIzaSyBE_xAnxBh2Z22wPU5dPLTrJm7PtWADKVY');
				sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
					if(err) 
						console.error(err);
					else 	
						console.log(response);
				});
				/*var caregiverMessage = new gcm.Message();
				caregiverMessage.addData('type',"sendPatientData");
				caregiverMessage.addData('time', d.getTime().toString());
				var caregiverSender = new gcm.Sender('AIzaSyAEFlaLt2tmQjLJerzJ1NFpwO2v4nQMKHk');
				caregiverSender.send(caregiverMessage, { registrationTokens: caregiverRegTokens }, function (err, response) {
					if(err) 
						console.error(err);
					else 	
						console.log(response);
				});	*/
				startDate = startDate - 86400000;
			}
			
		}
	})
}

//notificationTest();

var testVar = new Date();
testVar2 = testVar.getTime();
var cronRule = new schedule.RecurrenceRule();
cronRule.minute = 44;
//cronRule.second = 2;
cronRule.hour = 23;
var j = schedule.scheduleJob(cronRule, function(){ //every 3 second - */3 * * * * *, every 1 minute - */1 * * * *, every day at 11:30pm - */30 */23 * * *
	Patient.find({"aiimsId" : "100819515"}, function (err, patObjs){
		var date = new Date();
		if(err){
			console.log(err);
		}
		if(patObjs==null)
			console.log("No patients found, not sending daily update gcm. ", date);
		else{
			console.log("Number of patients found - ",patObjs.length, ", sending daily update GCM, ", date);
			var registrationTokens = new Array();
			var caregiverRegTokens = new Array();
			for(var i = 0;i<patObjs.length;i++){
				for(var j=0;j<patObjs[i].caregivers.length;j++){
					caregiverRegTokens.push(patObjs[i].caregivers[j]);
				}
				registrationTokens.push(patObjs[i].gcmToken);
			}
			var message = new gcm.Message();
			//var d = new Date(testVar-86400000);
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
			/*var caregiverMessage = new gcm.Message();
			caregiverMessage.addData('type',"sendPatientData");
			caregiverMessage.addData('time', d.getTime().toString());
			var caregiverSender = new gcm.Sender('AIzaSyAEFlaLt2tmQjLJerzJ1NFpwO2v4nQMKHk');
			caregiverSender.send(caregiverMessage, { registrationTokens: caregiverRegTokens }, function (err, response) {
				if(err) 
					console.error(err);
				else 	
					console.log(response);
			});*/
		}
	})
});



function caregiverPatientAlert(aiimsId, gcmToken, callback){
	Patient.findOne({aiimsId: aiimsId}, function (err, patObj) {
		if (err) {
			console.log(err);
		} 
		else if (patObj) {
			var registrationTokens = patObj.caregivers;
			var message = new gcm.Message();
			var d = new Date();
			message.addData('type', "patientAlert");
			message.addData('time', d.getTime().toString());
			console.log("Sending patient alert to caregiver.");
			//var sender = new gcm.Sender('AIzaSyA8IAxu6hYAybpU-3Lmi0OlDqhCu3JJCzE');
			var sender = new gcm.Sender('AIzaSyAEFlaLt2tmQjLJerzJ1NFpwO2v4nQMKHk');
			sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
				if(err) 
					console.error(err);
				else 	
					console.log(response);
			});
		}	
		else {
			console.log("Patient not registered, could not send patient alert gcm to caregiver.");
		}
	});
}

function updateCaregiverPatientAct(aiimsId, gcmToken, activities,timeMillies,callback){
	var d = new Date(timeMillies);
	var patTime;
	
	var caregiverActBatch = new Array();
	for (var i = 0; i < activitiesData.length; i++) {
		var patientActivities = new CaregiverPatActivities({aiimsId:aiimsId, gcmToken:gcmToken, timeMillies:activitiesData[i].timeStmp, activities:activitiesData[i].data});
		caregiverActBatch.push(patientActivities)
	}

	CaregiverPatActivities.collection.insert(caregiverActBatch, onInsert);

	function onInsert(err, docs) {
	    if (err) {
	    	console.log(err)
	    } else {
	        console.info('%d caregiver activities documents were successfully stored.', docs.length);
	    }
	}

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

	/*Patient.findOne({"aiimsId":aiimsId}, function (err, patObj){
		if(err){
			console.log("masterCsv not updated.", err);
		}
		if(patObj==null){
			console.log("Patient not found for the given aiimsId, masterCsv not updated.");
		}
			
		else{
			var activityNameObj = {
				brushing: "caregiverResBrushing",
				bathing: "caregiverResBathing",
				breakfast: "caregiverResBreakfast",
				walking: "caregiverResWalking", 
				yoga: "caregiverResYoga"
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
	})*/
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
		else if(gcmToken==-1){
			console.log("Caregiver gcm token not provided.");
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
			var alarmTime = "-1";
			if(patObj.alarmStartTime){
				var d = new Date(Number(patObj.alarmStartTime) + 1800000);
				alarmTime = d.getHours()+":"+d.getMinutes();	
			}
			var hindiWords = new Array();
			for(var i=0;i<patObj.activities.length;i++){
				if(englishToHindi[patObj.activities[i]]){
					hindiWords.push(englishToHindi[patObj.activities[i]]);	
				}
				else{
					hindiWords.push(patObj.activities[i]);	
				}
			}
			hindiWords.push(englishToHindi["walking"]);
	      	patObj.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		//console.log('Updated', patObj.id, patObj.emailId);
		      		callback(null,JSON.stringify({"response":"success", "alarmTime":alarmTime, "activities":hindiWords}));
		      	}
	      	});
		}
	})
}

function updateMasterCsv(emailId, obj){

	//console.log(Object.keys(obj));
	var fieldsChanged = Object.keys(obj);
	var d = new Date();
	//console.log(obj)
	MasterCsv.find({emailId:emailId, timeMillies:{$gt:d.getTime()-86400000}}, function (err, masterObj){
		if (err) {
			console.log(err);
		} 
		else if (masterObj.length>=1) {
			var masterCsvObj;
			patTime = new Date(masterObj[masterObj.length-1].timeMillies);
			console.log("2 mastercsv documents found for past 24hours for - ", emailId);
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
				console.log("Creating new mastercsv data document, emailId - ",emailId);
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

function savePatientAppUsage(emailId, aiimsId, accessToken, gcmToken, appUsageData, lastTime, callback){
	
	var d = new Date(timeMillies);
	
	var patTime;
	console.log("APP USAGE DATA", d,appUsageData);
	var appUsageBatch = new Array();
	for (var i = 0; i < appUsageData.length; i++) {
		var patientAppUsage = new PatientAppUsage({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:appUsageData[i].timeInMillis, appUsage:appUsageData[i].appsUsage});	
		appUsageBatch.push(patientAppUsage)
	}

	PatientAppUsage.collection.insert(appUsageBatch, onInsert);

	function onInsert(err, docs) {
	    if (err) {
	    	console.log(err)
	    	callback(null,JSON.stringify({"response":"error"}));
	    } else {
	        console.info('%d appUsage documents were successfully stored.', docs.length);
	        Patient.findOne({aiimsId: aiimsId}, function (err, patObj) {
	        	if (err) {
	        		console.log(err);
	        		callback(null,JSON.stringify({"response":"error"}));
	        	} 
	        	else if (patObj) {
	        		patObj.lastAppUsageTime = lastTime;
	              	patObj.save(function (err) {
	        	      	if (err) {
	        	      		console.log(err);
	        	      		callback(err,JSON.stringify({"response":"error"}));
	        	      	} else {
	        	      		console.log('Updated', patObj.id, patObj.emailId);
	        	      		callback(null,JSON.stringify({"response":"success"}));
	        	      	}
	              	});
	          	}	
	        	else {
	        		console.log('User not found!');
	        		callback(null,JSON.stringify({"response":"error"}));
	        	}
	        });	
	    }
	}

	


	/*PatientAppUsage.find({emailId:emailId, timeMillies:{$gt:timeMillies-86400000}}, function (err, patAppUsageObjs){
		if (err) {
			console.log(err);
			callback(err,JSON.stringify({response:"error"}));
		} 
		else if(appUsageData.length<=0){
			console.log("No appUsage data in the request.", appUsageData, d);
			callback(null,JSON.stringify({"response":"success"}));
		}
		else if (patAppUsageObjs.length>=1) {
			var i;
			var patientAppUsage;
			patTime = new Date(patAppUsageObjs[patAppUsageObjs.length-1].timeMillies);

			console.log("2 appusage documents found for past 24hours, aiimsId - ", aiimsId, timeMillies);
			if(d.getDay()==patTime.getDay()){
				patientAppUsage = patAppUsageObjs[patAppUsageObjs.length-1];
				patientAppUsage.emailId = emailId;
				//patientAppUsage.gcmToken = gcmToken;
				//patientAppUsage.accessToken = accessToken;
				patientAppUsage.timeMillies = d.getTime();

				
				patientAppUsage.appUsage = appUsageData;
				console.log("Updating patient appUsage data, aiimsId - ",aiimsId, timeMillies);
			}
			else{
				patientAppUsage = new PatientAppUsage({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), appUsage:appUsageData});	
				console.log("Creating new appUsage data document, aiimsId - ",aiimsId, timeMillies);
			}
			console.log("APP USAGE DATA", d,appUsageData);
	      	patientAppUsage.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		console.log('PatientAppUsage saved successfully, aiimsId - ', aiimsId, timeMillies);
		      		callback(null,JSON.stringify({"response":"success"}));
		      	}
	      	});
	  	}	
		else {
			//console.log('Patient appUsage object not found!, aiimsId - ', aiimsId);
			console.log("Creating new appUsage data document, aiimsId - ",aiimsId, timeMillies);
			var patientAppUsage = new PatientAppUsage({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), appUsage:appUsageData});		
			patientAppUsage.save(function (err, patActObj) {
			 	if (err) {
			    	console.log(err);
			    	callback(err,JSON.stringify({"response":"error"}));
			  	}
			  	else {
			    	console.log('saved successfully: patientAppUsage, aiimsId - ', aiimsId, timeMillies);
			    	callback(null,JSON.stringify({"response":"success"}));
			  	}
			});
		}	
	})*/
}

function savePatientcallLogs(emailId, aiimsId, accessToken, gcmToken, callLogData, callback){
	var d = new Date(timeMillies);
	var patTime;

	var callLogBatch = new Array();
	for (var i = 0; i < callLogData.length; i++) {
		var patientCallLogs = new PatientCallLogs({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:callLogData[i].timeInMillis, callLogs:callLogData[i].callLog});
		callLogBatch.push(patientCallLogs)
	}

	PatientCallLogs.collection.insert(callLogBatch, onInsert);

	function onInsert(err, docs) {
	    if (err) {
	    	console.log(err)
	    	callback(null,JSON.stringify({"response":"error"}));
	    } else {
	        console.info('%d callLogs documents were successfully stored.', docs.length);
	        Patient.findOne({aiimsId: aiimsId}, function (err, patObj) {
	        	if (err) {
	        		console.log(err);
	        		callback(null,JSON.stringify({"response":"error"}));
	        	} 
	        	else if (patObj) {
	        		patObj.lastCallLogsTime = lastTime;
	              	patObj.save(function (err) {
	        	      	if (err) {
	        	      		console.log(err);
	        	      		callback(err,JSON.stringify({"response":"error"}));
	        	      	} else {
	        	      		console.log('Updated', patObj.id, patObj.emailId);
	        	      		callback(null,JSON.stringify({"response":"success"}));
	        	      	}
	              	});
	          	}	
	        	else {
	        		console.log('User not found!');
	        		callback(null,JSON.stringify({"response":"error"}));
	        	}
	        });	
	    }
	}
	/*console.log("CCCCCCCCCCCCCCCCCCC", callLogData);
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
				console.log("2 callLogs documents found for past 24hours, aiimsId - ", aiimsId, timeMillies)
				patientCallLogs = patCallLogObjs[patCallLogObjs.length-1];
				patientCallLogs.emailId = emailId;
				//patientCallLogs.gcmToken = gcmToken;
				//patientCallLogs.accessToken = accessToken;
				patientCallLogs.timeMillies = d.getTime();
				patientCallLogs.callLogs = callLogData;
				console.log("Updating patient call logs data, aiimsId - ", aiimsId, timeMillies);
			}
			else{
				console.log("Creating new call logs data document, aiimsId - ", aiimsId, timeMillies);
				patientCallLogs = new PatientCallLogs({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), callLogs:callLogData});	
			}
	      	patientCallLogs.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		console.log("Updated patient call logs, aiimsId - ", aiimsId, timeMillies);
		      		callback(null,JSON.stringify({"response":"success"}));
		      	}
	      	});
	  	}	
		else {
			console.log('Patient callLogs object not found!');
			console.log("Creating new callLogs data document, aiimsId - ", aiimsId, timeMillies);
			var patientCallLogs = new PatientCallLogs({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), callLogs:callLogData});		
			patientCallLogs.save(function (err, patCallLogObj) {
			 	if (err) {
			    	console.log(err);
			    	callback(err,JSON.stringify({"response":"error"}));
			  	}
			  	else {
			    	console.log("saved successfully patient call logs, aiimsId - ", aiimsId, timeMillies);
			    	callback(null,JSON.stringify({"response":"success"}));
			  	}
			});
		}	
	})*/
}

function updatePatientActivities(emailId, aiimsId, accessToken, gcmToken, activities, timeMillies, callback){
	
	var d = new Date(timeMillies);
	var patTime;
	var patientActivityArr = Object.keys(activities);
	var caregiverGcmArr = new Array();
	//console.log("PATIENT-ACTIVITIES", d, activities);
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
			console.log("2 patient activity documents found for the past 24hours, aiimsId - ", aiimsId, d);
			patTime = new Date(patActObjs[patActObjs.length-1].timeMillies);
			if(d.getDay()==patTime.getDay()){
				console.log("Updating patient activity object, aiimsId - ", aiimsId, d);
				patientActivities = patActObjs[patActObjs.length-1];
				patientActivities.emailId = emailId;
				patientActivities.timeMillies = d.getTime();
				patientActivities.activities = activities;
			}
			else{
				console.log("Creating new patient activity object, aiimsId - ", aiimsId, d);
				patientActivities = new PatientActivities({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), activities:activities});	
			}
	      	patientActivities.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		console.log("Saved patient activity document, aiimsId - ", aiimsId, d);
		      		callback(null,JSON.stringify({"response":"success"}));
		      	}
	      	});
	  	}	
		else {
			console.log("Patient activity object not found!, aiimsId - ", aiimsId, d);
			console.log("Creating new patient activity object, aiimsId - ", aiimsId, d);
			var patientActivities = new PatientActivities({emailId:emailId,	aiimsId:aiimsId, gcmToken:gcmToken, accessToken:accessToken, timeMillies:d.getTime(), activities:activities});		
			patientActivities.save(function (err, patActObj) {
			 	if (err) {
			    	console.log(err);
			    	callback(err,JSON.stringify({"response":"error"}));
			  	}
			  	else {
			    	console.log("Saved patient activity document, aiimsId - ", aiimsId, d);
			    	callback(null,JSON.stringify({"response":"success"}));
			  	}
			});
		}
		/*Patient.findOne({aiimsId: aiimsId}, function (err, patObj) {
			//console.log("********************", patObj, aiimsId);
			if (err) {
				console.log(err);
				//callback(err,JSON.stringify({response:"error"}));
			} 
			else if (patObj) {
				var registrationTokens = patObj.caregivers;
				console.log(registrationTokens);
				var message = new gcm.Message();
				var hindiWords = [];
				for(var i=0;i<caregiverGcmArr.length;i++){
					if(englishToHindi[caregiverGcmArr[i]]){
						hindiWords.push(englishToHindi[caregiverGcmArr[i]]);	
					}
					else{
						hindiWords.push(caregiverGcmArr[i]);	
					}
				}
				message.addData('activities', hindiWords.join(":"));
				console.log("Sending activity updation gcm to caregiver.", caregiverGcmArr);
				var sender = new gcm.Sender('AIzaSyAEFlaLt2tmQjLJerzJ1NFpwO2v4nQMKHk');
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
		});*/
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
			masterCsvObj[key] = activities[key];
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
			var hindiWords = [];
			for(var i=0;i<patObj.activities.length;i++){
				hindiWords.push(englishToHindi[patObj.activities[i]]);
			}
			hindiWords.push(englishToHindi["walking"]);
			var patientData = {
					"aiimsId":patObj.aiimsId,
				 	"emailId":patObj.emailId,
					"patientName":patObj.patientName,
					"self_ph_Number":patObj.selfPhn,
					"caretaker_ph_Number": patObj.caretakerPhn,
					"stepsWaitingTime":patObj.stepsWaitingTime,
					"activities":hindiWords,
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
	//updateMasterCsv(emailId, {emailId:emailId, aiimsId:aiimsId, patientName:patientName});
	var d = new Date();
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
			patObj.lastAppUsageTime = d.getTime();
			patObj.lastCallLogsTime = d.getTime();
			patObj.lastActivitiesTime = d.getTime();
			
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
			var patient = new Patient({emailId:emailId,	aiimsId:aiimsId, patientName:patientName, caretakerPhn:caretakerPhn,selfPhn:selfPhn, gcmToken:gcmToken, accessToken:accessToken, alarmStartTime:-1, numberOfSteps:-1, stepsWaitingTime:-1,
				lastAppUsageTime:d.getTime(), lastCallLogsTime:d.getTime(), lastActivitiesTime:d.getTime()});
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