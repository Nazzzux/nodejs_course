const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	richDescription: {
		type: String,
		default: "",
	},
	image: {
		type: String,
		default: "",
	},
	images: [
		{
			type: String,
		},
	],
	brand: {
		type: String,
		default: "",
	},
	price: {
		type: Number,
		default: 0,
	},
	category: {
		// link between product and category
		type: mongoose.Schema.Types.ObjectId,
		// reference to the created schema of category
		ref: "Category",
		required: true,
	},
	categoryInStore: {
		type: Number,
		required: true,
		// setting the limits for numbers
		min: 0,
		max: 255,
	},
	numReviews: {
		type: Number,
		default: 0,
	},
	// isFeatured - to display featured items on the home screen
	isFeatured: {
		type: Boolean,
		default: false,
	},
	dateCreated: {
		type: Date,
		default: Date.now,
	},
});

productSchema.virtual("id").get(function () {
	// setting ObjectId of mongodb to the string - more FE friendly
	return this._id.toHexString();
});

// to enable the virtual (like the one we see above)
productSchema.set("toJSON", {
	virtuals: true,
});

// creating the model (model is the collection in NodeJS)
// exporting the part
exports.Product = mongoose.model("Product", productSchema);

// ! exports.[Name] could be imported with require
