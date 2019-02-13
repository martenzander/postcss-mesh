const postcss = require("postcss");
const meta = require("./package.json");
const name = meta.name;
const settings = require("./lib/settings.json");
const version = meta.version;
const author = meta.author.name;
const license = meta.license;
const getDisplaySettings = require("./utils/getDisplaySettings");
const getCalcedContainerWidth = require("./utils/getCalcedContainerWidth");
const getInlineSettings = require("./utils/getInlineSettings");
const valueConversion = require("./lib/valueConversion.json");
const basicComponents = [
	"push",
	"push-basic",
	"pull",
	"pull-basic",
	"column",
	"offset",
	"void:after"
];

function updateSettings(obj) {
	// columnAlign
	if ("column-align" in obj) settings.columnAlign = obj["column-align"];

	// displaySettings
	settings.displaySettings = getDisplaySettings(obj);

	// void
	settings.void.display.value =
		settings.displayType.value === "flex" ? "flex" : "block";
	settings.void["font-size"].value =
		settings.displayType.value === "inline-block" ? "0" : undefined;

	// gutter
	if ("gutter" in obj)
		settings.gutter =
			parseInt(obj.gutter.substring(0, obj.gutter.length - 1)) / 2;

	// gutterOnOutside
	if ("gutter-on-outside" in obj)
		settings.gutterOnOutside =
			obj["gutter-on-outside"] === "true" ? true : false;

	// responsiveGutter
	if ("responsive-gutter" in obj) {
		settings.responsiveGutter =
			obj["responsive-gutter"] === "true" ? true : false;

		settings.gutterUnit = settings.responsiveGutter ? "%" : "px";
	}

	// containerWidth
	if ("container-width" in obj) {
		settings.containerWidth = obj["container-width"];
		settings.calcedContainerWidth = getCalcedContainerWidth(obj);
	}

	// viewportWidth
	if ("viewport" in obj)
		settings.viewportWidth = parseInt(
			obj.viewport.substring(0, obj.viewport.length - 1)
		);

	// viewportName
	settings.viewportName = obj.name;

	// columnCount
	if ("column-count" in obj)
		settings.columnCount = parseInt(obj["column-count"]);

	// columnSingleWidth
	settings.columnSingleWidth = 100 / settings.columnCount;
}

function updateColumnWidth(fac) {
	settings.columnWidth = `${settings.columnSingleWidth * fac}%`;
}

