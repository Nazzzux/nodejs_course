const { Product } = require("../models/product");
const express = require("express");
const Category = require("../models/product");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('invalid image type');

      if(isValid) {
          uploadError = null
      }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
      
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
})
// ! we can use the router as a middleware in our application

// transfer here all the apis from the app file; instead app we can use router
// we are getting the route and callback to be called when the route is taken

// the url has already been passed from the app. and we need to pass only the child part of the route
// we have already passed 'api/v1/products'
router.get(`/`, async (req, res) => {
	// all data
	// const productList = await Product.find();

	// return only array of objects with name and id (id is default)
	// const productList = await Product.find().select('name');

	// return only array of objects with name, image excluding the id field (dash sign)
	// const productList = await Product.find().select("name image -_id");

	// ? queryParameters - passed after the question mark in url - could be used in data filter by category
	// localhost:3000/api/v1/products?[categories]=category1,category2
	let filter = {};

	if (req.query.categories) {
		filter = { category: req.query.categories.split(',') }
	}

	// argument in find method is an object
	const productList = await Product.find(filter).select("name image -_id");

	if (!productList) {
		res.status(500).json({ success: false });
	}

	res.send(productList);
});

router.get(`/:productId`, async (req, res) => {
	// this line would return the product with not nice category id to be displayed
	// const product = await Product.findById(req.param.productId);

	// ! getting the details of the category
	const product = await Product.findById(req.param.productId).populate(
		"category"
	);

	if (!product) {
		res.status(500).json({ success: false });
	}

	res.send(product);
});

// to post some data from the backend to the database
router.post(`/`, async (req, res) => {
	// validation of the category exist
	const category = await Category.findById(req.body.category);
	if (!category) return res.status(400).json("Invalid category");

  const file = req.file;
  if(!file) return res.status(400).send('No image in the request')

  const fileName = file.filename
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
	const product = new Product({
		name: req.body.name,
		description: req.body.description,
		richDescription: req.body.richDescription,
		image: `${basePath}${fileName}`,// "http://localhost:3000/public/upload/image-2323232",
		brand: req.body.brand,
		price: req.body.price,
		category: req.body.category,
		countInStock: req.body.countInStock,
		rating: req.body.rating,
		numReviews: req.body.numReviews,
		isFeatured: req.body.isFeatured,
	});

	// saving the received data to the database, and returning different responses based on status
	// ! below code with the promises
	// product
	// 	.save()
	// 	.then((createdProduct) => {
	// 		res.status(201).json(createdProduct);
	// 	})
	// 	.catch((err) => {
	// 		res.status(500).json({
	// 			error: err,
	// 			success: false,
	// 		});
	// 	});

	// async/await
	product = await product.save();

	if (!product) {
		return res.status(500).send("The Product cannot be created");
	}

	res.send(product);
});

router.put("/:id", async (req, res) => {
	// validating id - if id exists
	if (!mongoose.isValidObjectId(req.param.id)) {
		return res.status(400).json("Invalid product ID");
	}

	const category = await Category.findById(req.body.category);
	if (!category) return res.status(400).json("Invalid category");

	const product = await Product.findByIdAndUpdate(
		req.params.id,
		{
			name: req.body.name,
			description: req.body.description,
			richDescription: req.body.richDescription,
			image: req.body.image,
			brand: req.body.brand,
			price: req.body.price,
			category: req.body.category,
			countInStock: req.body.countInStock,
			rating: req.body.rating,
			numReviews: req.body.numReviews,
			isFeatured: req.body.isFeatured,
		},
		{
			// to return newly created data. old data for default value
			new: true,
		}
	);

	if (!product) {
		return res.status(500).send("The product cannot be updated");
	}

	res.send(product);
});

router.delete("/:id", (req, res) => {
	// to get the id from the url here
	Product.findByIdAndRemove(req.params.id)
		.then((product) => {
			// working with the product. outward catch block serves for the catching errors not related with categories
			if (product) {
				return res
					.status(200)
					.json({ success: true, message: "The product has been deleted" });
			} else {
				return res
					.status(404)
					.json({ success: true, message: "The product has not been found" });
			}
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

// get the quantity of products in database
router.get(`/get/count`, async (req, res) => {
	const productCount = await Product.countDocuments((count) => count);

	if (!productCount) {
		res.status(500).json({ success: false });
	}

	res.send({
		count: productCount,
	});
});

// get featured products all products /: or with specified count
router.get(`/get/featured/:count`, async (req, res) => {
	const count = req.params.count ? req.params.count : 0;
	const productCount = await Product.find({
		// get all product with field isFeatured equals true
		isFeatured: true,
	}).limit(+count); // to limit the quantity of the products

	if (!productCount) {
		res.status(500).json({ success: false });
	}

	res.send({
		count: productCount,
	});
});

// exporting the module itself
module.exports = router;
