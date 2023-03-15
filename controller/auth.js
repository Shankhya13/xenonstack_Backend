const User = require("../model/User");
const jsonwebtoken = require("jsonwebtoken");
const { expressjwt: jwt } = require("express-jwt");

exports.signup = (req, res) => {
	console.log("req.body", req.body);
	const user = new User(req.body);
	user.save((err, user) => {
		if (err) {
			return res.status(400).json({
				error: "user already exist",
			});
		}
		user.salt = undefined;
		user.password = undefined;
		res.json({
			message: "Signup successfull ! Login to continue.",
		});
	});
};

exports.signin = (req, res) => {
	console.log("req : ", req.body);

	const { useremail, password } = req.body;
	User.findOne({ useremail }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "User with email doesnot exist. SignUp again",
			});
		}
		//if user found make sure email and password match
		//create authenticate method in user model
		if (!user.authenticate(password)) {
			return res.status(401).json({
				error: "Email and password does not match",
			});
		}

		//generate signed token with user id and secret
		const token = jsonwebtoken.sign(
			{ _id: user._id, role: user.role },
			process.env.JWT_SECRET,
		);

		//persist the token as 't' in cookie with expiry date
		res.cookie("token", token, { expire: 10000 + Date.now() });

		//return response with user and token with frontend client
		const { _id, username, useremail, role } = user;
		return res.json({ token, user: { _id, username, useremail, role } });
	});
};

exports.signout = (req, res) => {
	res.clearCookie("token");
	res.json({ message: "Signout successful" });
};

exports.requiredSignin = jwt({
	secret: process.env.JWT_SECRET,
	algorithms: ["HS256"],
	userProperty: "auth",
});

exports.authMiddleware = (req, res, next) => {
	const authUserId = req.auth._id;
	User.findById({ _id: authUserId }).exec((err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "User not found",
			});
		}
		req.profile = user;
		next();
	});
};

exports.adminMiddleware = (req, res, next) => {
	const adminUserId = req.auth._id;
	User.findById({ _id: adminUserId }).exec((err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "User not found",
			});
		}
		if (user.role !== 1) {
			return res.status(400).json({
				error: "Access Denied",
			});
		}
		req.profile = user;
		next();
	});
};
