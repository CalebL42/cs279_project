/*eslint-env node, mocha*/
const expect    = require('chai').expect;
const human     = require('../../lib/human');
const PropCheck = require('../../index');


const ERROR_MESSAGE_GIVEN = "__GIVEN";
const ERROR_MESSAGE_UNEXPECTED = "__UNEXPECTED";
const ERROR_MESSAGE_MISSING = "__MISSING";
const ERROR_MESSAGE_CONCLUSION = "__CONCLUSION";
const ERROR_MESSAGE_CLUELESS = "__CLUELESS";


describe('props-check/lib/human.js', () => {

    const spec = {
    apple: 'Object'
  , orange: 'Number'
  , banana: 'Function'
  , kiwi: '[Function]'
  , mango: 'Boolean'
  };

  const good_test = {
    apple: {}
  , orange: 10
  , banana: () => null
  , kiwi: [ () => null ]
  , mango: true
  };


  const customMessages = {
    given: [ ERROR_MESSAGE_GIVEN ]
  , unexpected: [ ERROR_MESSAGE_UNEXPECTED ]
  , missing: [ ERROR_MESSAGE_MISSING ]
  , conclusion: [ ERROR_MESSAGE_CONCLUSION ]
  , clueless: [ ERROR_MESSAGE_CLUELESS ]
  };


  it('should be a function with an arity of 3', () => {

    expect(human).to.be.a('function');
    expect(human.length).to.equal(3);

  });


  it('should return null if all properties pass the check', () => {

    const actual = human(spec, PropCheck(spec, good_test), null);

    expect(actual).to.be.null;

  });


  it('should return a string if 1 or more properties fail the check', () => {

    const bad_test1 = {
      appel: {}
    , orage: 10
    , nbaana: () => null
    , kiwi: [ () => null ]
    , watermelon: false
    };

    const bad_test2 = {
      watermelon: false
    };

    const bad_test3 = { };

    const actual1 = human(spec, PropCheck(spec, bad_test1), null);
    expect(actual1).to.be.a('String');

    const actual2 = human(spec, PropCheck(spec, bad_test2), null);
    expect(actual2).to.be.a('String');

    const actual3 = human(spec, PropCheck(spec, bad_test3), null);
    expect(actual3).to.be.a('String');

  });


  it('should return a string that contains ' + ERROR_MESSAGE_GIVEN, () => {

    const spec = {
      a: ''
    , b: ''
    , c: ''
    };

    const test = { };

    const actual = human(spec, test, customMessages);

    expect(actual).to.not.match(new RegExp(ERROR_MESSAGE_GIVEN));
    expect(actual).to.not.match(new RegExp(ERROR_MESSAGE_UNEXPECTED));
    expect(actual).to.match(new RegExp(ERROR_MESSAGE_MISSING));
    expect(actual).to.not.match(new RegExp(ERROR_MESSAGE_CONCLUSION));
    expect(actual).to.not.match(new RegExp(ERROR_MESSAGE_CLUELESS));

  });


  it('should return a string that contains all sections but ' +
  ERROR_MESSAGE_CLUELESS, () => {

    const spec = {
      apple: ''
    , banana: ''
    };

    const test = {
      appel: ''
    , banana: ''
    };

    const actual = human(spec, PropCheck(spec, test), customMessages);

    expect(actual).to.match(new RegExp(ERROR_MESSAGE_GIVEN));
    expect(actual).to.match(new RegExp(ERROR_MESSAGE_UNEXPECTED));
    expect(actual).to.match(new RegExp(ERROR_MESSAGE_MISSING));
    expect(actual).to.match(new RegExp(ERROR_MESSAGE_CONCLUSION));
    expect(actual).to.not.match(new RegExp(ERROR_MESSAGE_CLUELESS));

  });


  it('should return a string that contains all sections', () => {

    const spec = {
      apple: ''
    , banana: ''
    };

    const test = {
      appel: ''
    , banana: ''
    , pear: ''
    };

    const actual = human(spec, PropCheck(spec, test), customMessages);

    expect(actual).to.match(new RegExp(ERROR_MESSAGE_GIVEN));
    expect(actual).to.match(new RegExp(ERROR_MESSAGE_UNEXPECTED));
    expect(actual).to.match(new RegExp(ERROR_MESSAGE_MISSING));
    expect(actual).to.match(new RegExp(ERROR_MESSAGE_CONCLUSION));
    expect(actual).to.match(new RegExp(ERROR_MESSAGE_CLUELESS));

  });


  it('should return a string that corrects "appel" to "apple', () => {

    const spec = { apple: '' }
    const test = { appel: '' }

    const actual = human(spec, PropCheck(spec, test), null);

    expect(actual).to.match(/appel <-> apple/);

  });


  it('should return a string that contains the expected/unexpected props',
  () => {

    const spec = { apple: '', banana: '' };
    const test = { appel: '', baanna: '' }

    const actual = human(spec, PropCheck(spec, test), null);

    expect(actual).to.match(/{ appel: …, baanna: … }/);
    expect(actual).to.match(/{ apple: …, banana: … }/);

  });


});