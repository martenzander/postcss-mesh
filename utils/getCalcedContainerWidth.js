module.exports = function(viewport) {
	const containerWidth = viewport["container-width"];
	const breakpoint = viewport.viewport;
	const breakpointInt = breakpoint.substring(0, breakpoint.length - 2);
	const split = containerWidth.split(" ");
	let int;

	if (split.length === 1) {
		if (split[0].indexOf("%") >= 0) {
			let fac = parseFloat(split[0].replace("%", "")) / 100;
			int = parseInt(breakpointInt) * fac;
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
		for (let i = 0; i < split.length; i++) {
			const curSnippet = split[i];

			if (curSnippet.indexOf("px") >= 0) {
				const value = curSnippet.substring(
					0,
					curSnippet.length - (curSnippet.length - curSnippet.indexOf("px"))
				);
				int = breakpointInt - parseInt(value);
			}
		}
	}

	return int;
};
