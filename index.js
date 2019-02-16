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
const basicComponents = ["push", "push-basic", "pull", "pull-basic", "column", "offset", "void:after"];

function updateSettings(obj) {
	// columnAlign
	if ("column-align" in obj) settings.columnAlign = obj["column-align"];

	// displaySettings
	settings.displaySettings = getDisplaySettings(obj);

	// void
	settings.void.display.value = settings.displayType.value === "flex" ? "flex" : "block";
	settings.void["font-size"].value = settings.displayType.value === "inline-block" ? "0" : undefined;

	// gutter
	if ("gutter" in obj) settings.gutter = parseInt(obj.gutter.substring(0, obj.gutter.length - 1)) / 2;

	// gutterOnOutside
	if ("gutter-on-outside" in obj) settings.gutterOnOutside = obj["gutter-on-outside"] === "true" ? true : false;

	// responsiveGutter
	if ("responsive-gutter" in obj) {
		settings.responsiveGutter = obj["responsive-gutter"] === "true" ? true : false;

		settings.gutterUnit = settings.responsiveGutter ? "%" : "px";
	}

	// containerWidth
	if ("container-width" in obj) {
		settings.containerWidth = obj["container-width"];
		settings.calcedContainerWidth = getCalcedContainerWidth(obj);
	}

	// viewportWidth
	if ("viewport" in obj) settings.viewportWidth = parseInt(obj.viewport.substring(0, obj.viewport.length - 1));

	// viewportName
	settings.viewportName = obj.name;

	// columnCount
	if ("column-count" in obj) settings.columnCount = parseInt(obj["column-count"]);

	// columnSingleWidth
	settings.columnSingleWidth = 100 / settings.columnCount;

	// naming
	const namingProps = ["span", "offset", "void", "container", "push", "pull"];
	for (let i = 0; i < namingProps.length; i++) {
		const namingProp = `naming-${namingProps[i]}`;
		if (namingProp in obj) settings[namingProp] = obj[namingProp];
	}

	if ("use-name-prefix" in obj) settings["use-name-prefix"] = obj["use-name-prefix"] == "true";

	// exclude-columns
	if ("exclude-columns" in obj) settings["exclude-columns"] = obj["exclude-columns"].split(",").map(col => parseInt(col));
}

function updateColumnWidth(fac) {
	settings.columnWidth = `${settings.columnSingleWidth * fac}%`;
}

function getGutterValue(property, referenceWidth) {
	let value = settings[property.options.globalKey];
	value = settings.responsiveGutter ? (value / Math.floor(referenceWidth)) * 100 : value;
	value = `${value}${settings.gutterUnit}`;
	return value;
}

function getAtRule() {
	const atRule = postcss.atRule();
	atRule.name = `media (${settings.queryCondition.value} : ${settings.viewportWidth}px)`;

	return atRule;
}

function getPropValue(component, property) {
	let value;

	function defaultValue() {
		value = property.options["value"] ? property.options.value : settings[property.options.globalKey];
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
						? getGutterValue(property, settings.calcedContainerWidth / fac - settings.gutter * 2)
						: getGutterValue(property, (settings.calcedContainerWidth + settings.gutter * 2) / fac - settings.gutter * 2);
					value = value.substring(0, value.length - 1);
					value = `0 -${value}${settings.gutterUnit}`;
					value = settings.responsiveGutter ? value : `0 -${settings.gutter}${settings.gutterUnit}`;
				}
				break;
			case "void":
				{
					if (property.name.indexOf("margin") >= 0) {
						value = settings.gutterOnOutside
							? getGutterValue(property, settings.calcedContainerWidth - settings.gutter * 2)
							: getGutterValue(property, settings.calcedContainerWidth);
						value = `-${value}`;
					} else if ((property.name == "flex-wrap" || property.name == "align-items") && settings.displayType.value !== "flex") {
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
					: getGutterValue(property, settings.calcedContainerWidth + settings.gutter * 2);
				break;
			case "column:nested":
				{
					let percentage = property.index / settings.columnCount;
					let fac = 1 / percentage;
					value = settings.gutterOnOutside
						? getGutterValue(property, settings.calcedContainerWidth / fac)
						: getGutterValue(property, (settings.calcedContainerWidth + settings.gutter * 2) / fac);
					value = value.substring(0, value.length - 1);
					value = `0 ${value}${settings.gutterUnit}`;
					value = settings.responsiveGutter ? value : `0 ${settings.gutter}${settings.gutterUnit}`;
				}
				break;
			case "column-basic":
				{
					const excludeFlexProps = ["vertical-align", "display", "min-height", "float"];
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
							: getGutterValue(property, settings.calcedContainerWidth + settings.gutter * 2);
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
			options: props[key],
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
					value: value,
				})
			);
		}
	}
	return rule;
}

