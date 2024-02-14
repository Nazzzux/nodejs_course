const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const categoriesRouter = require("./routes/categories");
const productRouter = require("./routes/product");
const usersRouter = require("./routes/users");
const ordersRouter = require("./routes/orders").default;
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/errorHandler");
require("dotenv/config");

const api = process.env.API_URL;

// enabling the cors
app.use(cors());
// http options (* - all requests are allowed)
app.options("*", cors());

// ! usage of the middleware (somewhere in between the receiving the data from FE and passing it to the db)
app.use(bodyParser.json());
// the default parameter is tiny
app.use(morgan("tiny"));
// now the server is secured based on the token
app.use(authJwt());
// this code would be executed every time when our application has an error
app.use(errorHandler);
// ! =====================

// ! Routers
// usage of our productRouter in the app as a middleware
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/products`, productRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

// ! db connection
mongoose
	.connect(process.env.CONNECTION_STRING)
	.then(() => {
		console.log("database is connected");
	})
	.catch((error) => {
		console.log(error);
	});

// ! server connection
app.listen(3000, () => {
	console.log("the server is running on the the 3000");
});
