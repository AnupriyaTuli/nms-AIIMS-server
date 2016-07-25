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

module.exports = function(app,passport){
	app.get('/', isLoggedIn, function(req,res){
		if(req.user.local.username=="admin"){
			getAllDoctors(req.user, function(err, doctorsList) {
			    res.render('admin.ejs', {user:req.user, doctorsList:doctorsList});
			  })
		}
		else{
			getAllotedPatients(req.user, function(err, currentPatients) {
			    res.render('profile.ejs', {user:req.user, currentPatients:currentPatients});
			  })	
		}
	})

	app.get('/login',function(req,res){
		if(req.isAuthenticated()){
			if(req.user.local.username=="admin"){
				getAllDoctors(req.user, function(err, doctorsList) {
				    res.render('admin.ejs', {user:req.user, doctorsList:doctorsList});
				  })
			}
			else{
				getAllotedPatients(req.user, function(err, currentPatients) {
				    res.render('profile.ejs', {user:req.user, currentPatients:currentPatients});
				  })	
			}
		}
		else
			res.render('login.ejs',{message:req.flash('loginMessage')});
	});

	app.post('/login', passport.authenticate('local-login',{
		successRedirect:'/profile',
		failureRedirect:'/login',
		failureFlash:true
	}));

	app.get('/logout',function(req,res){
		req.logout();
		res.redirect('/');
	})

	app.post('/signup',isLoggedIn, passport.authenticate('local-signup', {
		successRedirect:'/profile',
		failureRedirect:'/signup',
		session: false,
		failureFlash:true
	}));

	app.get('/profile',isLoggedIn, function(req,res){
		if(req.user.local.username=="admin"){
			getAllDoctors(req.user, function(err, doctorsList) {
			    res.render('admin.ejs', {user:req.user, doctorsList:doctorsList});
			  })
		}
		else{
			getAllotedPatients(req.user, function(err, currentPatients) {
			    res.render('profile.ejs', {user:req.user, currentPatients:currentPatients});
			  })	
		}
	})

	app.get('/patientProfile/:patId',isLoggedIn, function(req,res){
		console.log("____________________________");
		Patient.findOne({"_id":req.params.patId}, function (err, patObj){
			if(err){
				console.log(err);
				res.render('patientProfile.ejs', {user:req.user, patient:null});
			}
			if(patObj==null)
				res.render('patientProfile.ejs', {user:req.user, patient:null});
			else{
				res.render('patientProfile.ejs', {user:req.user, patient:patObj});
			}
		})
	})

	app.get('/patientProfile/:patId/downloadCallog',isLoggedIn, function(req,res){
		sendCallLogCSV(req.params.patId, function(err, fileName) {
			if(fileName!=null){
				//var file = 'D://College//summer 2016//aiims project//server//' + fileName;
				var file = process.cwd() + '\\' + fileName;
				console.log(file);
				res.download(file); // Set disposition and send it.
			}
			else{
				res.render('noData.ejs', {});
			}
		    
		  })
	})

	app.get('/patientProfile/:patId/downloadAppUsage',isLoggedIn, function(req,res){
		sendAppUsageCSV(req.params.patId, function(err, fileName) {
			if(fileName!=null){
				var file = process.cwd() + '\\' + fileName;
				console.log(file);
				res.download(file); // Set disposition and send it.
			}
			else{
				res.render('noData.ejs', {});
			}
		    
		  })
	})

	app.get('/addAlarm/:patId',isLoggedIn, function(req,res){

		Patient.findOne({"_id":req.params.patId}, function (err, patObj){
			if(err){
				console.log(err);
				res.render('patientAlarm.ejs', {user:req.user, patient:null});
			}
			if(patObj==null)
				res.render('patientAlarm.ejs', {user:req.user, patient:null});
			else{
				res.render('patientAlarm.ejs', {user:req.user, patient:patObj});
			}
		})
	})

	app.post('/addAlarm',isLoggedIn, function(req,res){
		console.log(req.body.patId, req.body.alarmTime, req.body.numberOfSteps, req.body.stepsWaitingTime);

		setPatientAlarm(req.body.patId, req.body.alarmTime, req.body.numberOfSteps, req.body.stepsWaitingTime, function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  })
	})

	app.post('/setActivities',isLoggedIn, function(req,res){
		console.log(req.body.patId, req.body.activities);

		setPatientActivities(req.body.patId, req.body.activities, function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  })
	})

	app.get('/addPatient',isLoggedIn, function(req,res){
		getPatients(req.user,function(err, patients) {
			res.render('addPatient.ejs', {user:req.user, patients:patients});    
		  });
	})

	app.post("/addPatient", isLoggedIn, function(req, res){
		console.log(req.body.patId);
		addPatient(req.body.patId, req.user, function(err, result) {
		    res.writeHead(200, {
		      'Content-Type' : 'x-application/json'
		    });
		    res.end(result);
		  })
	})

	app.get('/addDoctor',isLoggedIn, function(req,res){
		res.render('signup.ejs',{message:req.flash('signupMessage')});
	})

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
} 

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