function getSelectorByType(type, data = {}) {
	const namingPatterns = {
		"naming-column": "|NAME||COLUMN|",
		"naming-column-span": "|NAME||COLUMN|-|SPAN|",
		"naming-column-mq": "|NAME||COLUMN|-|MQ|",
		"naming-column-mq-span": "|NAME||COLUMN|-|MQ|-|SPAN|",
		"naming-offset": "|NAME||OFFSET|",
		"naming-offset-span": "|NAME||OFFSET|-|SPAN|",
		"naming-offset-mq": "|NAME||OFFSET|-|MQ|",
		"naming-offset-mq-span": "|NAME||OFFSET|-|MQ|-|SPAN|",
		"naming-container": "|NAME||CONTAINER|",
		"naming-void": "|NAME||VOID|",
		"naming-push": "|NAME||PUSH|",
		"naming-push-span": "|NAME||PUSH|-|SPAN|",
		"naming-push-mq-span": "|NAME||PUSH|-|MQ|-|SPAN|",
		"naming-pull": "|NAME||PULL|",
		"naming-pull-span": "|NAME||PULL|-|SPAN|",
		"naming-pull-mq-span": "|NAME||PULL|-|MQ|-|SPAN|",
	};

	const useNamePrefix = settings["use-name-prefix"];

	const haveMQ = data.mq != null;
	const haveSpan = data.span != null;
	const haveSpanMQ = haveSpan && haveMQ;

	let pattern;
	switch (true) {
		case type == "container": {
			pattern = namingPatterns["naming-container"];
			break;
		}
		case type == "void": {
			pattern = namingPatterns["naming-void"];
			break;
		}
		case type == "push": {
			if (haveSpanMQ) {
				pattern = namingPatterns["naming-push-mq-span"];
			} else if (haveSpan) {
				pattern = namingPatterns["naming-push-span"];
			} else {
				pattern = namingPatterns["naming-push"];
			}
			break;
		}
		case type == "pull": {
			if (haveSpanMQ) {
				pattern = namingPatterns["naming-pull-mq-span"];
			} else if (haveSpan) {
				pattern = namingPatterns["naming-pull-span"];
			} else {
				pattern = namingPatterns["naming-pull"];
			}
			break;
		}
	}
	if (pattern == null) {
		switch (true) {
			case haveSpanMQ: {
				pattern = namingPatterns[`naming-${type}-mq-span`];
				break;
			}
			case haveMQ: {
				pattern = namingPatterns[`naming-${type}-mq`];
				break;
			}
			case haveSpan: {
				pattern = namingPatterns[`naming-${type}-span`];
				break;
			}
			default: {
				pattern = namingPatterns[`naming-${type}`];
			}
		}
	}

	let selector = pattern.replace(/\|SPAN\|/gm, data.span).replace(/\|MQ\|/gm, data.mq);

	selector = selector
		.replace(/\|COLUMN\|/gm, settings["naming-span"])
		.replace(/\|OFFSET\|/gm, settings["naming-offset"])
		.replace(/\|VOID\|/gm, settings["naming-void"])
		.replace(/\|CONTAINER\|/gm, settings["naming-container"])
		.replace(/\|PUSH\|/gm, settings["naming-push"])
		.replace(/\|PULL\|/gm, settings["naming-pull"]);

	if (useNamePrefix) {
		selector = selector.replace(/\|NAME\|/gm, `${settings.name}-`);
	} else {
		selector = selector.replace(/\|NAME\|/gm, "");
	}

	return selector;
}

function excludeColumn(column) {
	return settings["exclude-columns"].includes(column);
}

