module.exports = function(grid) {
	var displayProperty = grid["display-type"] === "float" ? "float" : "display";
	var displayValue =
		grid["display-type"] === "float" ? "left" : grid["display-type"];

	return { property: displayProperty, value: displayValue };
};
