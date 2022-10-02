# js-anchor-menu - simple jQuery anchor menu

## Description

Adds scrolling to menu anchors and adds/removes the active class to clicked menu items.

## Options

Name        | Type       | Default    | Description
:---------- | :--------- | :--------- | :-----------
activeClass | string     | active     | class of currently active item in menu
easing      | string     | swing      | transition animation from jquery
parent      | string     | li         | elements in menu containing links
onStart     | boolean    | true       | select active item in menu based on current hash
speed       | int        | 1          | speed of transition, lover is faster
padding     | int/string | 0          | number or element
include     | string[]   | []         | additional elements where to activate anchors

## Usage

```javascript
$("#target").anchorMenu({});
```