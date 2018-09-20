var postcss = require("postcss");
var meta = require("./package.json");
var name = meta.name;
var defaults = require("./lib/defaults.json");
var properties = require("./lib/properties.json");
var version = meta.version;
var author = meta.author.name;
var license = meta.license;
var getDisplaySettings = require("./utils/getDisplaySettings");
var getCalcedContainerWidth = require("./utils/getCalcedContainerWidth");
var getInlineSettings = require("./utils/getInlineSettings");

module.exports = postcss.plugin("postcss-mesh", function() {
	return function(input) {
		/*===============================================
		=            constants and variables            =
		===============================================*/

		// inline css settings
		var inlineSettings = {};

		// generated CSS
		var mesh = postcss.root();

		// defaults
		var settings = defaults;

		/*=====  End of constants and variables  ======*/

		function updateSettings(obj) {
			// gutter
			if ("gutter" in obj)
				settings.gutter =
					parseInt(obj.gutter.substring(0, obj.gutter.length - 1)) / 2;

			// gutterOnOutside
			if ("gutter-on-outside" in obj)
				settings.gutterOnOutside =
					obj["gutter-on-outside"] === "true" ? true : false;

			// responsivePadding
			if ("responsive-padding" in obj)
				settings.responsivePadding =
					obj["responsive-padding"] === "true" ? true : false;

			// containerWidth
			if ("container-width" in obj) {
				settings.containerWidth = obj["container-width"];
				settings.calcedContainerWidth = getCalcedContainerWidth(obj);
			}

			// viewport
			if ("viewport" in obj)
				settings.viewportWidth = parseInt(
					obj.viewport.substring(0, obj.viewport.length - 1)
				);

			// columnCount
			if ("column-count" in obj)
				settings.columnCount = parseInt(obj["column-count"]);

			// columnSingleWidth
			settings.columnSingleWidth = 100 / settings.columnCount;
		}

		function getViewportAtRules(viewport, options) {
			updateSettings(viewport);
			var component = options.component;
			var props = properties[component];
			var atRule = postcss.atRule();
			atRule.name = `media (${settings.queryCondition.value} : ${
				settings.viewportWidth
			}px)`;
			var rule = postcss.rule();
			rule.selector = options.selector || "undefined selector";

			for (var key in props) {
				var prop = key;
				var propOptions = props[prop];

				if (propOptions.viewportRelevant) {
					var value;

					switch (component) {
						case "container":
							if (settings.responsivePadding && prop.indexOf("padding") >= 0) {
								value = settings[propOptions.valueKey];
								value = (value / settings.viewportWidth) * 100;
								value = `${value}%`;
							} else {
								value = propOptions["unit"]
									? `${settings[propOptions.valueKey]}${propOptions.unit}`
									: settings[propOptions.valueKey];
							}
							break;
						case "void":
							if (settings.responsivePadding && prop.indexOf("margin") >= 0) {
								value = settings[propOptions.valueKey];
								value = (value / settings.calcedContainerWidth) * 100;
								value = `-${value}%`;
							} else {
								value = propOptions["unit"]
									? `-${settings[propOptions.valueKey]}${propOptions.unit}`
									: `-${settings[propOptions.valueKey]}`;
							}
							break;
						case "void:after":
							break;
						case "column":
							if (settings.responsivePadding && prop.indexOf("padding") >= 0) {
								value = settings[propOptions.valueKey];
								value = (value / settings.calcedContainerWidth) * 100;
								value = `${value}%`;
							} else {
								value = propOptions["unit"]
									? `${settings[propOptions.valueKey]}${propOptions.unit}`
									: settings[propOptions.valueKey];
							}
							break;
						default:
							break;
					}

					rule.append(
						postcss.decl({
							prop: prop,
							value: value
						})
					);
				}
			}
			atRule.append(rule);

			return atRule;
		}

		// generate rules for .mesh-container
		function getContainerRules(grid) {
			updateSettings(grid);
			var rules = [];
			var containerRules = postcss.rule();
			containerRules.selector = `.${name}-container`;

			// set display
			containerRules.append(postcss.decl({ prop: "display", value: "block" }));
			// set margin
			containerRules.append(postcss.decl({ prop: "margin", value: "0 auto" }));
			// set max-width
			containerRules.append(
				postcss.decl({ prop: "max-width", value: grid["container-width"] })
			);
			// set padding
			if (settings.gutterOnOutside) {
				containerRules.append(
					postcss.decl({ prop: "padding", value: `0 ${settings.gutter}px` })
				);
			}
			// set position
			containerRules.append(
				postcss.decl({ prop: "position", value: "relative" })
			);
			// set width
			containerRules.append(postcss.decl({ prop: "width", value: "100%" }));

			rules.push(containerRules);

			for (var key in grid.sortedViewports) {
				var currentViewport = grid.sortedViewports[key];
				rules.push(
					getViewportAtRules(currentViewport, {
						component: "container",
						selector: `.${name}-container`
					})
				);
			}

			return rules;
		}

		// generate rules for .mesh-void
		function getVoidRules(grid) {
			updateSettings(grid);
			var rules = [];
			var voidAfterRule = postcss.rule();
			var voidRule = postcss.rule();
			voidAfterRule.selector = `.${name}-void:after`;
			voidRule.selector = `.${name}-void`;

			// set content
			voidAfterRule.append(postcss.decl({ prop: "content", value: "''" }));
			// set clear
			voidAfterRule.append(postcss.decl({ prop: "clear", value: "both" }));
			// set display
			voidAfterRule.append(postcss.decl({ prop: "display", value: "block" }));
			if (getDisplaySettings(grid).value === "flex") {
				voidRule.append(postcss.decl({ prop: "display", value: "flex" }));
				voidRule.append(postcss.decl({ prop: "flex-wrap", value: "wrap" }));
			} else {
				voidRule.append(postcss.decl({ prop: "display", value: "block" }));
			}
			// set margin
			if (settings.responsivePadding) {
				voidRule.append(
					postcss.decl({ prop: "margin", value: `0 -${settings.gutter}px` })
				);
			} else {
				voidRule.append(
					postcss.decl({ prop: "margin", value: `0 -${settings.gutter}px` })
				);
			}
			// set font-size
			if (getDisplaySettings(grid).value === "inline-block")
				voidRule.append(postcss.decl({ prop: "font-size", value: "0" }));

			// set display
			if (getDisplaySettings(grid).property === "float")
				rules.push(voidAfterRule);
			rules.push(voidRule);

			for (var key in grid.sortedViewports) {
				var currentViewport = grid.sortedViewports[key];
				rules.push(
					getViewportAtRules(currentViewport, {
						component: "void",
						selector: `.${name}-void`
					})
				);
			}

			return rules;
		}

		// generate rules for .mesh-column
		function getColumnRules(grid) {
			updateSettings(grid);
			var rules = [];
			var centerRule = postcss.rule();
			var pushRule = postcss.rule();
			var pullRule = postcss.rule();
			var columnRule = postcss.rule();
			centerRule.selector = `[class*="${name}-center"]`;
			pushRule.selector = `[class*="${name}-push"]`;
			pullRule.selector = `[class*="${name}-pull"]`;
			columnRule.selector = `[class*="${name}-column"]`;
			// settings.columnCount = grid["column-count"];
			// settings.gutter =
			// 	parseInt(grid["gutter"].substring(0, grid["gutter"].length - 1)) / 2;
			// settings.columnSingleWidth = 100 / settings.columnCount;

			// set displayProperty
			if (getDisplaySettings(grid).value !== "flex")
				columnRule.append(
					postcss.decl({
						prop: getDisplaySettings(grid).property,
						value: getDisplaySettings(grid).value
					})
				);
			// set padding
			if (settings.responsivePadding) {
				var value = (settings.gutter / 375) * 100;
				columnRule.append(
					postcss.decl({ prop: "padding", value: `0 ${value}%` })
				);
			} else {
				columnRule.append(
					postcss.decl({ prop: "padding", value: `0 ${settings.gutter}px` })
				);
			}
			// set vertical-align
			if (getDisplaySettings(grid).value === "inline-block")
				columnRule.append(
					postcss.decl({ prop: "vertical-align", value: "top" })
				);
			//set position
			centerRule.append(postcss.decl({ prop: "position", value: "relative" }));
			pushRule.append(postcss.decl({ prop: "position", value: "relative" }));
			pullRule.append(postcss.decl({ prop: "position", value: "relative" }));
			// set left
			centerRule.append(postcss.decl({ prop: "left", value: "50%" }));
			// set transform
			centerRule.append(
				postcss.decl({ prop: "transform", value: "translate3d(-50%,0,0)" })
			);

			if (getDisplaySettings(grid).property === "float")
				columnRule.append(postcss.decl({ prop: "min-height", value: "1px" }));
			rules.push(centerRule, pushRule, pullRule, columnRule);

			for (var i = 0; i <= settings.columnCount; i++) {
				var offsetRule = postcss.rule();
				var pushRule = postcss.rule();
				var pullRule = postcss.rule();
				var columnRule = postcss.rule();
				var index = i;
				offsetRule.selector = `.${name}-offset-${index}`;
				pushRule.selector = `.${name}-push-${index}`;
				pullRule.selector = `.${name}-pull-${index}`;
				columnRule.selector = `.${name}-column-${index}`;
				// set width
				offsetRule.append(
					postcss.decl({
						prop: "margin-left",
						value: `${settings.columnSingleWidth * index}%`
					})
				);
				pushRule.append(
					postcss.decl({
						prop: "left",
						value: `${settings.columnSingleWidth * index}%`
					})
				);
				pullRule.append(
					postcss.decl({
						prop: "right",
						value: `${settings.columnSingleWidth * index}%`
					})
				);
				columnRule.append(
					postcss.decl({
						prop: "width",
						value: `${settings.columnSingleWidth * index}%`
					})
				);

				rules.push(offsetRule, pushRule, pullRule, columnRule);
			}

			for (var key in grid.sortedViewports) {
				var currentViewport = grid.sortedViewports[key];
				updateSettings(currentViewport);
				var viewportName = currentViewport.name;
				var atRule = postcss.atRule();
				atRule.name = `media (${settings.queryCondition.value} : ${
					settings.viewportWidth
				})`;
				// settings.columnSingleWidth = 100 / settings.columnCount;

				common viewport rules
				var columnRule = postcss.rule();
				columnRule.selector = `[class*="${name}-column-${viewportName}"]`;

				//set padding
				if (settings.responsivePadding) {
					var value = (settings.gutter / settings.calcedContainerWidth) * 100;
					columnRule.append(
						postcss.decl({ prop: "padding", value: `0 ${value}%` })
					);
				} else {
					columnRule.append(
						postcss.decl({ prop: "padding", value: `0 ${settings.gutter}px` })
					);
				}

				atRule.append(columnRule);

				for (var n = 0; n <= settings.columnCount; n++) {
					var offsetRule = postcss.rule();
					var pushRule = postcss.rule();
					var pullRule = postcss.rule();
					var columnRule = postcss.rule();
					var index = n;
					offsetRule.selector = `[class*="${name}-offset-${viewportName}-${index}"]`;
					pushRule.selector = `[class*="${name}-push-${viewportName}-${index}"]`;
					pullRule.selector = `[class*="${name}-pull-${viewportName}-${index}"]`;
					columnRule.selector = `.${name}-column-${viewportName}-${index}`;

					// set width/offset
					offsetRule.append(
						postcss.decl({
							prop: "margin-left",
							value: `${settings.columnSingleWidth * index}%`
						})
					);
					pushRule.append(
						postcss.decl({
							prop: "left",
							value: `${settings.columnSingleWidth * index}%`
						})
					);
					pullRule.append(
						postcss.decl({
							prop: "right",
							value: `${settings.columnSingleWidth * index}%`
						})
					);
					columnRule.append(
						postcss.decl({
							prop: "width",
							value: `${settings.columnSingleWidth * index}%`
						})
					);

					atRule.append(offsetRule, pushRule, pullRule, columnRule);
				}

				// rules.push(
				// 	getViewportAtRules(currentViewport, {
				// 		component: "column",
				// 		selector: `[class*="${name}-column-${viewportName}"]`
				// 	})
				// );
				rules.push(atRule);
			}

			return rules;
		}

		// generate styles for base classes
		function generateCSS() {
			var licenseNotification = postcss.comment();
			licenseNotification.text = `! Grid generated using ${name} v${version} | ${license} License | ${author} | github.com/SlimMarten/postcss-mesh `;

			// append licenseNotification
			mesh.append(licenseNotification);

			for (var key in inlineSettings) {
				var curGrid = inlineSettings[key];

				// overwirte name
				if (curGrid.name) name = curGrid.name;

				// overwrite queryCondition
				if (curGrid["query-condition"])
					settings.queryCondition.value = curGrid["query-condition"];

				if (JSON.parse(curGrid["compile-default-classes"])) {
					// append .mesh-container base styles
					mesh.append(getContainerRules(curGrid));
					// append .mesh-void base styles
					mesh.append(getVoidRules(curGrid));
					// append .mesh-column base styles
					mesh.append(getColumnRules(curGrid));
				}
			}

			input.prepend(mesh);
		}

		// main init
		function init() {
			inlineSettings = getInlineSettings(input);
			generateCSS();
		}

		/*=====  End of global function  ======*/
		init();
	};
});
