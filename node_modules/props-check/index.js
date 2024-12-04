const _       = require('ramda');
const suggest = require('./lib/suggest');
const human   = require('./lib/human');
const DL      = require('./lib/damerau-levenshtein');


const run = (comparator, spec, target) => {

  const run = suggest(comparator, _.keys(spec));
  const reducer = (acc, x) => _.assoc(x, run(x), acc);

  return _.reduce(reducer, {}, _.keys(target));
};


const PropCheck = _.curry((spec, target) => run(DL, spec, target));


PropCheck.custom = (comparator) => _.curry((spec, target) =>
  run(comparator, spec, target)
);


PropCheck.human = _.curry((spec, target) =>
  human(spec, PropCheck(spec, target), null)
);

PropCheck.customHuman = (messages) => _.curry((spec, target) =>
  human(spec, PropCheck(spec, target), messages)
);


module.exports = PropCheck;
