var defaults = require("./../lib/defaults.json");
var inlineSettings = {};

module.exports = function(input) {
	input.walkAtRules(function(rule) {
		// return if at-rule does not match 'mesh-grid'
		if (!/^mesh-grid/.test(rule.name)) return;
		var gridName = defaults.name;

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
				var viewport = decl.parent.name.split("-")[
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
	for (var n in inlineSettings) {
		var currentGrid = inlineSettings[n];
		currentGrid.sortedViewports = {};
		var tempSortedViewports = [];

		for (var i in currentGrid.viewports) {
			var currentViewport = currentGrid.viewports[i];
			var currentBreakpoint = currentViewport.viewport;
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

		for (var i = 0; i < tempSortedViewports.length; i++) {
			var breakpoint = tempSortedViewports[i];
			var relatedViewport = {};

			for (var j in currentGrid.viewports) {
				var currentSetting = currentGrid.viewports[j];
				var currentViewport = currentSetting.viewport;
				var currentBreakpoint = parseInt(
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
