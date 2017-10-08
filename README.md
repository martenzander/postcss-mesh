# postcss-mesh

[![npm version](https://img.shields.io/npm/v/postcss-mesh.svg)](https://www.npmjs.com/package/postcss-mesh)
[![npm download](https://img.shields.io/npm/dt/postcss-mesh.svg)](https://www.npmjs.com/package/postcss-mesh)

> [PostCSS](https://github.com/postcss/postcss) plugin to generate a completeley customizable grid

## Why Mesh ?!
I know there are a lot of different grid systems already out there and most of them are pretty good. But none of them is offering the whole bandwidth of possible options. E.g. I wanted to have the ability to switch between different `displayTypes` (float | inline-block | flex) as well as I wanted to be able to overwrite certain parameters like `gutter` or `columnCount` for specific viewports. That's how I came up with the idea to create my very own grid-system. Even though not every feature is fully supported yet, I thought I could share my work in progress. Another advantage of Mesh is that you are able to set as many different viewports and grids as you want and don't have to rely on a single config (e.g. how Bootstrap does).

> Features that are not supported yet: **columnJustify**, **columnAlign**

## Installation

```console
$ npm i postcss-mesh -D
```

## Grid Setup
This is what a basic Grid Setup using Mesh looks like:

```css
@mesh-grid-BASENAME{
	displayType: inline-block;
	gutter: 30px;
	columnCount: 12;
	containerWidth: fluid;
	compileDefaultClasses: true;
	mobileFirst: true;

	@mesh-viewport-VIEWPORTNAME1 {
		viewport: 1200px;
		containerWidth: 1170px;
	}

	@mesh-viewport-VIEWPORTNAME2 {
		...
	}

	@mesh-viewport-VIEWPORTNAME2 {
		...
	}
}
```

### @Rules

##### @mesh-grid-BASENAME
initiates a new grid where `BASENAME` schould be the name of the grid.
E.g. if you generate a grid using `@mesh-grid-myGrid{...}` the class of the container will look like this: `.myGrid-container{...}`

##### @mesh-viewport-VIEWPORTNAME
initiates a new breakpoint where `VIEWPORTNAME` should be the name of the viewport.
E.g. if you generate a grid using `@mesh-viewport-sm{...}` the class of a column for the specific breakpoint could look like this: `.myGrid-column-sm-12{...}`

### Properties
The mesh grid system is customizable via a bunch of different properties. **coulmnCount**, **coulmnJustify**, **coulmnAlign** and **gutter** can be overwritten for a specific viewport.
> **NOTICE:** Not every property is supported by all displayTypes. See the table below for more information.

| displayType         | float | inline-block | flex |
|---------------------|-------|--------------|------|
|      gutter         | yes   | yes          | yes  |
| columnAlign         | -     | yes          | yes  |
| columnCount         | yes   | yes          | yes  |
| columnJustify       | -     | yes          | yes  |
| containerWidth      | yes   | yes          | yes  |
| compileDefaultClass | yes   | yes          | yes  |
| mobileFirst         | yes   | yes          | yes  |
| viewport            | yes   | yes          | yes  |

**displayType**<br>
defines the grids display property // e.g. float | inline-block | flex

**gutter**<br>
sets space between columns // e.g. 30px

**columnAlign** (not supported yet)<br>
defines the columns vertical-align property // e.g. top | middle | bottom

**columnCount**<br>
defines the amount of columns // e.g. 12

**columnJustify** (not supported yet)<br>
defines the horizontal justification of columns // e.g. left | center | right | justify

**containerWidth**<br>
defines the containers max-width property for current viewport // e.g. 1170px | fluid

**compileDefaultClass**<br>
if set to true it compiles default classes // true | false

**mobileFirst**<br>
switches between "min-width" and "max-width" in media queries expressions // true | false

**viewport**<br>
is the breakpoint width for a specific viewport // e.g. 768px

### Usage
mesh works like any other common grid system. See the code below for a simple example.

```HTML
<!-- container to center the grid on your page -->
<div class="myGrid-container">
    <!-- additional wrapper to void column padding -->
    <div class="myGrid-void">
        <!-- columns with breakpoint specific size -->
        <div class="myGrid-column-12 myGrid-column-sm-4"></div>
        <div class="myGrid-column-12 myGrid-column-sm-4"></div>
        <div class="myGrid-column-12 myGrid-column-sm-4"></div>
    </div>
</div>
```

### Roadmap
* set styles via includes so one does not have to use and compile the default classes
* columnJustify
* columnAlign
* displayType: **grid**