module.exports = function(viewport) {
	var containerWidth = viewport["container-width"];
	var breakpoint = viewport.viewport;
	var breakpointInt = breakpoint.substring(0, breakpoint.length - 2);
	var split = containerWidth.split(" ");
	var int;

	// console.log(split);

	if (split.length === 1) {
		if (split[0].indexOf("%") >= 0) {
			int = parseInt(breakpointInt);
		} else if (split[0].indexOf("px") >= 0) {
			int = parseInt(
				split[0].substring(
					0,
					split[0].length - (split[0].length - split[0].indexOf("px"))
				)
			);
		} else {
			int = parseInt(split[0]);
		}
	} else {
		for (var i = 0; i < split.length; i++) {
			var curSnippet = split[i];

			if (curSnippet.indexOf("px") >= 0) {
				var value = curSnippet.substring(
					0,
					curSnippet.length - (curSnippet.length - curSnippet.indexOf("px"))
				);
				int = breakpointInt - parseInt(value);
			}
		}
	}

	return int;
};