function getRules(grid) {
	updateSettings(grid);
	const rules = [];

	rules.push(
		// container
		getComponentRules(grid, {
			component: "container",
			selector: `.${getSelectorByType("container")}`,
		}),
		// void
		getComponentRules(grid, {
			component: "void",
			selector: `.${getSelectorByType("void")}`,
		}),
		// push-basic
		getComponentRules(grid, {
			component: "push-basic",
			selector: `[class*="${getSelectorByType("push")}"]`,
		}),
		// pull-basic
		getComponentRules(grid, {
			component: "pull-basic",
			selector: `[class*="${getSelectorByType("pull")}"]`,
		}),
		// column-basic
		getComponentRules(grid, {
			component: "column-basic",
			selector: `[class*="${getSelectorByType("column", { name: settings.name })}"]`,
		})
	);

	// void:after
	if (settings.displayType.value === "float") {
		rules.push(
			getComponentRules(grid, {
				component: "void:after",
				selector: `.${getSelectorByType("void")}:after`,
			})
		);
	}

	for (let i = 0; i <= settings.columnCount; i++) {
		updateColumnWidth(i);

		if (i !== 0 && !excludeColumn(i)) {
			rules.push(
				// column
				getComponentRules(grid, {
					component: "column",
					selector: `.${getSelectorByType("column", { span: i })}`,
				}),
				// column-x column
				getComponentRules(grid, {
					component: "column:nested",
					selector: `[class*="${getSelectorByType("column", {
						span: i,
					})}"] [class*="${getSelectorByType("column", { name: settings.name })}"]`,
					index: i,
				}),
				// column-x void
				getComponentRules(grid, {
					component: "void:nested",
					selector: `[class*="${getSelectorByType("column", { span: i })}"] .${getSelectorByType("void")}`,
					index: i,
				})
			);
		}

		rules.push(
			// push
			getComponentRules(grid, {
				component: "push",
				selector: `.${getSelectorByType("push", { span: i })}`,
			}),
			// pull
			getComponentRules(grid, {
				component: "pull",
				selector: `.${getSelectorByType("pull", { span: i })}`,
			}),
			// offset
			getComponentRules(grid, {
				component: "offset",
				selector: `.${getSelectorByType("offset", { span: i })}`,
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
				selector: `.${getSelectorByType("container")}`,
			}),
			// void
			getComponentRules(curViewport, {
				component: "void",
				selector: `.${getSelectorByType("void")}`,
			}),
			// column-basic
			getComponentRules(curViewport, {
				component: "column-basic",
				selector: `[class*="${getSelectorByType("column", { mq: settings.viewportName })}"]`,
			})
		);

		for (let i = 0; i <= settings.columnCount; i++) {
			updateColumnWidth(i);

			if (i !== 0 && !excludeColumn(i)) {
				atRule.append(
					// column
					getComponentRules(curViewport, {
						component: "column",
						selector: `.${getSelectorByType("column", { span: i, mq: settings.viewportName })}`,
					}),
					// column-x column
					getComponentRules(grid, {
						component: "column:nested",
						selector: `[class*="${getSelectorByType("column", {
							span: i,
							mq: settings.viewportName,
						})}"] [class*="${getSelectorByType("column")}"]`,
						index: i,
					}),
					// column-x void
					getComponentRules(grid, {
						component: "void:nested",
						selector: `[class*="${getSelectorByType("column", {
							span: i,
							mq: settings.viewportName,
						})}"] .${getSelectorByType("void")}`,
						index: i,
					})
				);
			}

			atRule.append(
				// push HIER
				getComponentRules(curViewport, {
					component: "push",
					selector: `.${getSelectorByType("push", { mq: settings.viewportName, span: i })}`,
				}),
				// pull
				getComponentRules(curViewport, {
					component: "pull",
					selector: `.${getSelectorByType("pull", { mq: settings.viewportName, span: i })}`,
				}),
				// offset
				getComponentRules(curViewport, {
					component: "offset",
					selector: `.${getSelectorByType("offset", { span: i, mq: settings.viewportName })}`,
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
				if (curGrid["query-condition"]) settings.queryCondition.value = curGrid["query-condition"];

				// set displayType
				if ("display-type" in curGrid && settings.displayType.options.indexOf(curGrid["display-type"]) > -1) {
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
