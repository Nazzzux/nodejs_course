const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
	const categoryList = await Category.find();

	if (!categoryList) {
		res.status(500).json({ success: false });
	}
	res.status(200).send(categoryList);
});

router.get("/:id", async (res, req) => {
	const category = await Category.findById(req.params.id);

	if (!category) {
		res
			.status(500)
			.json({ message: "The category with given ID has not been found" });
	}
	res.status(200).send(category);
});

// req - (request) - data we receive from the frontend part of the application
router.post("/", async (req, res) => {
	let category = new Category({
		name: req.body.name,
		icon: req.body.icon,
		color: req.body.color,
	});

	category = await category.save();

	// if there is no category - returning error
	if (!category) {
		return res.status(404).send("The category cannot be created");
	}

	res.send(category);
});

router.put("/:id", async (req, res) => {
	const category = await Category.findByIdAndUpdate(
		req.params.id,
		{
			name: req.body.name,
			icon: req.body.icon,
			color: req.body.color,
		},
		{
			// to return newly created data. old data for default value
			new: true,
		}
	);

	if (!category) {
		return res.status(404).send("The category cannot be created");
	}

	res.send(category);
});

router.delete("/:id", (req, res) => {
	// to get the id from the url here
	Category.findByIdAndRemove(req.params.id)
		.then((category) => {
			// working with the category. outward catch block serves for the catching errors not related with categories
			if (category) {
				return res
					.status(200)
					.json({ success: true, message: "The category has been deleted" });
			} else {
				return res
					.status(404)
					.json({ success: true, message: "The category has not been found" });
			}
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

module.exports = router;
