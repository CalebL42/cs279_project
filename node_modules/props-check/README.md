[![Build Status](https://travis-ci.org/influentialpublishers/props-check.svg?branch=master)](https://travis-ci.org/influentialpublishers/props-check)
[![codecov](https://codecov.io/gh/influentialpublishers/props-check/branch/master/graph/badge.svg)](https://codecov.io/gh/influentialpublishers/props-check)
[![Coverage Status](https://coveralls.io/repos/github/influentialpublishers/props-check/badge.svg?branch=master)](https://coveralls.io/github/influentialpublishers/props-check?branch=master)
[![Code Climate](https://codeclimate.com/github/influentialpublishers/props-check/badges/gpa.svg)](https://codeclimate.com/github/influentialpublishers/props-check)

# props-check
Check your props and give a helpful error if you've mis-typed.

## Installation

`npm install props-check`

## Requiring the module

```javascript
const PropsCheck = require('props-check')
```

## `PropsCheck`

PropsCheck checks props against the spec and returns a map with list of possible corrections.

```javascript
// Example spec
const spec = {
  read: 'Function'
, sanitize: '[Function]'
, validate: '[Function]'
, normalize: '[Function]'
};


// Example object
const test = {
  raed: () => null
, santize: [ () => null ]
, alvidate: [ () => null ]
, normalize: [ () => null ]
, format: [ () => null ]
};


const result = PropsCheck(spec, test);
```

result:
```javascript
  { raed: [ 'read' ]
  , santize: [ 'sanitize' ]
  , alvidate: [ 'validate' ]
  , normalize: []
  , format: []
  }
```

`PropsCheck` returns `null` if spec and test have the exact same props.

## `PropsCheck.custom`

`PropsCheck.custom` takes a custom comparator and returns a function that is similar to PropsCheck.

```javascript
const comparator = (a, b) => a < b;

const result = PropsCheck.custom(comparator)(spec, test);
```

## `PropsCheck.human`

`PropsCheck.human` accepts the same arguments as PropsCheck but returns a more helpful error message.

```javascript
const result = PropsCheck.human(spec, test);
```

result:

```
    You gave me this:

      {
        raed: …,
        santize: …,
        alvidate: …,
        normalize: …
      }

    I wasn't expecting:

      { raed: …, santize: …, alvidate: … }

    You didn't give me:

      { read: …, sanitize: …, validate: … }

    Here's how to fix it:

      raed <-> read
      santize <-> sanitize
      alvidate <-> validate

    I have no idea what this mean:

      { format: …, }
```

## `PropsCheck.customHuman`

`PropsCheck.customHuman` takes a custom message map and returns a function that is similar to PropsCheck.human.

```javascript
const customMessages = {
  given: [ "This is what I got:", … ]
, unexpected: [ "Something is not right..", … ]
, missing: [ "I'm looking for this:", … ]
, conclusion: [ "I suggest the following changes:", … ]
, clueless: [ "I have no idea what these are:", … ]
};

const result = PropsCheck.customHuman(customMessages)(spec, test);
```

Custom messages will be used randomly if more than 1 message is provided in the list. If a property of the customMessages is misspelled or if a list is empty, default messages will be used instead.

## Misc things

- If you use `PropsCheck.custom` and provide your own comparator, make sure that the comparator accepts 2 arguments and returns either `0` on equal, `1` on similar, or `-1` on mismatch.
- All functions are curried. Meaning that the following:
```javascript
PropsCheck(spec)(test);
PropsCheck.custom(comparator)(spec)(test);
PropsCheck.human(spec)(test);
PropsCheck.customHuman(customMessages)(spec)(test);
```
  are the same as:
```javascript
PropsCheck(spec, test);
PropsCheck.custom(comparator)(spec, test);
PropsCheck.human(spec, test);
PropsCheck.customHuman(customMessages)(spec, test);
```
