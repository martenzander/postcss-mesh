const defaults = require("./../lib/defaults.json");
const inlineSettings = {};

module.exports = function(input) {
	input.walkAtRules(function(rule) {
		// return if at-rule does not match 'mesh-grid'
		if (!/^mesh-grid/.test(rule.name)) return;
		let gridName = defaults.name;

		rule.walkDecls(function(decl) {
			if (decl.prop === "name") {
				gridName = decl.value;
			}
		});

		inlineSettings[gridName] = {};
		inlineSettings[gridName].name = gridName;
		inlineSettings[gridName].viewports = {};

		rule.walkDecls(function(decl) {
			if (!/^mesh-viewport-/.test(decl.parent.name)) {
				inlineSettings[gridName][decl.prop] = decl.value;
			} else {
				const viewport = decl.parent.name.split("-")[
					decl.parent.name.split("-").length - 1
				];
				inlineSettings[gridName].viewports[viewport] =
					inlineSettings[gridName].viewports[viewport] || {};
				inlineSettings[gridName].viewports[viewport][decl.prop] = decl.value;
			}
		});
		// remove inline at-rules
		rule.remove();
	});

	// sort viewports
	for (const n in inlineSettings) {
		const currentGrid = inlineSettings[n];
		currentGrid.sortedViewports = {};
		let tempSortedViewports = [];

		for (const i in currentGrid.viewports) {
			const currentViewport = currentGrid.viewports[i];
			let currentBreakpoint = currentViewport.viewport;
			currentBreakpoint = parseInt(
				currentBreakpoint.substring(0, currentBreakpoint.length - 2)
			);
			tempSortedViewports.push(currentBreakpoint);
		}

		tempSortedViewports =
			currentGrid["query-condition"] === "min-width"
				? tempSortedViewports.sort(function(a, b) {
						return a - b;
				  })
				: tempSortedViewports.sort(function(a, b) {
						return b - a;
				  });

		for (let i = 0; i < tempSortedViewports.length; i++) {
			const breakpoint = tempSortedViewports[i];
			let relatedViewport = {};

			for (const j in currentGrid.viewports) {
				const currentSetting = currentGrid.viewports[j];
				const currentViewport = currentSetting.viewport;
				const currentBreakpoint = parseInt(
					currentViewport.substring(0, currentViewport.length - 2)
				);

				if (currentBreakpoint === breakpoint) {
					relatedViewport = currentSetting;
					relatedViewport.name = j;

					currentGrid.sortedViewports[j] = relatedViewport;
				}
			}
		}
	}

	return inlineSettings;
};