function getGutterValue(property, referenceWidth) {
	let value = settings[property.options.globalKey];
	value = settings.responsiveGutter
		? (value / Math.floor(referenceWidth)) * 100
		: value;
	value = `${value}${settings.gutterUnit}`;
	return value;
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

	function defaultValue() {
		value = property.options["value"]
			? property.options.value
			: settings[property.options.globalKey];
	}

	if (basicComponents.indexOf(component) >= 0) {
		defaultValue();
	} else {
		switch (component) {
			case "container":
				if (property.name.indexOf("padding") >= 0) {
					value = settings.gutterOnOutside ? `${settings.gutter}px` : undefined;
				} else {
					defaultValue();
				}
				break;
			case "void:nested":
				{
					let percentage = property.index / settings.columnCount;
					let fac = 1 / percentage;
					value = settings.gutterOnOutside
						? getGutterValue(
							property,
							settings.calcedContainerWidth / fac - settings.gutter * 2
						  )
						: getGutterValue(
							property,
							(settings.calcedContainerWidth + settings.gutter * 2) / fac -
									settings.gutter * 2
						  );
					value = value.substring(0, value.length - 1);
					value = `0 -${value}${settings.gutterUnit}`;
					value = settings.responsiveGutter
						? value
						: `0 -${settings.gutter}${settings.gutterUnit}`;
				}
				break;
			case "void":
				{
					if (property.name.indexOf("margin") >= 0) {
						value = settings.gutterOnOutside
							? getGutterValue(
								property,
								settings.calcedContainerWidth - settings.gutter * 2
							  )
							: getGutterValue(property, settings.calcedContainerWidth);
						value = `-${value}`;
					} else if (
						(property.name == "flex-wrap" || property.name == "align-items") &&
						settings.displayType.value !== "flex"
					) {
						value = undefined;
					} else if (property.name.indexOf("align-items") >= 0) {
						value = valueConversion[settings[property.options.globalKey]];
					} else {
						defaultValue();
					}
				}
				break;
			case "column:padding":
				value = settings.gutterOnOutside
					? getGutterValue(property, settings.calcedContainerWidth)
					: getGutterValue(
						property,
						settings.calcedContainerWidth + settings.gutter * 2
					  );
				break;
			case "column:nested":
				{
					let percentage = property.index / settings.columnCount;
					let fac = 1 / percentage;
					value = settings.gutterOnOutside
						? getGutterValue(property, settings.calcedContainerWidth / fac)
						: getGutterValue(
							property,
							(settings.calcedContainerWidth + settings.gutter * 2) / fac
						  );
					value = value.substring(0, value.length - 1);
					value = `0 ${value}${settings.gutterUnit}`;
					value = settings.responsiveGutter
						? value
						: `0 ${settings.gutter}${settings.gutterUnit}`;
				}
				break;
			case "column-basic":
				{
					const excludeFlexProps = [
						"vertical-align",
						"display",
						"min-height",
						"float"
					];
					const excludeInlineBlockProps = ["vertical-align", "display"];
					const excludeFloatProps = ["min-height", "float"];
					let excludeProps;
					switch (settings.displayType.value) {
						case "inline-block":
							excludeProps = excludeFloatProps;
							break;
						case "float":
							excludeProps = excludeInlineBlockProps;
							break;
						case "flex":
							excludeProps = excludeFlexProps;
							break;
					}
					if (excludeProps.indexOf(property.name) >= 0) return undefined;

					if (property.name.indexOf("padding") >= 0) {
						value = settings.gutterOnOutside
							? getGutterValue(property, settings.calcedContainerWidth)
							: getGutterValue(
								property,
								settings.calcedContainerWidth + settings.gutter * 2
							  );
					} else {
						defaultValue();
					}
				}
				break;
		}
	}

	return value;
}

