// ! express-jwt - for security purposes
const expressJwt = require("express-jwt");

// that is middleware
function authJwt() {
	const secret = process.env.SECRET;
	return expressJwt({
		secret,
		// different algorithms for decryption
		algorithms: ["HS256"],
    // revoking the token under specific conditions
    isRevoked: isRevoked
	}).unless({
		// allow us to exclude some parts, to make them accessible with no login
		path: [
			"/api/v1/users/login",
			"/api/v1/users/register",
			// regex - everything under the products
			{ url: /\api\/v1\/products(.*)/, methods: ["GET", "OPTIONs"] }, // could not be possible to use post/put
			{ url: /\api\/v1\/categories(.*)/, methods: ["GET", "OPTIONs"] },
		],
	});
}

async function isRevoked(req, payload, done) {
  // there are only two types of users for our app
  if (!payload.isAdmin) {
    done(null, true)
  } else {
    done()
  }
}

module.exports = authJwt;
