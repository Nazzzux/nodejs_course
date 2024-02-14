const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");

// ! usage of the middleware
app.use(bodyParser.json());
// the default parameter is tiny
app.use(morgan("tiny"));
// ! =====================

// schema for model
const productSchema = mongoose.Schema({
	name: String,
	image: String,
	// countInStock: Number, // not required
	countInStock: {
		type: Number,
		required: true, // is required
	},
});

// creating the model (model is the collection in NodeJS)
const Product = mongoose.model("Product", productSchema);

require("dotenv/config");

const api = process.env.API_URL;

// we are getting the route and callback to be called when the route is taken
app.get(`${api}/products`, async (req, res) => {
	// const product = {
	// 	id: 1,
	// 	name: "hair dresser",
	// 	image: "some_url",
	// };

	// get data from the db
	const productList = await Product.find();

	// check for the productList
	if (!productList) {
		res.status(500).json({ success: false });
	}

	res.send(productList);
});

// to post some data from the backend to the database
app.post(`${api}/products`, (req, res) => {
	// if we send raw JSON, the response value would be 1, and console.log below would return undefined
	// to work with the sent from FE request body we need something called middleware
	// this middleware will help the BE to understand the type of body (JSON/image etc) and parse it accordingly
	// ! the lib containing these middlewares is called body-parser
	// const newProduct = req.body;
	// console.log(newProduct);

	// usage of our created Product
	const product = new Product({
		name: req.body.name,
		image: req.body.image,
		countInStock: req.body.countInStock,
	});

	// saving the received data to the database, and returning different responses based on status
	product
		.save()
		.then((createdProduct) => {
			res.status(201).json(createdProduct);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				success: false,
			});
		});
});

// ! normally we add the connection to the database before starting the server
// username, password could be accessed from the Database Access in mongobd
// dbname is accessed in
// mongoose.connect('mongodb+srv://<username>:<password>@cluster0.mdlgl7z.mongodb.net/<dbname>?retryWrites=true&w=majority')

// this returns promise
mongoose
	.connect(process.env.CONNECTION_STRING)
	.then(() => {
		console.log("database is connected");
	})
	.catch((error) => {
		console.log(error);
	});

// starting the server and listening to the port 3000
app.listen(3000, () => {
	console.log("the server is running on the the 3000");
});
