module.exports = function(grid) {
	const displayProperty =
		grid["display-type"] === "float" ? "float" : "display";
	const displayValue =
		grid["display-type"] === "float" ? "left" : grid["display-type"];

	return { property: displayProperty, value: displayValue };
};
