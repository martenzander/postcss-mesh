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
			width: 'fluid',
			viewports:{
				xlg: {
					width: '1440px',
					viewport: '1560px',
				},
				lg: {
					width: '1140px',
					viewport: '1200px',
				},
				md: {
					width: '930px',
					viewport: '1024px',
				},
				sm: {
					width: '510px',
					viewport: '768px',
				}
			},
		};

		// postcss.config.js settings
		var configSettings = options || {};

		// inline css settings
		var inlineSettings = {};

		// final grid settings
		var mergedSettings = {};

		// generated CSS
		var mesh = postcss.root();

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

			for( var key in defaultSettings){
				var curDefaultProperty = defaultSettings[key];
				var curConfigProperty = configSettings[key];
				var curInlineProperty = inlineSettings[key];

				mergedSettings[key] = curDefaultProperty;
				if( curConfigProperty !== undefined ) mergedSettings[key] = curConfigProperty;
				if( curInlineProperty !== undefined ) mergedSettings[key] = curInlineProperty;
			}
		}

		function getMediaQuery(viewport, width){
			var atRule = postcss.atRule();
			var rule = postcss.rule();
			rule.selector = '.mesh-container';
			atRule.name = `media (min-width : ${viewport})`;
			rule.append(postcss.decl({prop : 'max-width' , value : width }));
			atRule.append(rule);
			return atRule;
		}

		function generateCSS(){
			var meshContainer = postcss.root();
			var meshBaseStyles = postcss.rule();
			meshBaseStyles.selector = '.mesh-container';

			// set display
			meshBaseStyles.append(postcss.decl({prop:'display', value: 'block'}));
			// set margin
			meshBaseStyles.append(postcss.decl({prop:'margin', value: '0 auto'}));
			// set max-width
			mergedSettings['width'] == 'fluid' ? meshBaseStyles.append(postcss.decl({prop:'max-width', value: '100%'})) : meshBaseStyles.append(postcss.decl({prop:'max-width', value: mergedSettings['width']}));
			// set padding
			var gutterSize = parseInt(mergedSettings['gutter'].substring(0,mergedSettings['gutter'].length - 1));
			meshBaseStyles.append(postcss.decl({prop:'padding',value: `${gutterSize/2}px` }));
			// set position
			meshBaseStyles.append(postcss.decl({prop:'position',value:'relative'}));
			// set width
			meshBaseStyles.append(postcss.decl({prop:'width', value: '100%'}));

			// append .mesh-container base styles
			meshContainer.append(meshBaseStyles);

			for(var key in mergedSettings.viewports){
				meshContainer.append(getMediaQuery(mergedSettings.viewports[key].viewport,mergedSettings.viewports[key].width));
			}


			mesh.append(meshContainer);
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