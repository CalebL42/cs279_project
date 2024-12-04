
const _             = require('ramda');
const { typeCheck } = require('type-check')

const ERROR_MESSAGE_COMPARATOR =
  'Compare parameter must be a function with an arity of 2';
const ERROR_MESSAGE_POSSIBILITIES =
  'Possibilities parameter must be a non-empty array.';


const throwTypeError = (message) => () => { throw new TypeError(message); };


// isComparator : * -> Bool
const isComparator = _.both(
  _.is(Function)
, _.compose(_.equals(2), _.length)
);


// validateComparator : * -> * : throws TypeError
const validateComparator = _.unless(
  isComparator
, throwTypeError(ERROR_MESSAGE_COMPARATOR)
);


// isValidPossibilitiesArray : * -> Bool
const isValidPossibilitiesArray = _.both(
  _.partial(typeCheck, ['[String]'])
, _.compose(_.not, _.isEmpty)
);


// validatePossibilities : * -> * : throws TypeError
const validatePossibilites = _.unless(
  isValidPossibilitiesArray
, throwTypeError(ERROR_MESSAGE_POSSIBILITIES)
);


const isPossibility = _.curry((comparator, target, possibility) => {
  return comparator(target, possibility) > 0;
});


// suggest : (String -> String -> Int) -> [ String ] -> String -> [ String ]
const suggest = _.curry((comparator, possibilities, target) => {

  validateComparator(comparator);
  validatePossibilites(possibilities);

  return _.ifElse(
    _.contains(target)
  , _.always([])
  , _.filter(isPossibility(comparator, target))
  )(possibilities);

});

module.exports = suggest;
