const { app, api, Product } = require("./app");

// we are getting the route and callback to be called when the route is taken
app.get(`${api}/products`, async (req, res) => {
	// const product = {
	// 	id: 1,
	// 	name: "hair dresser",
	// 	image: "some_url",
	// };
	// get data from the db
	const productList = await Product.find();

	res.send(productList);
});
