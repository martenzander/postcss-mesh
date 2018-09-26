<h3 align="center">
Mesh
</h3>
<p align="center">
Lightweight Grid Compiler for <a href="https://github.com/postcss/postcss">PostCSS</a>
</p>
<p align="center">
<a href="https://www.npmjs.com/package/postcss-mesh" rel="nofollow"><img src="https://img.shields.io/npm/v/postcss-mesh.svg" alt="Slack" data-canonical-src="https://img.shields.io/npm/v/postcss-mesh.svg" style="max-width:100%;"></a>
<a href="https://www.npmjs.com/package/postcss-mesh" rel="nofollow"><img src="https://img.shields.io/npm/dt/postcss-mesh.svg" alt="Slack" data-canonical-src="https://img.shields.io/npm/dt/postcss-mesh.svg" style="max-width:100%;"></a>
</p>

<h2>Table of contents</h2>

- [About Mesh](#about-mesh)
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
    - [Push](#push)
    - [Pull](#pull)
    - [Offset](#offset)
- [Properties](#properties)
- [Common Grid Features](#common-grid-features)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Grid Setup](#grid-setup)
  - [@Rules](#rules)
      - [@mesh-grid{}](#mesh-grid)
      - [@mesh-viewport-VIEWPORTNAME](#mesh-viewport-viewportname)
  - [Usage](#usage)

## About Mesh

I know there are a lot of different grid systems already out there and most of them are pretty good. But ☝️ none of them is offering the whole bandwidth of possible options. E.g. I wanted to have the ability to switch between different [display-types](#Properties) _(float || inline-block || flex)_ as well as I wanted to be able to overwrite certain parameters like [gutter](#Properties) or [column-count](#Properties) breakpointwise. That's how I came up with the idea to create my very own grid compiler and **Mesh** was born 🎉.

## Unique Selling Points

#### Responsive Gutter

Set the [responsive-gutter](#properties) property to `true` and `margins` & `paddings` of all [Components](#components) (except [Container](#container)) will be calculated on a percentage basis. This means not only the column's width will scale but the gap between two columns to guarantee a true fluid layout.

_Notice: This feature only allows to inherit the root columns gap to the first nested level._

#### Gutter On Outside

Allows you to toggle the [Container's](#container) padding which is based on the [gutter](#properties)-Size.

#### Mobile First || Desktop First

You can decide if your default viewport is a desktop one or a mobile one using the [query-condition](#properties) property. This property takes `min-width` or `max-width` as an argument. If set to `min-width` your default viewport will be a mobile one. As soon as your screen's width hits the next bigger width defined in all of your breakpoints, it snaps to the related breakpoint.

#### Unlimited Breakpoints

Bootstrap comes with five predefined breakpoints (Extra small _<576px_, Small _≥576px_, Medium _≥768px_, Large _≥992px_, Extra Large _≥1200px_). These breakpoints have proved its worth over time. But nevertheless, sometimes your design requires more individual breakpoints. In this case **Mesh** is your best friend. With **Mesh** you can define as many or as less breakpoints as you want.

#### Property Overwrite

## Components

Lorem ipsum dolor sit amet.

<h3 align="center">Basic Components</h3>

#### Container

```css
.mesh-container {
}
```

#### Void

```css
.mesh-void {
}
```

#### Column

```css
.mesh-column-x {
}
// or
.mesh-column-viewport-x {
}
```

<h3 align="center">Transform Components</h3>

#### Push

```css
.mesh-push-x {
}
// or
.mesh-push-viewport-x {
}
```

#### Pull

```css
.mesh-pull-x {
}
// or
.mesh-pull-viewport-x {
}
```

#### Offset

```css
.mesh-offset-x {
}
// or
.mesh-offset-viewport-x {
}
```

## Properties

**Mesh** is based on a bunch of properties you can adjust to your needs. Some of them are overwriteable in each defined breakpoint.

<table>
  <thead>
    <tr>
      <th align="left">Property</th><th align="left">Description</th><th align="left">Default</th><th align="left">Required Options</th><th align="left">Overwriteable</th>
    </tr>
  </thead>
  <tbody>
    <!-- <tr><th colspan="5" align="center">Basic Properties</th></tr> -->
    <!-- <tr><th colspan="5" align="center">Viewport-Relevant Properties</th></tr> -->
    <tr><td><code>column-align</code></td><td>Aligns all columns at the <code>top</code>, <code>middle</code> or <code>bottom</code> of a row</td><td><code>top</code></td><td><code>top</code> || <code>middle</code> || <code>bottom</code></td><td>yes</td></tr>
    <tr><td><code>column-count</code></td><td>Defines how many columns fit in one row</td><td><code>12</code></td><td><code>int</code></td><td>yes</td></tr>
    <tr><td><code>compile-default-classes</code></td><td>If set to <code>false</code> Mesh won't compile the current's grid classes</td><td><code>true</code></td><td><code>true</code> || <code>false</code><td>-</td></tr>
    <tr><td><code>container-width</code></td><td>Defines the containers <code>max-width</code> property for current viewport</td><td>none</td><td><code>px</code> or <code>%</code></td><td>yes</td></tr>
    <tr><td><code>display-type</code></td><td>Defines if the grid is based on inline-block columns, floated columns or flexed columns</td><td><code>inline-block</code></td><td><code>inline-block</code> || <code>float</code> || <code>flex</code><td>-</td></tr>
    <tr><td><code>gutter</code></td><td>Sets the gap between columns</td><td><code>30px</code></td><td><code>px</code></td><td>yes</td></tr>
    <tr><td><code>gutter-on-outside</code></td><td>If set to <code>false</code> the container won't have a padding</td><td><code>true</code></td><td><code>true</code> || <code>false</code></td><td>yes</td></tr>
    <tr><td><code>name</code></td><td>Sets the grid's name and adjusts the component's class prefix</td><td><code>mesh</code></td><td><code>string</code></td><td>-</td></tr>
    <tr><td><code>query-condition</code></td><td>Using this property you can decide if you want the compiled styles to be mobile first or desktop first</td><td><code>min-width</code></td><td><code>min-width</code> || <code>max-width</code><td>-</td></tr>
    <tr><td><code>responsive-gutter</code></td><td>If set to `true` paddings and margins of column and void components will be calculated on a percentage basis</td><td><code>true</code></td><td><code>true</code> || <code>false</code></td><td>yes</td></tr>
    <tr><td><code>viewport</code></td><td>Defines the screen's width at which a new media-query should be initiated</td><td>none</td><td><code>px</code></td><td>yes</td></tr>
  </tbody>
</table>

## Common Grid Features

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

### @Rules

##### @mesh-grid{}

initiates a new grid.

##### @mesh-viewport-VIEWPORTNAME

initiates a new breakpoint where `VIEWPORTNAME` should be the name of the viewport.
E.g. if you generate a grid using `@mesh-viewport-sm{...}` the class of a column for the specific breakpoint could look like this: `.myGrid-column-sm-12{...}`

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
