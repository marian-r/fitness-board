Fitness Board
=============

This is the application that demonstrates usage of [Electronic Health Records](http://en.wikipedia.org/wiki/Electronic_health_record) via the API provided by the [EhrScape platform](https://www.ehrscape.com/).

About thecnologies
------------------

The application is working entirely on the client-side and is served by the [GitHub Pages](https://pages.github.com/). It uses REST API to strore and retrieve the medical records.

It is written in JavaScript and makes use of these ECMAScript 6 features:

- modules
- classes
- default parameters
- destructing assignment and parameters
- block level declarations with `let`
- arrow functions

The code with ES6 features is compiled to ES5 with [Traceur](https://github.com/google/traceur-compiler) to make it work in the enviroment which does not support ES6 yet.

The application also includes:
- charts built by [D3.js](http://d3js.org/) library
- Twitter Widget showing the latest tweets according to the query