function setPatientActivities(patId, activities, callback){
	Patient.findOne({ "_id": patId }, function (err, patObj){
		if(err){
			console.log(err);
			callback(err, JSON.stringify({response:"error"}));
		}
		if(patObj==null)
			callback(null, JSON.stringify({response:"error"}));
		else{
			console.log("Setting patient activities.");
			patObj.activities = activities;

			var registrationTokens = new Array();
			registrationTokens.push(patObj.gcmToken);
			var message = new gcm.Message();
			console.log("Activities updated: ", activities , " sending notification.");
			message.addData('activities', activities.join(':'));
			message.addData('type', 'activities');
			var sender = new gcm.Sender('AIzaSyBE_xAnxBh2Z22wPU5dPLTrJm7PtWADKVY');
			sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
				if(err) 
					console.error(err);
				else 	
					console.log(response);
			});

			patObj.save(function (err, patObj2) {
			 	if (err) {
			    	console.log(err);
			    	callback(err,JSON.stringify({"response":"error"}));
			  	}
			  	else {
			  		console.log("-------------------",patObj2.activities);
			    	callback(null,JSON.stringify({"response":"success"}));
			  	}
			});
		}
	})
}

function sendCallLogCSV(patId, callback){	
	Patient.findOne({"_id":patId}, function (err, patObj){
		if(err){
			console.log(err);
			callback(null,null);
		}
		if(patObj==null)
			callback(null,null);
		else{
			PatientCallLogs.find({"emailId":patObj.emailId, "aiimsId":patObj.aiimsId}, function(err, callLogObjs){
				if(err){
					console.log(err);
					callback(null,null);
				}
				else if(callLogObjs.length<=0)
					callback(null,null);
				else{
					//console.log(callLogObjs);
					var callLogData = new Array();
					var fields = ['emailId', 'aiimsId', 'time', 'number', 'duration', 'date', 'callType'];
					var fieldNames = ['EmailId', 'AiimsId', 'Date of Record', 'Number', 'Duration', 'Time of Call', 'Call Type'];
					for (var i = 0 ; i < callLogObjs.length; i++) {
						var temp = callLogObjs[i].callLogs;
						var d = new Date(callLogObjs[i].timeMillies);
						var tempDate;
						for(var j=0;j<temp.length;j++){
						  	temp[j].emailId = callLogObjs[i].emailId;
						  	temp[j].aiimsId = callLogObjs[i].aiimsId;
						  	tempDate = new Date(Number(temp[j].date));
						  	temp[j].time = d;
						  	temp[j].date = tempDate;
						  	callLogData.push(temp[j]);
						}
					};
					json2csv({ data: callLogData, fields: fields , fieldNames:fieldNames }, function(err, csv) {
						if (err){
							console.log(err);
							callback(null,null);	
						}
						else{
							fs.writeFile('file.csv', csv, function(err) {
							  	if (err) 
							  		throw err;
							  	console.log('file saved');
							  	callback(null,"file.csv");
							});
						}  
					});
				}
			})
			//res.render('patientProfile.ejs', {user:req.user, patient:patObj});
		}
	})
}

