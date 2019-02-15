<p align="center">
	<img src="https://raw.githubusercontent.com/SlimMarten/postcss-mesh/development/assets/img/logo.png" align="center">
<h3 align="center">
Mesh
</h3>
<p align="center">
Powerful Grid Compiler for <a href="https://github.com/postcss/postcss">PostCSS</a>
</p>
<p align="center">
<a href="https://www.npmjs.com/package/postcss-mesh" rel="nofollow"><img src="https://img.shields.io/npm/v/postcss-mesh.svg" alt="Slack" data-canonical-src="https://img.shields.io/npm/v/postcss-mesh.svg" style="max-width:100%;"></a>
<a href="https://www.npmjs.com/package/postcss-mesh" rel="nofollow"><img src="https://img.shields.io/npm/dt/postcss-mesh.svg" alt="Slack" data-canonical-src="https://img.shields.io/npm/dt/postcss-mesh.svg" style="max-width:100%;"></a>
</p>
</p>

<h2>Table of contents</h2>

- [About Mesh](#about-mesh)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Grid Setup](#grid-setup)
    - [SCSS](#scss)
    - [HTML](#html)
- [Unique Selling Points](#unique-selling-points)
    - [Responsive Gutter](#responsive-gutter)
    - [Gutter On Outside](#gutter-on-outside)
    - [Mobile First || Desktop First](#mobile-first--desktop-first)
    - [Unlimited Breakpoints](#unlimited-breakpoints)
    - [Property Overwrite](#property-overwrite)
- [Components](#components)
  - [Container](#container)
  - [Void](#void)
  - [Column](#column)
  - [Offset](#offset)
  - [Pull](#pull)
  - [Push](#push)
- [Nesting](#nesting)
- [Ordering](#ordering)
- [Properties](#properties)

## About Mesh

There are a lot of different grid systems already out there and most of them are pretty good. But ☝️ none of them is offering the whole bandwidth of possible options. E.g. I wanted to switch between a `flex`, `inline-block` or `float` based grid as well as I wanted to be able to overwrite certain parameters like [gutter](#properties) or [column-count](#properties) breakpointwise. That is how I came up with the idea to create my very own grid compiler and Mesh was born 🎉🎉🎉.

## Getting Started

### Installation

```console
$ npm i postcss-mesh
```

### Grid Setup

#### SCSS

Mesh is based on @-rules. To initiate a new grid use `@mesh-grid`. All breakpoints for a grid should be nested within the respective grid declaration. See the example below for a simple grid setup with bootstrap standards.

```css
@mesh-grid {
    column-count: 12;
    compile: true;
    container-width: 100%;
    display-type: float;
    gutter-on-outside: true;
    gutter: 30px;
    name: mesh;
    query-condition: min-width;
    responsive-gutter: false;

    @mesh-viewport-sm {
        container-width: 540px;
        viewport: 576px;
    }

    @mesh-viewport-md {
        container-width: 720px;
        viewport: 768px;
    }

    @mesh-viewport-lg {
        container-width: 960px;
        viewport: 992px;
    }

    @mesh-viewport-xl {
        container-width: 1140px;
        viewport: 1200px;
    }
}
```

#### HTML

```html
// This markup is a two column grid with equal widths // for all defined breakpoints.

<div class="mesh-container">
    <div class="mesh-void">
        <div class="mesh-column-6 mesh-column-sm-6 mesh-column-md-6 mesh-column-lg-6 mesh-column-xl-6"></div>
        <div class="mesh-column-6 mesh-column-sm-6 mesh-column-md-6 mesh-column-lg-6 mesh-column-xl-6"></div>
    </div>
</div>
```

<img width="100%" height="auto" src="https://raw.githubusercontent.com/SlimMarten/postcss-mesh/development/assets/img/examples/setup.png" align="center">

## Unique Selling Points

#### Responsive Gutter

Set the [responsive-gutter](#properties) property to `true` to scale the gutter as your [container](#container) grows. This makes your grid less static and more fluid. To make this feature work you have to set a `viewport` context even in your default settings of the grid.

_This feature inherits the gutter size for the first nested level only._

```css
// This set up uses 375px as context.
// If your screen is 375px wide the gap
// between your columns should be exact 30px.
// If your screen gets bigger, the gap scales up.
// If your screen gets smaller, the gap scales down.

@mesh-grid {
    viewport: 375px;
    gutter: 30px;
    responsive-gutter: true;
}
```

<h5>Regular Gutter</h5>
<img width="100%" height="auto" src="https://raw.githubusercontent.com/SlimMarten/postcss-mesh/development/assets/img/examples/non-responsive-gutter.gif" align="center">
<h5>Responsive Gutter</h5>
<img width="100%" height="auto" src="https://raw.githubusercontent.com/SlimMarten/postcss-mesh/development/assets/img/examples/responsive-gutter.gif" align="center">

#### Gutter On Outside

Allows you to toggle the [container's](#container) padding which is based on the [gutter](#properties) size.

```css
// true || false
// default: true

@mesh-grid {
    gutter-on-outside: true;
}
```

#### Mobile First || Desktop First

You can decide if your default viewport is a desktop one or a mobile one using the [query-condition](#properties) property. This property takes `min-width` or `max-width` as an argument. If set to `min-width` your default viewport will be a mobile one. As soon as your screen's width hits the next bigger width defined in all of your breakpoints, it snaps to the related breakpoint.

```css
// min-width || max-width
// default: min-width

@mesh-grid {
    query-condition: min-width;
}
```

#### Unlimited Breakpoints

Bootstrap comes with five predefined breakpoints (Extra small _<576px_, Small _≥576px_, Medium _≥768px_, Large _≥992px_, Extra Large _≥1200px_). These breakpoints have proved its worth over time. But nevertheless, sometimes your design requires more individual breakpoints. In this case Mesh is your best friend. With Mesh you can define as many or as less custom breakpoints as you want using the `@mesh-viewport-VIEWPORTNAME`-@-rule where `VIEWPORTNAME` is the viewport's ID. The ID is used in the viewport specific classes. E.g. `@mesh-viewport-lg` results in `.mesh-column-lg`-classes.

```css
// this is how you would define a standard large bootstrap breakpoint
// properties "container-width" & "viewport" are required

@mesh-viewport-lg {
    container-width: 960px;
    viewport: 992px;
}
```

#### Property Overwrite

Property Overwrite allows you to overwrite some properties breakpointwise, e.g. `gutter`. Learn more about properties [here](#properties).

```css
// default: 30px

@mesh-viewport-lg {
    gutter: 30px;
}
```

## Components

Mesh's compiled Grid is made of three basic components and three transform components. The basic components describe the `.mesh-container`, `.mesh-void` & `.mesh-column` classes. These components are necessary to set up a very basic grid. The transform components describe the `.mesh-offset`, `.mesh-pull` & `.mesh-push` classes. These components are necessary to transform a [column](#column) within your grid and should be added to a column component only. Using transform components you can reorder your columns.

### Container

The container is the most outer component of a grid instance. It sets up the maximum width of the grid and should not be nested.

```html
<div class="mesh-container"></div>
```

### Void

The void component is the equivalent to Bootstrap's `row` component and voids its parent's [gutter](#gutter). The only immediate child of a void component should be a [column](#column).

```html
<div class="mesh-void"></div>
```

### Column

The column component is where you can put your content. All columns should be an immediate child of a [void](#void) component. Replace `x` with a number between 1 and your given column-count.

```html
<!--
For breakpoint specific column widths include your
breakpoint's ID in the class, e.g. 'mesh-column-lg-6'.
-->

<div class="mesh-column-x"></div>
```

### Offset

The offset component will add a margin to the respective [column](#column) to create an even bigger gap between two columns. Using the component like below will offset the column about the width of a single column.

```html
<!--
For breakpoint specific column offsets include your
breakpoint's ID in the class, e.g. 'mesh-offset-lg-1'.
-->

<div class="mesh-offset-1"></div>
```

### Pull

The pull component will reposition the respective [column](#column) from the right. Using the component like below will pull the column about the width of a single column to the left.

```html
<!--
For breakpoint specific column pulls include your
breakpoint's ID in the class, e.g. 'mesh-pull-lg-1'.
-->

<div class="mesh-pull-1"></div>
```

### Push

The push component will reposition the respective [column](#column) from the left. Using the component like below will push the column about the width of a single column to the right.

```html
<!--
For breakpoint specific column pushes include your
breakpoint's ID in the class, e.g. 'mesh-push-lg-1'.
-->

<div class="mesh-push-1"></div>
```

## Nesting

Of course you can also nest your [columns](#column).

```html
<!--
This is how you can nest columns within columns.
If using "responsive-gutter" you can only go one
level deep keeping the roots gutter size.
-->

<div class="mesh-container">
    <div class="mesh-void">
        <div class="mesh-column-6"></div>
        <div class="mesh-column-6">
            <div class="mesh-void">
                <div class="mesh-column-6"></div>
                <div class="mesh-column-6"></div>
            </div>
        </div>
    </div>
</div>
```

<img width="100%" height="auto" src="https://raw.githubusercontent.com/SlimMarten/postcss-mesh/development/assets/img/examples/nesting.png" align="center">

## Ordering

Sometimes you have to switch position of certain [columns](#column) breakpointwise. Using [push](#push) and [pull](#pull) components you can shift your columns.

```html
<!--
This markup moves the first column by the width of
three columns to the right and the second column
by the width of nine columns to the left.
-->

<div class="mesh-container">
    <div class="mesh-void">
        <div class="mesh-column-9 mesh-push-3"></div>
        <div class="mesh-column-3 mesh-pull-9"></div>
    </div>
</div>
```

<img width="100%" height="auto" src="https://raw.githubusercontent.com/SlimMarten/postcss-mesh/development/assets/img/examples/ordering.png" align="center">

## Properties

Mesh is based on a bunch of properties you can adjust to your needs. Some of them are overwriteable in each defined breakpoint. See the table below to get an overview of what Mesh is offering.

<table>
  <thead>
    <tr>
      <th align="left">Property</th><th align="left">Description</th><th align="left">Options</th><th align="left">Overwrite</th>
    </tr>
  </thead>
  <tbody>
    <!-- <tr><th colspan="5" align="center">Basic Properties</th></tr> -->
    <!-- <tr><th colspan="5" align="center">Viewport-Relevant Properties</th></tr> -->
    <tr>
      <td><code>column-align</code></td>
      <td>Aligns all columns at the top, middle or bottom of a void.</td>
      <td><code>top</code> || <code>middle</code> || <code>bottom</code></td>
      <td>yes</td>
    </tr>
    <tr>
      <td><code>column-count</code></td>
      <td>Defines how many columns fit in one void.</td>
      <td><code>number</code></td>
      <td>yes</td>
    </tr>
    <tr>
      <td><code>compile</code></td>
      <td>If set to <code>false</code> Mesh won't compile classes of the current grid.</td>
      <td><code>true</code> || <code>false</code></td>
      <td>no</td>
    </tr>
    <tr>
      <td><code>container-width</code></td>
      <td>Defines the container's <code>max-width</code> property for current viewport.</td>
      <td><code>px</code> || <code>%</code></td>
      <td>yes</td>
    </tr>
    <tr>
      <td><code>display-type</code></td>
      <td>Defines if the grid is inline-block, float or flex based.</td>
      <td><code>inline-block</code> || <code>float</code> || <code>flex</code></td>
      <td>no</td>
    </tr>
    <tr>
      <td><code>gutter</code></td>
      <td>Sets the gap between columns.</td>
      <td><code>px</code></td>
      <td>yes</td>
    </tr>
    <tr>
      <td><code>gutter-on-outside</code></td>
      <td>If set to <code>false</code> the container won't have a padding.</td>
      <td><code>true</code> || <code>false</code></td>
      <td>yes</td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td>Sets the grid's name and adjusts the component's class prefix.</td>
      <td><code>string</code></td>
      <td>no</td>
    </tr>
    <tr>
      <td><code>query-condition</code></td>
      <td>Using this property you can decide if you want the compiled styles to be mobile first or desktop first.</td>
      <td><code>min-width</code> || <code>max-width</code></td>
      <td>no</td>
    </tr>
    <tr>
      <td><code>responsive-gutter</code></td>
      <td>If set to <code>true</code> the gutter scales as the container grows.</td>
      <td><code>true</code> || <code>false</code></td>
      <td>yes</td>
    </tr>
    <tr>
      <td><code>viewport</code></td>
      <td>Defines the screen's width at which a new media-query should be initiated.</td>
      <td><code>px</code></td>
      <td>yes</td>
    </tr>
  </tbody>
</table>
