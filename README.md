<h3 align="center">Mesh</h3>
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
    - [Unlimited Viewports](#unlimited-viewports)
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
- [Roadmap](#roadmap)

## About Mesh

I know there are a lot of different grid systems already out there and most of them are pretty good. But ☝️ none of them is offering the whole bandwidth of possible options. E.g. I wanted to have the ability to switch between different [display-type](#Properties) (float || inline-block || flex) as well as I wanted to be able to overwrite certain parameters like [gutter](#Properties) or [column-count](#Properties) viewportwise. That's how I came up with the idea to create my very own grid compiler and **Mesh** was born 🎉.

## Unique Selling Points

#### Responsive Gutter

Set the [responsive-gutter](#Properties) property to `true` and `margins` & `paddings` of all [Components](#components) (except [Container](#container)) will be calculated on a percentage basis. This means not only the column's width will scale but the gap between two columns to guarantee a true fluid layout.

_Notice: This feature only allows to inherit the root columns gap to the first nested level_

#### Gutter On Outside

#### Mobile First || Desktop First

#### Unlimited Viewports

#### Property Overwrite

## Components

Lorem ipsum dolor sit amet.

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

**Mesh** is based on a bunch of properties you can adjust to your needs. Some of them are overwriteable in each defined viewport.

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

## Roadmap

- set styles via includes so one does not have to use and compile the default classes
- column-justify
- quantity based column classes
- root based column classes for nested columns