function sendAppUsageCSV(patId, callback){	
	Patient.findOne({"_id":patId}, function (err, patObj){
		if(err){
			console.log(err);
			callback(null,null);
		}
		if(patObj==null)
			callback(null,null);
		else{
			PatientAppUsage.find({"emailId":patObj.emailId, "aiimsId":patObj.aiimsId}, function(err, appUsageObjs){
				if(err){
					console.log(err);
					callback(null,null);
				}
				else if(appUsageObjs.length<=0)
					callback(null,null);
				else{
					//console.log(appUsageObjs);
					var appUsageData = new Array();
					var fields = ['emailId', 'aiimsId', 'time', 'mPackageName', 'mLaunchCount', 'mTotalTimeInForeground',];
					var fieldNames = ['EmailId', 'AiimsId', 'Date of Record', 'Name of Application', 'Number of Launches', 'Total Time Used']
					for (var i = 0 ; i < appUsageObjs.length; i++) {
						var temp = appUsageObjs[i].appUsage;
						var d = new Date(Number(appUsageObjs[i].timeMillies));
						//console.log("@@@@@@@@@",d);
						for(var j=0;j<temp.length;j++){
						  	temp[j].emailId = appUsageObjs[i].emailId;
						  	temp[j].aiimsId = appUsageObjs[i].aiimsId;
						  	temp[j].time = d;
						  	appUsageData.push(temp[j]);
						}
					};
					console.log(appUsageData);
					json2csv({ data: appUsageData, fields: fields , fieldNames:fieldNames }, function(err, csv) {
						if (err){
							console.log(err);
							callback(null,null);	
						}
						else{
							fs.writeFile('file.csv', csv, function(err) {
							  	if (err) 
							  		throw err;
							  	console.log('file saved');
							  	callback(null,"file.csv");
							});
						}  
					});
				}
			})
			//res.render('patientProfile.ejs', {user:req.user, patient:patObj});
		}
	})
}

