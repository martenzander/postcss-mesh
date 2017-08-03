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

		function getDisplaySettings(){
			var displayProperty = mergedSettings.display === 'float' ? 'float' : 'display';
			var displayValue = mergedSettings.display === 'float' ? 'left' : mergedSettings.display;

			return {property : displayProperty, value : displayValue};
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

		// generate rules for .mesh-void
		function getMeshVoidRules(){
			var rules = [];
			var meshVoidAfterRule = postcss.rule();
			var meshVoidRule = postcss.rule();
				 meshVoidAfterRule.selector = '.mesh-void:after';
				 meshVoidRule.selector = '.mesh-void';

			// set content
			meshVoidAfterRule.append(postcss.decl({prop:'content', value: ''}));
			// set clear
			meshVoidAfterRule.append(postcss.decl({prop:'clear', value: 'both'}));
			// set display
			meshVoidAfterRule.append(postcss.decl({prop:'display', value: 'block'}));
			meshVoidRule.append(postcss.decl({prop:'display', value: 'block'}));
			// set margin
			var gutterSize = parseInt(mergedSettings['gutter'].substring(0,mergedSettings['gutter'].length - 1));
			meshVoidRule.append(postcss.decl({prop:'margin', value: `0 -${gutterSize/2}px`}));
			// set font-size
			if( getDisplaySettings().value === 'inline-block' ) meshVoidRule.append(postcss.decl({prop:'font-size', value: '0'}));

			if( getDisplaySettings().property === 'float' ) rules.push(meshVoidAfterRule);
			rules.push(meshVoidRule);

			for (var key in mergedSettings.sortedViewports){
				var currentViewport = mergedSettings.sortedViewports[key];
				var breakpoint = currentViewport.viewport;
				var atRule = postcss.atRule();
				atRule.name = `media (${queryCondition} : ${breakpoint})`;
				// update properties
				if("gutter" in currentViewport) gutterSize = parseInt(currentViewport.gutter.substring(0,currentViewport.gutter.length - 1)) || gutter;

				// common viewport rules
				var meshVoidRule = postcss.rule();
					 meshVoidRule.selector = `.mesh-void`;

				// set margin
				meshVoidRule.append(postcss.decl({prop:'margin', value: `0 -${gutterSize/2}px`}));

				atRule.append(meshVoidRule);

				rules.push(atRule);
			}

			return rules;
		}

		// generate rules for .mesh-column
		function getMeshColumnRules(){
			var rules = [];
			var meshCenterRule = postcss.rule();
			var meshPushRule = postcss.rule();
			var meshPullRule = postcss.rule();
			var meshColumnRule = postcss.rule();
				 meshCenterRule.selector = `[class*="mesh-center"]`;
				 meshPushRule.selector = `[class*="mesh-push"]`;
				 meshPullRule.selector = `[class*="mesh-pull"]`;
				 meshColumnRule.selector = `[class*="mesh-column"]`;
			var columns = mergedSettings.columns;
			var gutterSize = parseInt(mergedSettings['gutter'].substring(0,mergedSettings['gutter'].length - 1));
			var columnSingleWidth = 100/columns;


			// set displayProperty
			meshColumnRule.append(postcss.decl({prop: getDisplaySettings().property, value: getDisplaySettings().value}));
			// set padding
			meshColumnRule.append(postcss.decl({prop:'padding', value: `0 ${gutterSize/2}px`}));
			// set vertical-align
			if(getDisplaySettings().property === 'display') meshColumnRule.append(postcss.decl({prop:'vertical-align', value: `top`}));
			//set position
			meshCenterRule.append(postcss.decl({prop:'position', value: `relative`}));
			meshPushRule.append(postcss.decl({prop:'position', value: `relative`}));
			meshPullRule.append(postcss.decl({prop:'position', value: `relative`}));
			// set left
			meshCenterRule.append(postcss.decl({prop:'left', value: `50%`}));
			// set transform
			meshCenterRule.append(postcss.decl({prop:'transform', value: `translate3d(-50%,0,0)`}));

			rules.push(meshCenterRule, meshPushRule, meshPullRule, meshColumnRule);

			for(var i = 0; i < columns; i++){
				var meshOffsetRule = postcss.rule();
				var meshPushRule = postcss.rule();
				var meshPullRule = postcss.rule();
				var meshColumnRule = postcss.rule();
				    meshOffsetRule.selector = `.mesh-offset-${i+1}`;
				    meshPushRule.selector = `.mesh-push-${i+1}`;
				    meshPullRule.selector = `.mesh-pull-${i+1}`;
				    meshColumnRule.selector = `.mesh-column-${i+1}`;
				// set width
				meshOffsetRule.append(postcss.decl({prop:'margin-left',value: `${columnSingleWidth * (i+1)}%`}));
				meshPushRule.append(postcss.decl({prop:'left',value: `${columnSingleWidth * (i+1)}%`}));
				meshPullRule.append(postcss.decl({prop:'right',value: `${columnSingleWidth * (i+1)}%`}));
				meshColumnRule.append(postcss.decl({prop:'width',value: `${columnSingleWidth * (i+1)}%`}));

				rules.push(meshOffsetRule, meshPushRule, meshPullRule, meshColumnRule);
			}

			for (var key in mergedSettings.sortedViewports){
				var currentViewport = mergedSettings.sortedViewports[key];
				var viewportName = currentViewport.name;
				var breakpoint = currentViewport.viewport;
				var atRule = postcss.atRule();
				atRule.name = `media (${queryCondition} : ${breakpoint})`;
				// update properties
				columnSingleWidth = 100/columns;
				columns = currentViewport.columns || columns;
				if("gutter" in currentViewport) gutterSize = parseInt(currentViewport.gutter.substring(0,currentViewport.gutter.length - 1)) || gutter;

				// common viewport rules
				var meshColumnRule = postcss.rule();
					 meshColumnRule.selector = `[class*="mesh-column-${viewportName}"]`;

				//set padding
				meshColumnRule.append(postcss.decl({prop:'padding', value: `0 ${gutterSize/2}px`}));

				atRule.append(meshColumnRule);


				for(var i = 0; i < columns; i++){
					var meshOffsetRule = postcss.rule();
					var meshPushRule = postcss.rule();
					var meshPullRule = postcss.rule();
					var meshColumnRule = postcss.rule();
					meshOffsetRule.selector = `[class*="mesh-offset-${viewportName}-${i+1}"]`;
					meshPushRule.selector = `[class*="mesh-push-${viewportName}-${i+1}"]`;
					meshPullRule.selector = `[class*="mesh-pull-${viewportName}-${i+1}"]`;
					meshColumnRule.selector = `.mesh-column-${viewportName}-${i+1}`;

					// set width/offset
					meshOffsetRule.append(postcss.decl({prop:'margin-left',value: `${columnSingleWidth * (i+1)}%`}));
					meshPushRule.append(postcss.decl({prop:'left',value: `${columnSingleWidth * (i+1)}%`}));
					meshPullRule.append(postcss.decl({prop:'right',value: `${columnSingleWidth * (i+1)}%`}));
					meshColumnRule.append(postcss.decl({prop:'width',value: `${columnSingleWidth * (i+1)}%`}));

					atRule.append(meshOffsetRule,meshPushRule,meshPullRule,meshColumnRule);
				}

				rules.push(atRule);
			}

			return rules;
		}

		function getIncludeRules(){
			var rules = [];

			var prototype = postcss.atRule();
				 prototype.name = `mixin test`;

			var content = postcss.atRule();
				 content.name = `content`;

			prototype.append(content);

			return prototype;
		}

		// generate styles for base classes
		function generateCSS(){
			var licenseNotification = postcss.comment();
			 	 licenseNotification.text = "! Grid generated with postcss-mesh v1.0.0 | MIT License | github.com/SlimMarten/postcss-mesh "

		 	// append licenseNotification
			mesh.append(licenseNotification);
			// append includes
			mesh.append(getIncludeRules());
			// append .mesh-container base styles
			mesh.append(getMeshContainerRules());
			// append .mesh-void base styles
			mesh.append(getMeshVoidRules());
			// append .mesh-column base styles
			mesh.append(getMeshColumnRules());

			input.prepend(mesh);
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