const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
	const userList = await User.find().select("-passwordHash");

	if (!userList) {
		res.status(500).json({ success: false });
	}
	res.send(userList);
});

router.post("/", async (req, res) => {
	let user = new User({
		name: req.body.name,
		email: req.body.email,
		color: req.body.color,

		// we are asking the normal password from the FE and then encrypt it for our server
		passwordHash: bcrypt.hashSync(req.body.password, 10),
		phone: req.body.phone,
		isAdmin: req.body.isAdmin,
		street: req.body.street,
		apartment: req.body.apartment,
		zip: req.body.zip,
		city: req.body.city,
		country: req.body.country,
	});

	user = await user.save();

	// if there is no user - returning error
	if (!user) {
		return res.status(404).send("The user cannot be created");
	}

	res.send(user);
});

// we don't want to send the user password
router.get("/:id", async (res, req) => {
	const user = await User.findById(req.params.id).select("-passwordHash");

	if (!user) {
		res
			.status(500)
			.json({ message: "The user with given ID has not been found" });
	}
	res.status(200).send(user);
});

router.post("/login", async (req, res) => {
	// check whether the email exists in database
	const user = await User.findOne({ email: req.body.email });
	const secret = process.env.SECRET;

	if (!user) return res.status(400).send("The user not found");

	if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
		// we can pass the data that we want for this token
		const token = jwt.sign(
			{
				userId: user.id,
				// ! it is better to secure admin info on the back of our application with the token
				isAdmin: user.isAdmin,
			},
			// some secret string to encrypt our token. could be env
			secret,
			// the token could be expired
			{ expiresIn: "1d" } // 1w, 1m etc
		);

		// here we send the token for the FE part of our application
		res.status(200).send({ user: user.email, token });
	} else {
		return res.status(400).send("The password is wrong");
	}
});

router.delete("/:id", (req, res) => {
	User.findByIdAndRemove(req.params.id)
		.then((user) => {
			if (user) {
				return res
					.status(200)
					.json({ success: true, message: "the user is deleted!" });
			} else {
				return res
					.status(404)
					.json({ success: false, message: "user not found!" });
			}
		})
		.catch((err) => {
			return res.status(500).json({ success: false, error: err });
		});
});

router.get(`/get/count`, async (req, res) => {
	const userCount = await User.countDocuments((count) => count);

	if (!userCount) {
		res.status(500).json({ success: false });
	}
	res.send({
		userCount: userCount,
	});
});

module.exports = router;