function updateMasterCsv(emailId, obj){
	console.log(Object.keys(obj));
	var fieldsChanged = Object.keys(obj);
	var d = new Date();
	MasterCsv.find({emailId:emailId, timeMillies:{$gt:d.getTime()-86400000}}, function (err, masterObj){
		if (err) {
			console.log(err);
		} 
		else if (masterObj.length>=1) {
			var masterCsvObj;
			patTime = new Date(masterObj[masterObj.length-1].timeMillies);
			console.log("2 documents found for past 24hours.")
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

function setPatientAlarm(patId, alarmTime, numberOfSteps, stepsWaitingTime, callback){
	Patient.findOne({ "_id": patId }, function (err, patObj){
		if(err){
			console.log(err);
			callback(err, JSON.stringify({response:"error"}));
		}
		if(patObj==null)
			callback(null, JSON.stringify({response:"error"}));
		else{
			updateMasterCsv(patId.emailId, {
				alarmStartTime:alarmTime,
				numberOfSteps:numberOfSteps,
				stepsWaitingTime:stepsWaitingTime
			});
			console.log("Setting patient alarm.");
			var temp = new Date(alarmTime);
			//console.log(temp);
			//console.log(patId, alarmTime, numberOfSteps, stepsWaitingTime);
			patObj.alarmStartTime = temp.getTime();
			patObj.numberOfSteps = numberOfSteps;
			patObj.stepsWaitingTime = stepsWaitingTime;
			patObj.save(function (err, patObj2) {
			 	if (err) {
			    	console.log(err);
			    	callback(err,JSON.stringify({"response":"error"}));
			  	}
			  	else {
			    	console.log('saved successfully patient data after setting alarm. ');
			    	var registrationTokens = new Array();
			    	registrationTokens.push(patObj2.gcmToken);
			    	var message = new gcm.Message();
			    	var d = new Date(Number(patObj2.alarmStartTime));
			    	console.log("Alarm start time updated: ", d.getHours()+":"+d.getMinutes(), "sending notification.");
			    	message.addData('alarmStartTime', d.getHours()+":"+d.getMinutes());
			    	message.addData('numberOfSteps', patObj2.numberOfSteps);
			    	message.addData('stepsWaitingTime', patObj2.stepsWaitingTime);
			    	message.addData('type', 'patientAlarm');
			    	/*message.addNotification('title', 'Alarm time updated.');
			    	message.addNotification('icon', 'ic_launcher');
			    	message.addNotification('body', '');							*/
			    	var sender = new gcm.Sender('AIzaSyBE_xAnxBh2Z22wPU5dPLTrJm7PtWADKVY');
			    	sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
			    		if(err) 
			    			console.error(err);
			    		else 	
			    			console.log(response);
			    	});

			    	var careGiverGcm = new gcm.Message();
			    	var careGiverAlarmTime = new Date(d.getTime() - 600000);
			    	var registrationTokens2 = patObj2.caregivers;
			    	console.log("Alarm start time for caregiver: ", careGiverAlarmTime.getHours()+":"+careGiverAlarmTime.getMinutes(), "sending notification.");
			    	careGiverGcm.addData('alarmStartTime', careGiverAlarmTime.getHours()+":"+careGiverAlarmTime.getMinutes());
			    	/*careGiverGcm.addNotification('title', 'Alarm time updated.');
			    	careGiverGcm.addNotification('icon', 'ic_launcher');
			    	careGiverGcm.addNotification('body', '');*/							
			    	var sender2 = new gcm.Sender('AIzaSyA8IAxu6hYAybpU-3Lmi0OlDqhCu3JJCzE');
			    	sender2.send(careGiverGcm, { registrationTokens: registrationTokens2 }, function (err, response) {
			    		if(err) 
			    			console.error(err);
			    		else 	
			    			console.log(response);
			    	});
			    	callback(null,JSON.stringify({"response":"success"}));
			  	}
			});
		}
	})
}


function getAllotedPatients(doctor, callback){
	Patient.find({ "_id": { "$in": doctor.patientAlloted } }, function (err, patObjs){
		if(patObjs!=null)
			callback(null, patObjs);
		else
			callback(null, new Array());
	})
}

function getAllDoctors(admin, callback){
	User.find({ "_id": { "$ne": admin.id } }, function (err, docObjs){
		console.log(docObjs);
		if(docObjs!=null)
			callback(null, docObjs);
		else
			callback(null, new Array());
	})
}

function addPatient(patId, doctor, callback){
	//console.log(doctor)
	User.findOne({"_id":doctor.id}, function(err, doc){
		//console.log(doc);
		var temp = doc.patientAlloted;
		console.log(temp);
		if(temp.indexOf(patId) < 0){
			temp.push(patId);
			doc.patientAlloted = temp;
			doc.save(function (err) {
		      	if (err) {
		      		console.log(err);
		      		callback(err,JSON.stringify({"response":"error"}));
		      	} else {
		      		console.log("Updated Doctor's patient list");
		      		callback(null,JSON.stringify({"response":"success"}));
		      	}
	      	});
		}
		else{
			callback(null,JSON.stringify({"response":"success"}));
		}
	})
}	

function getPatients(doctor, callback){
	console.log(doctor.patientAlloted);
	Patient.find({ "_id": { "$nin": doctor.patientAlloted } }, function (err, patObjs){
		console.log(patObjs);
		if(patObjs!=null)
			callback(null, patObjs);
		else
			callback(null, new Array());
	})
}