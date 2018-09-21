const postcss = require("postcss");
const meta = require("./package.json");
const name = meta.name;
const defaults = require("./lib/defaults.json");
const properties = require("./lib/properties.json");
const version = meta.version;
const author = meta.author.name;
const license = meta.license;
const getDisplaySettings = require("./utils/getDisplaySettings");
const getCalcedContainerWidth = require("./utils/getCalcedContainerWidth");
const getInlineSettings = require("./utils/getInlineSettings");

module.exports = postcss.plugin("postcss-mesh", function() {
	return function(input) {
		/*===============================================
		=            constants and constiables            =
		===============================================*/

		// inline css settings
		let inlineSettings = {};

		// generated CSS
		const mesh = postcss.root();

		// defaults
		const settings = defaults;

		/*=====  End of constants and constiables  ======*/

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

		function getAtRule() {
			const atRule = postcss.atRule();
			atRule.name = `media (${settings.queryCondition.value} : ${
				settings.viewportWidth
			}px)`;

			return atRule;
		}

		function getPropValue(component, property) {
			let value;

			switch (component) {
				case "container":
					if (
						!settings.gutterOnOutside &&
						property.name.indexOf("padding") >= 0
					) {
						value = undefined;
					} else if (
						settings.responsivePadding &&
						property.name.indexOf("padding") >= 0
					) {
						value = settings[property.options.valueKey];
						value = (value / settings.viewportWidth) * 100;
						value = `${value}%`;
					} else {
						value = property.options["unit"]
							? `${settings[property.options.valueKey]}${property.options.unit}`
							: settings[property.options.valueKey];
					}
					break;
				case "void":
					if (
						settings.responsivePadding &&
						property.name.indexOf("margin") >= 0
					) {
						value = settings[property.options.valueKey];
						value = (value / settings.calcedContainerWidth) * 100;
						value = `-${value}%`;
					} else {
						value = property.options["unit"]
							? `-${settings[property.options.valueKey]}${
									property.options.unit
							  }`
							: `-${settings[property.options.valueKey]}`;
					}
					break;
				case "void:after":
					break;
				case "column":
					if (
						settings.responsivePadding &&
						property.name.indexOf("padding") >= 0
					) {
						value = settings[property.options.valueKey];
						value = (value / settings.calcedContainerWidth) * 100;
						value = `${value}%`;
					} else {
						value = property.options["unit"]
							? `${settings[property.options.valueKey]}${property.options.unit}`
							: settings[property.options.valueKey];
					}
					break;
				case "pull":
					break;
				case "push":
					break;
				case "offset":
					break;
				case "center":
					break;
				default:
					break;
			}

			return value;
		}

		function getComponentRules(viewport, options) {
			const component = options.component;
			const props = properties[component];
			const rule = postcss.rule();
			rule.selector = options.selector || "undefined selector";

			for (const key in props) {
				const property = {
					name: key,
					options: props[key]
				};
				const propOptions = props[property.name];
				let value;

				if ("viewports" in viewport) {
					getPropValue(component, property);
				} else {
					if (propOptions.viewportRelevant) {
						getPropValue(component, property);
					}
					if (value !== undefined)
						rule.append(
							postcss.decl({
								prop: property.name,
								value: value
							})
						);
				}
			}
			return rule;
		}

		// generate rules for .mesh-container
		function getContainerRules(grid) {
			updateSettings(grid);
			const rules = [];

			rules.push(
				getComponentRules(grid, {
					component: "container",
					selector: `.${settings.name}-container`
				})
			);

			// const containerRules = postcss.rule();
			// containerRules.selector = `.${settings.name}-container`;

			// // set display
			// containerRules.append(postcss.decl({ prop: "display", value: "block" }));
			// // set margin
			// containerRules.append(postcss.decl({ prop: "margin", value: "0 auto" }));
			// // set max-width
			// containerRules.append(
			// 	postcss.decl({ prop: "max-width", value: grid["container-width"] })
			// );
			// // set padding
			// if (settings.gutterOnOutside) {
			// 	containerRules.append(
			// 		postcss.decl({ prop: "padding", value: `0 ${settings.gutter}px` })
			// 	);
			// }
			// // set position
			// containerRules.append(
			// 	postcss.decl({ prop: "position", value: "relative" })
			// );
			// // set width
			// containerRules.append(postcss.decl({ prop: "width", value: "100%" }));

			// rules.push(containerRules);

			for (const key in grid.sortedViewports) {
				const curViewport = grid.sortedViewports[key];
				updateSettings(curViewport);
				const atRule = getAtRule();
				atRule.append(
					getComponentRules(curViewport, {
						component: "container",
						selector: `.${settings.name}-container`
					})
				);
				rules.push(atRule);
			}

			return rules;
		}

		// generate rules for .mesh-void
		function getVoidRules(grid) {
			updateSettings(grid);
			const rules = [];
			const voidAfterRule = postcss.rule();
			const voidRule = postcss.rule();
			voidAfterRule.selector = `.${settings.name}-void:after`;
			voidRule.selector = `.${settings.name}-void`;

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

			for (const key in grid.sortedViewports) {
				const curViewport = grid.sortedViewports[key];
				updateSettings(curViewport);
				const atRule = getAtRule();
				// atRule.append(
				// 	getComponentRules(curViewport, {
				// 		component: "void",
				// 		selector: `.${settings.name}-void`
				// 	})
				// );
				rules.push(atRule);
			}

			return rules;
		}

		// generate rules for .mesh-column
		function getColumnRules(grid) {
			updateSettings(grid);
			const rules = [];
			const pushRule = postcss.rule();
			const pullRule = postcss.rule();
			const columnRule = postcss.rule();
			pushRule.selector = `[class*="${settings.name}-push"]`;
			pullRule.selector = `[class*="${settings.name}-pull"]`;
			columnRule.selector = `[class*="${settings.name}-column"]`;

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
				const value = (settings.gutter / 375) * 100;
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
			pushRule.append(postcss.decl({ prop: "position", value: "relative" }));
			pullRule.append(postcss.decl({ prop: "position", value: "relative" }));

			if (getDisplaySettings(grid).property === "float")
				columnRule.append(postcss.decl({ prop: "min-height", value: "1px" }));
			rules.push(pushRule, pullRule, columnRule);

			for (let i = 0; i <= settings.columnCount; i++) {
				const offsetRule = postcss.rule();
				const pushRule = postcss.rule();
				const pullRule = postcss.rule();
				const columnRule = postcss.rule();
				const index = i;
				offsetRule.selector = `.${settings.name}-offset-${index}`;
				pushRule.selector = `.${settings.name}-push-${index}`;
				pullRule.selector = `.${settings.name}-pull-${index}`;
				columnRule.selector = `.${settings.name}-column-${index}`;
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

			for (const key in grid.sortedViewports) {
				const currentViewport = grid.sortedViewports[key];
				updateSettings(currentViewport);
				const viewportName = currentViewport.name;
				const atRule = postcss.atRule();
				atRule.name = `media (${settings.queryCondition.value} : ${
					settings.viewportWidth
				}px)`;

				// settings.columnSingleWidth = 100 / settings.columnCount;

				// common viewport rules
				const columnRule = postcss.rule();
				columnRule.selector = `[class*="${
					settings.name
				}-column-${viewportName}"]`;

				//set padding
				if (settings.responsivePadding) {
					const value = (settings.gutter / settings.calcedContainerWidth) * 100;
					columnRule.append(
						postcss.decl({ prop: "padding", value: `0 ${value}%` })
					);
				} else {
					columnRule.append(
						postcss.decl({ prop: "padding", value: `0 ${settings.gutter}px` })
					);
				}

				atRule.append(columnRule);

				for (let n = 0; n <= settings.columnCount; n++) {
					const offsetRule = postcss.rule();
					const pushRule = postcss.rule();
					const pullRule = postcss.rule();
					const columnRule = postcss.rule();
					const index = n;
					offsetRule.selector = `[class*="${
						settings.name
					}-offset-${viewportName}-${index}"]`;
					pushRule.selector = `[class*="${
						settings.name
					}-push-${viewportName}-${index}"]`;
					pullRule.selector = `[class*="${
						settings.name
					}-pull-${viewportName}-${index}"]`;
					columnRule.selector = `.${
						settings.name
					}-column-${viewportName}-${index}`;

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
				// 	getComponentRules(currentViewport, {
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
			const licenseNotification = postcss.comment();
			licenseNotification.text = `! Grid generated using ${name} v${version} | ${license} License | ${author} | github.com/SlimMarten/postcss-mesh `;

			// append licenseNotification
			mesh.append(licenseNotification);

			for (const key in inlineSettings) {
				const curGrid = inlineSettings[key];

				// overwirte name
				if (curGrid.name) settings.name = curGrid.name;

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
			// console.log(inlineSettings);
			generateCSS();
		}

		/*=====  End of global function  ======*/
		init();
	};
});
