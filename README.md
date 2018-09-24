<h1 align="center">Mesh</h1>
<p align="center">
<a href="https://github.com/postcss/postcss">PostCSS</a> plugin to generate a completeley customizable grid<br>
<a href="https://www.npmjs.com/package/postcss-mesh" rel="nofollow"><img src="https://img.shields.io/npm/v/postcss-mesh.svg" alt="Slack" data-canonical-src="https://img.shields.io/npm/v/postcss-mesh.svg" style="max-width:100%;"></a>
<a href="https://www.npmjs.com/package/postcss-mesh" rel="nofollow"><img src="https://img.shields.io/npm/dt/postcss-mesh.svg" alt="Slack" data-canonical-src="https://img.shields.io/npm/dt/postcss-mesh.svg" style="max-width:100%;"></a>
</p>

## Unique Selling Points

I know there are a lot of different grid systems already out there and most of them are pretty good. But none of them is offering the whole bandwidth of possible options. E.g. I wanted to have the ability to switch between different `display-types` (float | inline-block | flex) as well as I wanted to be able to overwrite certain parameters like `gutter` or `column-count` for specific viewports. That's how I came up with the idea to create my very own grid-system. Even though not every feature is fully supported yet, I thought I could share my work in progress. Another advantage of Mesh is that you are able to set as many different viewports and grids as you want and don't have to rely on a single config (e.g. how Bootstrap does).

> Features that are not supported yet: **column-justify**, **column-align**

---

## Getting Started
### Installation

```console
$ npm i postcss-mesh
```
### Grid Setup

This is what a basic Grid Setup using Mesh looks like:

```css
@mesh-grid {
  name: mesh;
  display-type: inline-block;
  gutter: 30px;
  column-count: 12;
  container-width: fluid;
  compile-default-classes: true;
  mobile-first: true;

  @mesh-viewport-viewportname1 {
    viewport: 1200px;
    container-width: 1170px;
  }

  @mesh-viewport-viewportname2 {
    ...;
  }

  @mesh-viewport-viewportname2 {
    ...;
  }
}
```

---

### @Rules

##### @mesh-grid{}

initiates a new grid.

##### @mesh-viewport-VIEWPORTNAME

initiates a new breakpoint where `VIEWPORTNAME` should be the name of the viewport.
E.g. if you generate a grid using `@mesh-viewport-sm{...}` the class of a column for the specific breakpoint could look like this: `.myGrid-column-sm-12{...}`

---

### Properties

The mesh grid system is customizable via a bunch of different properties. **coulmnCount**, **coulmnJustify**, **coulmnAlign** and **gutter** can be overwritten for a specific viewport.

> **NOTICE:** Not every property is supported by all display-types. See the table below for more information.

| display-type | float | inline-block | flex |
| ------------ | ----- | ------------ | ---- |
| column-align | -     | yes          | yes  |


**display-type**<br>
defines the grids display property // e.g. float | inline-block | flex

**name**<br>
sets the grid's name and uses it as a prefix for generated styles

**gutter**<br>
sets space between columns // e.g. 30px

**column-align** (not supported yet)<br>
defines the columns vertical-align property // e.g. top | middle | bottom

**column-count**<br>
defines the amount of columns // e.g. 12

**column-justify** (not supported yet)<br>
defines the horizontal justification of columns // e.g. left | center | right | justify

**container-width**<br>
defines the containers max-width property for current viewport // e.g. 1170px | fluid

**compile-default-class**<br>
if set to true it compiles default classes // true | false

**mobile-first**<br>
switches between "min-width" and "max-width" in media queries expressions // true | false

**viewport**<br>
is the breakpoint width for a specific viewport // e.g. 768px

---

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

---

### Roadmap

- set styles via includes so one does not have to use and compile the default classes
- column-justify
- column-align
- optional responsive column paddings
- quantity based column classes
- root based column classes for nested columns
