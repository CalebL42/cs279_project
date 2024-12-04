/*eslint-env node, mocha*/
const expect    = require('chai').expect;
const DL = require('../../lib/damerau-levenshtein.js');


describe('prop-check/lib/damerau-levenshtein.js', () => {


  it('should be a function with an arity of 2', () => {

    expect(DL).to.be.a('function');
    expect(DL.length).to.eql(2);

  });


  it('should return 0 if the words are the same', () => {

    const actual = DL('target', 'target');

    expect(actual).to.eql(0);

  });


  it('should return 1 if the the possibility word is a possible replacement ' +
  ' for the target word', () => {

    const tests = [
      [ 'alvidate', 'validate', 1 ]
    , [ 'raed', 'read', 1 ]
    , [ 'santize', 'sanitize', 1 ]
    , [ 'validator', 'validate', 1 ]
    , [ 'validation', 'validate', 1 ]
    , [ 'namelize', 'normalize', 1 ]
    , [ 'foo', 'validate', -1 ]
    , [ 'sanitize', 'normalize', -1 ]
    , [ 'sanitize', 'read', -1 ]
    , [ 'sanitize', 'validate', -1 ]
    , [ 'validate', 'normalize', -1 ]
    , [ 'validate', 'read', -1 ]
    , [ 'validate', 'sanitize', -1 ]
    , [ 'read', 'normalize', -1 ]
    , [ 'read', 'validate', -1 ]
    , [ 'read', 'sanitize', -1 ]
    , [ 'normalize', 'read', -1 ]
    , [ 'normalize', 'validate', -1 ]
    , [ 'normalize', 'sanitize', -1 ]
    , [ 'edar', 'read', -1 ]
    , [ 'edra', 'read', -1 ]
    ];

    tests.map((test_case) => {

      const actual = DL(test_case[0], test_case[1]);
      const message = `target: ${test_case[0]},\n possibility: ${test_case[1]}`;
      expect(actual, message).to.eql(test_case[2]);

    });

  });

});
