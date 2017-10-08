var postcss = require( 'postcss' );
var meta = require('./package.json');
var name = meta.name;
var version = meta.version;
var author = meta.author;
var license = meta.license;

module.exports = postcss.plugin( 'postcss-mesh', function ( options ) {

	return function ( input ) {
		/*===============================================
		=            constants and variables            =
		===============================================*/

		// inline css settings
		var inlineSettings = {};

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

			input.walkAtRules( function ( rule ) {
				// return if at-rule does not match 'mesh-grid-'
				if(!/^mesh-grid-/.test(rule.name)) return;
				var gridName = rule.name.split('-')[rule.name.split('-').length - 1];
				inlineSettings[gridName] = {};
				inlineSettings[gridName].name = gridName;
				inlineSettings[gridName].viewports = {};

				rule.walkDecls( function ( decl ) {
					if(!/^mesh-viewport-/.test(decl.parent.name)){
						inlineSettings[gridName][decl.prop] = decl.value;
					}else{
						var viewport = decl.parent.name.split('-')[decl.parent.name.split('-').length - 1];
						inlineSettings[gridName].viewports[viewport] = inlineSettings[gridName].viewports[viewport] || {};
						inlineSettings[gridName].viewports[viewport][decl.prop] = decl.value;
					}
				});
				// remove inline at-rules
				rule.remove();
			});


			// sort viewports
			for (var n in inlineSettings){
				var currentGrid = inlineSettings[n];
					 currentGrid.sortedViewports = {};
				var tempSortedViewports = [];

				for (var i in currentGrid.viewports){
					var currentViewport = currentGrid.viewports[i];
					var currentBreakpoint = currentViewport.viewport;
						 currentBreakpoint = parseInt(currentBreakpoint.substring(0, currentBreakpoint.length - 2));
					tempSortedViewports.push(currentBreakpoint);
				}

				tempSortedViewports = currentGrid.mobileFirst === 'true' ? tempSortedViewports.sort(function(a, b){return a - b}) : tempSortedViewports.sort(function(a, b){return b - a});

				for (var i = 0; i < tempSortedViewports.length; i++){
					var breakpoint = tempSortedViewports[i];

					var relatedViewport = {};

					for(var j in currentGrid.viewports){
						var currentSetting = currentGrid.viewports[j];
						var currentViewport = currentSetting.viewport;
						var currentBreakpoint = parseInt(currentViewport.substring(0,currentViewport.length - 2));

						if(currentBreakpoint === breakpoint) {
							relatedViewport = currentSetting
							relatedViewport.name = j;

							currentGrid.sortedViewports[j] = relatedViewport;
						};
					}
				}
			}

			return inlineSettings;
		}

		// get display Type
		function getDisplaySettings(grid){
			var displayProperty = grid.displayType === 'float' ? 'float' : 'display';
			var displayValue = grid.displayType === 'float' ? 'left' : grid.displayType;

			return {property : displayProperty, value : displayValue};
		}

		// generate rules for .mesh-container
		function getMeshContainerRules(grid){
			var rules = [];
			var meshContainerRules = postcss.rule();
			var name = grid.name;
			meshContainerRules.selector = `.${name}-container`;

			// set display
			meshContainerRules.append(postcss.decl({prop:'display', value: 'block'}));
			// set margin
			meshContainerRules.append(postcss.decl({prop:'margin', value: '0 auto'}));
			// set max-width
			grid['containerWidth'] == 'fluid' ? meshContainerRules.append(postcss.decl({prop:'max-width', value: '100%'})) : meshContainerRules.append(postcss.decl({prop:'max-width', value: grid['containerWidth']}));
			// set padding
			var gutterSize = parseInt(grid['gutter'].substring(0,grid['gutter'].length - 1));
			meshContainerRules.append(postcss.decl({prop:'padding',value: `0 ${gutterSize/2}px` }));
			// set position
			meshContainerRules.append(postcss.decl({prop:'position',value:'relative'}));
			// set width
			meshContainerRules.append(postcss.decl({prop:'width', value: '100%'}));

			rules.push(meshContainerRules);

			for (var key in grid.sortedViewports){
				var currentViewport = grid.sortedViewports[key];
				var breakpoint = currentViewport.viewport;
				var maxWidth = currentViewport.containerWidth;
				var atRule = postcss.atRule();
				atRule.name = `media (${queryCondition} : ${breakpoint})`;
				// update properties
				if("gutter" in currentViewport) gutterSize = parseInt(currentViewport.gutter.substring(0,currentViewport.gutter.length - 1)) || gutter;

				// common viewport rules
				var meshContainerRule = postcss.rule();
					meshContainerRule.selector = `.${name}-container`;

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
		function getMeshVoidRules(grid){
			var rules = [];
			var name = grid.name;
			var meshVoidAfterRule = postcss.rule();
			var meshVoidRule = postcss.rule();
				meshVoidAfterRule.selector = `.${name}-void:after`;
				meshVoidRule.selector = `.${name}-void`;

			// set content
			meshVoidAfterRule.append(postcss.decl({prop:'content', value: `""` }));
			// set clear
			meshVoidAfterRule.append(postcss.decl({prop:'clear', value: 'both'}));
			// set display
			meshVoidAfterRule.append(postcss.decl({prop:'display', value: 'block'}));
			if( getDisplaySettings(grid).value === 'flex' ){
				meshVoidRule.append(postcss.decl({prop:'display', value: 'flex'}));
				meshVoidRule.append(postcss.decl({prop:'flex-wrap', value: 'wrap'}));
			} else {
				meshVoidRule.append(postcss.decl({prop:'display', value: 'block'}));
			}
			// set margin
			var gutterSize = parseInt(grid['gutter'].substring(0,grid['gutter'].length - 1));
			meshVoidRule.append(postcss.decl({prop:'margin', value: `0 -${gutterSize/2}px`}));
			// set font-size
			if( getDisplaySettings(grid).value === 'inline-block' ) meshVoidRule.append(postcss.decl({prop:'font-size', value: '0'}));
			// set display

			if( getDisplaySettings(grid).property === 'float' ) rules.push(meshVoidAfterRule);
			rules.push(meshVoidRule);

			for (var key in grid.sortedViewports){
				var currentViewport = grid.sortedViewports[key];
				var breakpoint = currentViewport.viewport;
				var atRule = postcss.atRule();
				atRule.name = `media (${queryCondition} : ${breakpoint})`;
				// update properties
				if("gutter" in currentViewport) gutterSize = parseInt(currentViewport.gutter.substring(0,currentViewport.gutter.length - 1)) || gutter;

				// common viewport rules
				var meshVoidRule = postcss.rule();
					 meshVoidRule.selector = `.${name}-void`;

				// set margin
				meshVoidRule.append(postcss.decl({prop:'margin', value: `0 -${gutterSize/2}px`}));

				atRule.append(meshVoidRule);

				rules.push(atRule);
			}

			return rules;
		}

		// generate rules for .mesh-column
		function getMeshColumnRules(grid){
			var rules = [];
			var name = grid.name;
			var meshCenterRule = postcss.rule();
			var meshPushRule = postcss.rule();
			var meshPullRule = postcss.rule();
			var meshColumnRule = postcss.rule();
				meshCenterRule.selector = `[class*="${name}-center"]`;
				meshPushRule.selector = `[class*="${name}-push"]`;
				meshPullRule.selector = `[class*="${name}-pull"]`;
				meshColumnRule.selector = `[class*="${name}-column"]`;
			var columns = grid.columnCount;
			var gutterSize = parseInt(grid['gutter'].substring(0,grid['gutter'].length - 1));
			var columnSingleWidth = 100/columns;


			// set displayProperty
			if( getDisplaySettings(grid).value !== 'flex' ) meshColumnRule.append(postcss.decl({prop: getDisplaySettings(grid).property, value: getDisplaySettings(grid).value}));
			// set padding
			meshColumnRule.append(postcss.decl({prop:'padding', value: `0 ${gutterSize/2}px`}));
			// set vertical-align
			if(getDisplaySettings(grid).value === 'inline-block') meshColumnRule.append(postcss.decl({prop:'vertical-align', value: `top`}));
			//set position
			meshCenterRule.append(postcss.decl({prop:'position', value: `relative`}));
			meshPushRule.append(postcss.decl({prop:'position', value: `relative`}));
			meshPullRule.append(postcss.decl({prop:'position', value: `relative`}));
			// set left
			meshCenterRule.append(postcss.decl({prop:'left', value: `50%`}));
			// set transform
			meshCenterRule.append(postcss.decl({prop:'transform', value: `translate3d(-50%,0,0)`}));

			if( getDisplaySettings(grid).property === 'float' ) meshColumnRule.append(postcss.decl({prop:'min-height', value: `1px`}));
			rules.push(meshCenterRule, meshPushRule, meshPullRule, meshColumnRule);

			for(var i = 0; i < columns; i++){
				var meshOffsetRule = postcss.rule();
				var meshPushRule = postcss.rule();
				var meshPullRule = postcss.rule();
				var meshColumnRule = postcss.rule();
				    meshOffsetRule.selector = `.${name}-offset-${i+1}`;
				    meshPushRule.selector = `.${name}-push-${i+1}`;
				    meshPullRule.selector = `.${name}-pull-${i+1}`;
				    meshColumnRule.selector = `.${name}-column-${i+1}`;
				// set width
				meshOffsetRule.append(postcss.decl({prop:'margin-left',value: `${columnSingleWidth * (i+1)}%`}));
				meshPushRule.append(postcss.decl({prop:'left',value: `${columnSingleWidth * (i+1)}%`}));
				meshPullRule.append(postcss.decl({prop:'right',value: `${columnSingleWidth * (i+1)}%`}));
				meshColumnRule.append(postcss.decl({prop:'width',value: `${columnSingleWidth * (i+1)}%`}));

				rules.push(meshOffsetRule, meshPushRule, meshPullRule, meshColumnRule);
			}

			for (var key in grid.sortedViewports){
				var currentViewport = grid.sortedViewports[key];
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
					 meshColumnRule.selector = `[class*="${name}-column-${viewportName}"]`;

				//set padding
				meshColumnRule.append(postcss.decl({prop:'padding', value: `0 ${gutterSize/2}px`}));

				atRule.append(meshColumnRule);


				for(var i = 0; i < columns; i++){
					var meshOffsetRule = postcss.rule();
					var meshPushRule = postcss.rule();
					var meshPullRule = postcss.rule();
					var meshColumnRule = postcss.rule();
					meshOffsetRule.selector = `[class*="${name}-offset-${viewportName}-${i+1}"]`;
					meshPushRule.selector = `[class*="${name}-push-${viewportName}-${i+1}"]`;
					meshPullRule.selector = `[class*="${name}-pull-${viewportName}-${i+1}"]`;
					meshColumnRule.selector = `.${name}-column-${viewportName}-${i+1}`;

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

		// generate styles for base classes
		function generateCSS(){
			var licenseNotification = postcss.comment();
			 	 licenseNotification.text = `! Grid generated using ${name} v${version} | ${license} License | ${author} | github.com/SlimMarten/postcss-mesh `;

		 	// append licenseNotification
			mesh.append(licenseNotification);

			for(var key in inlineSettings){
				var currentGrid = inlineSettings[key];
				queryCondition = currentGrid.mobileFirst === 'true' ? 'min-width' : 'max-width';

				if( JSON.parse(currentGrid.compileDefaultClasses) ){

					// append .mesh-container base styles
					mesh.append(getMeshContainerRules(currentGrid));
					// append .mesh-void base styles
					mesh.append(getMeshVoidRules(currentGrid));
					// append .mesh-column base styles
					mesh.append(getMeshColumnRules(currentGrid));
				}
			}

			input.prepend(mesh);
		}

		// main init
		function init(){
			inlineSettings = getInlineSettings();
			generateCSS();
		}

		/*=====  End of global function  ======*/
		init();
	};
} );