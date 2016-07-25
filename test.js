var json2csv = require('json2csv');
var fs = require('fs');
var path = require('path');
var fields = ['emailId', 'aiimsId', 'time', 'mPackageName', 'mLaunchCount', 'mTotalTimeInForeground',];
var fieldNames = ['emailId', 'aiimsId', 'time', 'Name of Application', 'Number of Launches', 'Total Time Used']
var appUsage = {
    "_id" : "57474c393490165c044d0966",
    "emailId" : "abhishekjain1995@gmail.com",
    "aiimsId" : "hwvsjan",
    "gcmToken" : "dT81tlAzcsg:APA91bHIHeXGVuAy_VYU9u6vZS8LOrCaiwa_nZmFQfMgeO9bph4hWP9bZ3lQdXLx-0_daRi142bxTrdNt5ufRrYRi7wx3b627KL-z7EYBsEbUhhHb2cmq06z5752dTsQMq8TXT17yAM3",
    "accessToken" : "4/EVzkQ9bwNPWxsxeEqDNdB47oLOfaElHyhTZC_fPOaP0",
    "timeMillies" : "2016-05-26T19:19:31.444Z",
    "appUsage" : [ 
        {
            "mLaunchCount" : 63,
            "mTotalTimeInForeground" : 2769952,
            "mLastTimeUsed" : 1464290119396,
            "mEndTimeStamp" : 1464290119396,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.whatsapp"
        }, 
        {
            "mLaunchCount" : 2,
            "mTotalTimeInForeground" : 8777,
            "mLastTimeUsed" : 1464287655495,
            "mEndTimeStamp" : 1464287655495,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.android.contacts"
        }, 
        {
            "mLaunchCount" : 3,
            "mTotalTimeInForeground" : 161960,
            "mLastTimeUsed" : 1464289282078,
            "mEndTimeStamp" : 1464289282078,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.instagram.android"
        }, 
        {
            "mLaunchCount" : 1,
            "mTotalTimeInForeground" : 102893,
            "mLastTimeUsed" : 1464287653003,
            "mEndTimeStamp" : 1464287653003,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.android.incallui"
        }, 
        {
            "mLaunchCount" : 1,
            "mTotalTimeInForeground" : 35868,
            "mLastTimeUsed" : 1464290283114,
            "mEndTimeStamp" : 1464290283114,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.android.fileexplorer"
        }, 
        {
            "mLaunchCount" : 0,
            "mTotalTimeInForeground" : 37499,
            "mLastTimeUsed" : 1464284381368,
            "mEndTimeStamp" : 64960215,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.google.android.apps.docs"
        }, 
        {
            "mLaunchCount" : 1,
            "mTotalTimeInForeground" : 259,
            "mLastTimeUsed" : 1464287550040,
            "mEndTimeStamp" : 1464287550040,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.android.server.telecom"
        }, 
        {
            "mLaunchCount" : 4,
            "mTotalTimeInForeground" : 26589,
            "mLastTimeUsed" : 1464289961389,
            "mEndTimeStamp" : 1464289961389,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.android.chrome"
        }, 
        {
            "mLaunchCount" : 21,
            "mTotalTimeInForeground" : 65532,
            "mLastTimeUsed" : 1464290315055,
            "mEndTimeStamp" : 1464290315055,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.google.android.gms"
        }, 
        {
            "mLaunchCount" : 3,
            "mTotalTimeInForeground" : 79288,
            "mLastTimeUsed" : 1464290301455,
            "mEndTimeStamp" : 1464290301455,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.android.packageinstaller"
        }, 
        {
            "mLaunchCount" : 14,
            "mTotalTimeInForeground" : 492095,
            "mLastTimeUsed" : 1464290359001,
            "mEndTimeStamp" : 1464290359001,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 1,
            "mPackageName" : "com.mananwason.patientalarm.aiimspatientalarm"
        }, 
        {
            "mLaunchCount" : 1,
            "mTotalTimeInForeground" : 4624,
            "mLastTimeUsed" : 1464290358974,
            "mEndTimeStamp" : 1464290358974,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.android.settings"
        }, 
        {
            "mLaunchCount" : 0,
            "mTotalTimeInForeground" : 1619,
            "mLastTimeUsed" : 1464284335856,
            "mEndTimeStamp" : 64960215,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "co.mountainreacher.nocropforwhatsapp"
        }, 
        {
            "mLaunchCount" : 5,
            "mTotalTimeInForeground" : 321929,
            "mLastTimeUsed" : 1464290024866,
            "mEndTimeStamp" : 1464290024866,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.snapchat.android"
        }, 
        {
            "mLaunchCount" : 23,
            "mTotalTimeInForeground" : 847000,
            "mLastTimeUsed" : 1464290267852,
            "mEndTimeStamp" : 1464290267852,
            "mBeginTimeStamp" : 1464220823169,
            "mLastEvent" : 2,
            "mPackageName" : "com.miui.home"
        }
    ],
    "__v" : 0
}

//console.log(myCars.appUsage);
var temp = appUsage.appUsage;
var d = new Date(appUsage.timeMillies);
for(var i=0;i<temp.length;i++){
  temp[i].emailId = appUsage.emailId;
  temp[i].aiimsId = appUsage.aiimsId;
  temp[i].time = d;
}
console.log(temp);
 
json2csv({ data: temp, fields: fields , fieldNames:fieldNames}, function(err, csv) {
  if (err) console.log(err);
  fs.writeFile('file.csv', csv, function(err) {
    if (err) throw err;
    var file = 'D://College//summer 2016//aiims project//server//'+'file.csv';
    console.log(path.basename(file));
    
  });
});