var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');

var userSchema = mongoose.Schema({
	local:{
		username:String,
		password:String,
		name:String,
		department:String,
		phone:String
	},
	patientAlloted:[String]
});

userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password,bcrypt.genSaltSync(9));
}

userSchema.methods.validPassword = function(password){
	console.log(bcrypt.compareSync(password,this.local.password));
	return bcrypt.compareSync(password,this.local.password);
}
module.exports = mongoose.model("User",userSchema); 