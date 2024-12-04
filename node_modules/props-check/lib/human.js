
_             = require('ramda');
errorMessage  = require('./error-message')

// type alias Spec =
//   { String : * }

// type alias PropCheckResult =
//   { String : [ String ] }

// type alias Key = [ String ]

// type alias CustomMessage =
//   { given: [ String ]
//   , unexpected: [ String ]
//   , missing: [ String ]
//   , conclusion: [ String ]
//   }


// notNullOrEmpty :: * -> Boolean
const notNullOrEmpty = _.compose( _.not, _.either( _.isNil, _.isEmpty ) );


// nothingIsWrong :: ( Spec, PropCheckResult ) -> Boolean
const nothingIsWrong = (spec, result) => {
  return _.isEmpty(_.symmetricDifference(_.keys(spec), _.keys(result)));
};


// getPseudoObjectString :: [ Key ] -> String
const getPseudoObjectString = (keys) => {

  var pseudoKeyValuePairs = [];

  for (const key of keys) {
    pseudoKeyValuePairs.push(key + ': …');
  }

  if (_.isEmpty(pseudoKeyValuePairs)) return null;

  return '{ ' + pseudoKeyValuePairs.join(', ') + ' }';
};


// getErrorMessage :: ( String , String ) -> Maybe String
const getErrorMessage = _.curry((header, message) => {
  if (header === null || message === null) return null;
  else return (header + message);
});


// formattedUserInput :: ( Spec, PropCheckResult, CustomMessage ) -> String
const formattedUserInput = (spec, result, custom) => {
  var keys = [];
  for (const key of _.keys(result)) {
    keys.push('\n      ' + key + ': …');
  }

  if (_.isEmpty(keys)) return null;

  return '  ' + errorMessage(custom).given + '\n\n    {'
    + keys.join(',')
    + '\n    }';
};


// formatMessage :: ( Spec, PropCheckResult, String ) -> String
const formatMessage = (spec, result, error_message) => {
  return _.compose (
    getErrorMessage('  ' + error_message + '\n\n    ')
  , getPseudoObjectString
  , _.difference
  )(_.keys(spec), _.keys(result));
};


// formattedIncorrectInput
//   :: ( Spec, PropCheckResult, CustomMessage ) -> String
const formattedIncorrectInput = (spec, result, custom) => {
  return formatMessage(result, spec, errorMessage(custom).unexpected);
};


// formattedExpectedInput
//   :: ( Spec, PropCheckResult, CustomMessage ) -> String
const formattedExpectedInput = (spec, result, custom) => {
  return formatMessage(spec, result, errorMessage(custom).missing);
};


// formattedCorrection :: ( Spec, PropCheckResult, CustomMessage ) -> String
const formattedCorrection = (spec, result, custom) => {

  var suggested_corrections = [];
  for (const key of _.keys(result)) {
    if (notNullOrEmpty(result[key])) {
      suggested_corrections.push(
        '    ' + key + ' <-> ' + result[key].join(' or ')
      );
    }
  }

  if (_.isEmpty(suggested_corrections)) return null;

  return '  ' + errorMessage(custom).conclusion + '\n\n'
    + suggested_corrections.join('\n');
};


// formattedClueless :: ( Spec, PropCheckResult, CustomMessage ) -> String
const formattedClueless = (spec, result, custom) => {

  return _.compose(
    getErrorMessage('  ' + errorMessage(custom).clueless + '\n\n    ')
  , getPseudoObjectString
  , _.filter(_.compose(_.not, _.flip(_.contains)(_.keys(spec))))
  , _.keys
  , _.filter(_.isEmpty)
  )(result);
}


// wrapString :: String -> String -> String
const wrapString = _.curryN(2, (wrapper, originalString) => {
  return wrapper + originalString + wrapper;
});


// readableErrorMessage :: ( Spec, PropCheckResult, CustomMessage ) -> String
const readableErrorMessage = _.curryN(3, _.compose(
  wrapString('\n')
, _.join('\n\n')
, _.filter(notNullOrEmpty)
, _.juxt([
    formattedUserInput
  , formattedIncorrectInput
  , formattedExpectedInput
  , formattedCorrection
  , formattedClueless
  ])
));


// human :: ( Spec, PropCheckResult, CustomMessage ) -> Maybe String
const human = _.ifElse(
  _.binary(nothingIsWrong)
, _.always(null)
, readableErrorMessage
);


module.exports = human;