function getComponentRules(viewport, options) {
	const component = options.component;
	const props = settings[component];
	const rule = postcss.rule();
	rule.selector = options.selector;

	for (const key in props) {
		const property = {
			name: key,
			options: props[key]
		};
		if (options.index) property.index = options.index;
		const propOptions = props[property.name];
		let value;

		if ("viewports" in viewport) {
			value = getPropValue(component, property);
		} else if (propOptions.viewportRelevant) {
			value = getPropValue(component, property);
		}
		if (value !== undefined) {
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

function getRules(grid) {
	updateSettings(grid);
	const rules = [];

	rules.push(
		// container
		getComponentRules(grid, {
			component: "container",
			selector: `.${settings.name}-container`
		}),
		// void
		getComponentRules(grid, {
			component: "void",
			selector: `.${settings.name}-void`
		}),
		// push-basic
		getComponentRules(grid, {
			component: "push-basic",
			selector: `[class*="${settings.name}-push"]`
		}),
		// pull-basic
		getComponentRules(grid, {
			component: "pull-basic",
			selector: `[class*="${settings.name}-pull"]`
		}),
		// column-basic
		getComponentRules(grid, {
			component: "column-basic",
			selector: `[class*="${settings.name}-column"]`
		})
	);

	// void:after
	if (settings.displayType.value === "float") {
		rules.push(
			getComponentRules(grid, {
				component: "void:after",
				selector: `.${settings.name}-void:after`
			})
		);
	}

	for (let i = 0; i <= settings.columnCount; i++) {
		updateColumnWidth(i);

		if (i !== 0) {
			rules.push(
				// column
				getComponentRules(grid, {
					component: "column",
					selector: `.${settings.name}-column-${i}`
				}),
				// column-x column
				getComponentRules(grid, {
					component: "column:nested",
					selector: `[class*="${settings.name}-column-${i}"] [class*="${
						settings.name
					}-column"]`,
					index: i
				}),
				// column-x void
				getComponentRules(grid, {
					component: "void:nested",
					selector: `[class*="${settings.name}-column-${i}"] .${
						settings.name
					}-void`,
					index: i
				})
			);
		}

		rules.push(
			// push
			getComponentRules(grid, {
				component: "push",
				selector: `.${settings.name}-push-${i}`
			}),
			// pull
			getComponentRules(grid, {
				component: "pull",
				selector: `.${settings.name}-pull-${i}`
			}),
			// offset
			getComponentRules(grid, {
				component: "offset",
				selector: `.${settings.name}-offset-${i}`
			})
		);
	}

	for (const key in grid.sortedViewports) {
		const curViewport = grid.sortedViewports[key];
		updateSettings(curViewport);
		const atRule = getAtRule();

		atRule.append(
			// container
			getComponentRules(curViewport, {
				component: "container",
				selector: `.${settings.name}-container`
			}),
			// void
			getComponentRules(curViewport, {
				component: "void",
				selector: `.${settings.name}-void`
			}),
			// column-basic
			getComponentRules(curViewport, {
				component: "column-basic",
				selector: `[class*="${settings.name}-column-${settings.viewportName}"]`
			})
		);

		for (let i = 0; i <= settings.columnCount; i++) {
			updateColumnWidth(i);

			if (i !== 0) {
				atRule.append(
					// column
					getComponentRules(curViewport, {
						component: "column",
						selector: `.${settings.name}-column-${settings.viewportName}-${i}`
					}),
					// column-x column
					getComponentRules(grid, {
						component: "column:nested",
						selector: `[class*="${settings.name}-column-${
							settings.viewportName
						}-${i}"] [class*="${settings.name}-column"]`,
						index: i
					}),
					// column-x void
					getComponentRules(grid, {
						component: "void:nested",
						selector: `[class*="${settings.name}-column-${
							settings.viewportName
						}-${i}"] .${settings.name}-void`,
						index: i
					})
				);
			}

			atRule.append(
				// push
				getComponentRules(curViewport, {
					component: "push",
					selector: `.${settings.name}-push-${settings.viewportName}-${i}`
				}),
				// pull
				getComponentRules(curViewport, {
					component: "pull",
					selector: `.${settings.name}-pull-${settings.viewportName}-${i}`
				}),
				// offset
				getComponentRules(curViewport, {
					component: "offset",
					selector: `.${settings.name}-offset-${settings.viewportName}-${i}`
				})
			);
		}

		rules.push(atRule);
	}

	return rules;
}

module.exports = postcss.plugin("postcss-mesh", function() {
	return function(input) {
		// inline css settings
		let inlineSettings = {};

		// generated CSS
		const mesh = postcss.root();

		// generate styles for base classes
		function generateCSS() {
			const licenseNotification = postcss.comment();
			licenseNotification.text = `! Grid generated using ${name} v${version} | ${license} License | ${author} | github.com/SlimMarten/postcss-mesh `;

			// append licenseNotification
			mesh.append(licenseNotification);

			for (const key in inlineSettings) {
				const curGrid = inlineSettings[key];

				// set name
				if (curGrid.name) settings.name = curGrid.name;

				// set queryCondition
				if (curGrid["query-condition"])
					settings.queryCondition.value = curGrid["query-condition"];

				// set displayType
				if (
					"display-type" in curGrid &&
					settings.displayType.options.indexOf(curGrid["display-type"]) > -1
				) {
					settings.displayType.value = curGrid["display-type"];
				}

				if (JSON.parse(curGrid["compile"])) mesh.append(getRules(curGrid));
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
