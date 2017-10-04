# jsonata-transform-component [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Dedicated data transformation component for elastic.io platform based on JSONata

## Authentication

This component requires no authentication.

## How it works

This component takes the incoming message body and applies the configured JSONata tranformation on it. It uses 
a fact that JSONata expression is a superset of JSON document so that by default any valid JSON document is
a valid JSONata expression.

For example let's take this sample incoming message body:

```json
{
  "Account": {
    "Account Name": "Firefly",
    "Order": [
      {
        "OrderID": "order103",
        "Product": [
          {
            "Product Name": "Bowler Hat",
            "ProductID": 858383,
            "SKU": "0406654608",
            "Description": {
              "Colour": "Purple",
              "Width": 300,
              "Height": 200,
              "Depth": 210,
              "Weight": 0.75
            },
            "Price": 34.45,
            "Quantity": 2
          },
          {
            "Product Name": "Trilby hat",
            "ProductID": 858236,
            "SKU": "0406634348",
            "Description": {
              "Colour": "Orange",
              "Width": 300,
              "Height": 200,
              "Depth": 210,
              "Weight": 0.6
            },
            "Price": 21.67,
            "Quantity": 1
          }
        ]
      }
    ]
  }
}
```

You can use following JSONata expressions to transform it:

```jsonata
{
	"account": Account."Account Name",
	"orderCount" : $count(Account.Order)
}
```

result of that transofrmation will be the following JSON document ([jsonata link](http://try.jsonata.org/B1ctn36ub)):

```json
{
  "account": "Firefly",
  "orderCount": 1
}
```

I hope you've got the idea. Now you can also do something more complicated, like this array-to-array transformation:

```jsonata
{
    "account": Account."Account Name",
    "products": Account.Order.Product.({
    	"name": $."Product Name",
        "revenue": (Price * Quantity)
    }),
    "orderIDs": Account.Order[].(OrderID)
}
```

resulting in ([jsonata link](http://try.jsonata.org/B1ctn36ub)):

```json
{
  "account": "Firefly",
  "products": [
    {
      "name": "Bowler Hat",
      "revenue": 68.9
    },
    {
      "name": "Trilby hat",
      "revenue": 21.67
    }
  ],
  "orderIDs": [
    "order103"
  ]
}
```

## Array splitting

Sometimes it is necessary to generate multiple outgoing message from a single incoming message, for example when:
* You want to split a large incoming array to process each item individually to save resources (RAM)
* You want to process a complex nested structure by splitting it into multiple less complex pieces
* You want to split large item into many smaller items to increase reliability of the processing

You can do it with JSONata transformer - when result of your transformation is an ``iterable`` (e.g. Array) then
component action will emit each result of the array individually.

Taking the example above and following JSONata expression:

```jsonata
Account.Order.Product[]
```

will produce following JSON:

```json
[
  {
    "Product Name": "Bowler Hat",
    "ProductID": 858383,
    "SKU": "0406654608",
    "Description": {
      "Colour": "Purple",
      "Width": 300,
      "Height": 200,
      "Depth": 210,
      "Weight": 0.75
    },
    "Price": 34.45,
    "Quantity": 2
  },
  {
    "Product Name": "Trilby hat",
    "ProductID": 858236,
    "SKU": "0406634348",
    "Description": {
      "Colour": "Orange",
      "Width": 300,
      "Height": 200,
      "Depth": 210,
      "Weight": 0.6
    },
    "Price": 21.67,
    "Quantity": 1
  }
]
```

which will however be automatically split into two messages and emitted as following:

__Message 1__:

```json
{
    "Product Name": "Bowler Hat",
    "ProductID": 858383,
    "SKU": "0406654608",
    "Description": {
      "Colour": "Purple",
      "Width": 300,
      "Height": 200,
      "Depth": 210,
      "Weight": 0.75
    },
    "Price": 34.45,
    "Quantity": 2
  }
```

and __Message 2__:

```json
{
    "Product Name": "Trilby hat",
    "ProductID": 858236,
    "SKU": "0406634348",
    "Description": {
      "Colour": "Orange",
      "Width": 300,
      "Height": 200,
      "Depth": 210,
      "Weight": 0.6
    },
    "Price": 21.67,
    "Quantity": 1
  }
```

## License

Apache-2.0 © [elastic.io GmbH](http://elastic.io)


[npm-image]: https://badge.fury.io/js/jsonata-transform-component.svg
[npm-url]: https://npmjs.org/package/jsonata-transform-component
[travis-image]: https://travis-ci.org/elasticio/jsonata-transform-component.svg?branch=master
[travis-url]: https://travis-ci.org/elasticio/jsonata-transform-component
[daviddm-image]: https://david-dm.org/elasticio/jsonata-transform-component.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/elasticio/jsonata-transform-component
