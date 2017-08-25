# jsonata-transform-component [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Dedicated data transformation component for elastic.io platform based on JSONata

## Authentication

This component requires no authentication.

## How it works

This component takes the incoming message body and applies the configured JSONata tranformation on it. It uses 
a fact that JSONata expression is a superset of JSON document so that by default any valid JSON document is
a valid JSONata expression.

For example let's take this incoming sample:

## License

Apache-2.0 © [elastic.io GmbH](http://elastic.io)


[npm-image]: https://badge.fury.io/js/jsonata-transform-component.svg
[npm-url]: https://npmjs.org/package/jsonata-transform-component
[travis-image]: https://travis-ci.org/elasticio/jsonata-transform-component.svg?branch=master
[travis-url]: https://travis-ci.org/elasticio/jsonata-transform-component
[daviddm-image]: https://david-dm.org/elasticio/jsonata-transform-component.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/elasticio/jsonata-transform-component
