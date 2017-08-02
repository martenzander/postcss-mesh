var postcss = require( 'postcss' );
module.exports = postcss.plugin( 'postcss-mesh', function ( options ) {

	return function ( input ) {
		/*===============================================
		=            constants and variables            =
		===============================================*/

		// default settings
		var defaultSettings = {
			gutter: '30px',
			display: 'inline-block',
			columns: '12',
			containerWidth: 'fluid',
			mobileFirst : true,

			viewports:{
				xlg: {
					containerWidth: '1440px',
					viewport: '1560px',
				},
				lg: {
					containerWidth: '1140px',
					viewport: '1200px',
				},
				md: {
					containerWidth: '930px',
					viewport: '1024px',
				},
				sm: {
					containerWidth: '510px',
					viewport: '768px',
				},
			},
		};

		// postcss.config.js settings
		var configSettings = options || {};

		// inline css settings
		var inlineSettings = {};

		// final grid settings
		var mergedSettings = {};
		mergedSettings.sortedViewports = {};

		// viewport order reference
		var tempSortedViewports = [];

		// generated CSS
		var mesh = postcss.root();

		// mobile first or desktop first
		var queryCondition = '';

		/*=====  End of constants and variables  ======*/

		/*=======================================
		=            global function            =
		=======================================*/

		// retrieve css inline settings
		function getInlineSettings(){
			inlineSettings.viewports = {};

			input.walkAtRules( function ( rule ) {
				// return if at-rule does not match 'mesh-settings'
				if(!/^mesh-settings/.test(rule.name)) return;
				rule.walkDecls( function ( decl ) {
					if(!/^mesh-viewport-/.test(decl.parent.name)){
						inlineSettings[decl.prop] = decl.value;
					}else{
						var viewport = decl.parent.name.split('-')[decl.parent.name.split('-').length - 1];
						inlineSettings.viewports[viewport] = inlineSettings.viewports[viewport] || {};
						inlineSettings.viewports[viewport][decl.prop] = decl.value;
					}
				});
				// remove inline at-rules
				rule.remove();
			});

			return inlineSettings;
		}

		// merge all setting inputs to final grid settings
		function mergeFinalSettings(){
			inlineSettings = getInlineSettings();

			// merge settings
			for( var key in defaultSettings){
				var curDefaultProperty = defaultSettings[key];
				var curConfigProperty = configSettings[key];
				var curInlineProperty = inlineSettings[key];

				mergedSettings[key] = curDefaultProperty;
				if( curConfigProperty !== undefined ) mergedSettings[key] = curConfigProperty;
				if( curInlineProperty !== undefined ) mergedSettings[key] = curInlineProperty;
			}

			// sort viewports
			for (var key in mergedSettings.viewports){
				var currentViewport = mergedSettings.viewports[key];
				var currentBreakpoint = currentViewport.viewport;
					 currentBreakpoint = parseInt(currentBreakpoint.substring(0, currentBreakpoint.length - 2));
				tempSortedViewports.push(currentBreakpoint);
			}

			tempSortedViewports = mergedSettings.mobileFirst === 'true' ? tempSortedViewports.sort(function(a, b){return a - b}) : tempSortedViewports.sort(function(a, b){return b - a});

			for (var i = 0; i < tempSortedViewports.length; i++){
				var breakpoint = tempSortedViewports[i];

				var relatedViewport = {};

				for(var key in mergedSettings.viewports){
					var currentSetting = mergedSettings.viewports[key];
					var currentViewport = currentSetting.viewport;
					var currentBreakpoint = parseInt(currentViewport.substring(0,currentViewport.length - 2));

					if(currentBreakpoint === breakpoint) {
						relatedViewport = currentSetting
						relatedViewport.name = key;

						mergedSettings.sortedViewports[key] = relatedViewport;
					};
				}
			}

			// set queryCondition based on mobile first property
			queryCondition = mergedSettings.mobileFirst === 'true' ? 'min-width' : 'max-width';
		}

		function getMediaQuery(viewport, width){
			var atRule = postcss.atRule();
			var rule = postcss.rule();
			rule.selector = '.mesh-container';
			atRule.name = `media (${queryCondition} : ${viewport})`;
			rule.append(postcss.decl({prop : 'max-width' , value : width }));
			atRule.append(rule);
			return atRule;
		}

		// generate rules for .mesh-container
		function getMeshContainerRules(){
			var rules = [];
			var meshContainerRules = postcss.rule();
			meshContainerRules.selector = '.mesh-container';

			// set display
			meshContainerRules.append(postcss.decl({prop:'display', value: 'block'}));
			// set margin
			meshContainerRules.append(postcss.decl({prop:'margin', value: '0 auto'}));
			// set max-width
			mergedSettings['containerWidth'] == 'fluid' ? meshContainerRules.append(postcss.decl({prop:'max-width', value: '100%'})) : meshContainerRules.append(postcss.decl({prop:'max-width', value: mergedSettings['width']}));
			// set padding
			var gutterSize = parseInt(mergedSettings['gutter'].substring(0,mergedSettings['gutter'].length - 1));
			meshContainerRules.append(postcss.decl({prop:'padding',value: `0 ${gutterSize/2}px` }));
			// set position
			meshContainerRules.append(postcss.decl({prop:'position',value:'relative'}));
			// set width
			meshContainerRules.append(postcss.decl({prop:'width', value: '100%'}));

			rules.push(meshContainerRules);

			for (var key in mergedSettings.sortedViewports){
				var currentViewport = mergedSettings.sortedViewports[key];
				var breakpoint = currentViewport.viewport;
				var maxWidth = currentViewport.containerWidth;
				var atRule = postcss.atRule();
				atRule.name = `media (${queryCondition} : ${breakpoint})`;
				// update properties
				if("gutter" in currentViewport) gutterSize = parseInt(currentViewport.gutter.substring(0,currentViewport.gutter.length - 1)) || gutter;

				// common viewport rules
				var meshContainerRule = postcss.rule();
					 meshContainerRule.selector = `.mesh-container`;

				// set padding
				meshContainerRule.append(postcss.decl({prop:'padding', value: `0 ${gutterSize/2}px`}));
				// set max-width
				meshContainerRule.append(postcss.decl({prop : 'max-width' , value : maxWidth }));

				atRule.append(meshContainerRule);

				rules.push(atRule);
			}

			return rules;
		}

		// generate rules for .mesh-collapse
		function getMeshCollapseRules(){
			var rules = [];
			var meshCollapseRule = postcss.rule();
			meshCollapseRule.selector = '.mesh-collapse';

			// set display
			meshCollapseRule.append(postcss.decl({prop:'display', value: 'block'}));
			// set margin
			var gutterSize = parseInt(mergedSettings['gutter'].substring(0,mergedSettings['gutter'].length - 1));
			meshCollapseRule.append(postcss.decl({prop:'margin', value: `0 -${gutterSize/2}px`}));

			rules.push(meshCollapseRule);

			for (var key in mergedSettings.sortedViewports){
				var currentViewport = mergedSettings.sortedViewports[key];
				var breakpoint = currentViewport.viewport;
				var atRule = postcss.atRule();
				atRule.name = `media (${queryCondition} : ${breakpoint})`;
				// update properties
				if("gutter" in currentViewport) gutterSize = parseInt(currentViewport.gutter.substring(0,currentViewport.gutter.length - 1)) || gutter;

				// common viewport rules
				var meshCollapseRule = postcss.rule();
					 meshCollapseRule.selector = `.mesh-collapse`;

				// set margin
				meshCollapseRule.append(postcss.decl({prop:'margin', value: `0 -${gutterSize/2}px`}));

				atRule.append(meshCollapseRule);

				rules.push(atRule);
			}

			return rules;
		}

		// generate rules for .mesh-column
		function getMeshColumnRules(){
			var rules = [];
			var meshColumnBaseRule = postcss.rule();
				 meshColumnBaseRule.selector = `[class*="mesh-column"]`;
			var displayType = mergedSettings.display;
			var columns = mergedSettings.columns;
			var gutterSize = parseInt(mergedSettings['gutter'].substring(0,mergedSettings['gutter'].length - 1));
			var columnSingleWidth = 100/columns;

			// set display
			meshColumnBaseRule.append(postcss.decl({prop:'display', value: `${displayType}`}));
			// set padding
			meshColumnBaseRule.append(postcss.decl({prop:'padding', value: `0 ${gutterSize/2}px`}));

			for(var i = 0; i < columns; i++){

				var meshColumnDefaultRule = postcss.rule();
				meshColumnDefaultRule.selector = `.mesh-column-${i+1}`;
				// set width
				meshColumnDefaultRule.append(postcss.decl({prop:'width',value: `${columnSingleWidth * (i+1)}%`}));

				rules.push(meshColumnDefaultRule);
			}

			rules.push(meshColumnBaseRule);

			for (var key in mergedSettings.sortedViewports){
				var currentViewport = mergedSettings.sortedViewports[key];
				var viewportName = currentViewport.name;
				var breakpoint = currentViewport.viewport;
				var atRule = postcss.atRule();
				atRule.name = `media (${queryCondition} : ${breakpoint})`;
				// update properties
				columns = currentViewport.columns || columns;
				if("gutter" in currentViewport) gutterSize = parseInt(currentViewport.gutter.substring(0,currentViewport.gutter.length - 1)) || gutter;

				// common viewport rules
				var meshColumnRule = postcss.rule();
					 meshColumnRule.selector = `[class*="mesh-column-${viewportName}"]`;

				// set padding
				meshColumnRule.append(postcss.decl({prop:'padding', value: `0 ${gutterSize/2}px`}));

				atRule.append(meshColumnRule);

				columnSingleWidth = 100/columns;

				for(var i = 0; i < columns; i++){

					var meshColumnRule = postcss.rule();
					meshColumnRule.selector = `.mesh-column-${viewportName}-${i+1}`;
					// set width
					meshColumnRule.append(postcss.decl({prop:'width',value: `${columnSingleWidth * (i+1)}%`}));

					atRule.append(meshColumnRule);
				}

				rules.push(atRule);
			}

			return rules;
		}

		// generate styles for base classes
		function generateCSS(){

			// append .mesh-container base styles
			mesh.append(getMeshContainerRules());
			// append .mesh-collapse base styles
			mesh.append(getMeshCollapseRules());
			// append .mesh-column base styles
			mesh.append(getMeshColumnRules());

			input.append(mesh);
		}

		// main init
		function init(){
			mergeFinalSettings();
			generateCSS();
		}

		/*=====  End of global function  ======*/

		init();
	};
} );