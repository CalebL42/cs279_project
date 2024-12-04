
_ = require('ramda');


const ERROR_MESSAGES = {

  given: [
    'You gave me this:'
  , 'This is what you gave me:'
  , 'Something is wrong with what you gave me:'
  , 'This is what I got from you:'
  ]

, unexpected: [
    'I wasn\'t expecting:'
  , 'Something is not right...'
  , 'Something is fishy...'
  , 'I don\'t understand this:'
  ]

, missing: [
    'You didn\'t give me:'
  , 'I\'m looking for this:'
  , 'I’m going out on a limb here, but I think you meant:'
  , 'Not to be snarky but you meant this, didn’t you?'
  ]

, conclusion: [
    'Here\'s how to fix it:'
  , 'No offense, but you need some help:'
  , 'Lez b honest, here’s better keys:'
  , 'Silly, I think you were trying to say this:'
  , 'Great Scott! You’re not gonna get it done on time with that! Try this!'
  , 'Tell me, future boy, why are these wrong?'
  , 'It works! It works! Actually it doesn’t, try these:'
  , 'Are you sure you are a developer?'
  ]

, clueless: [
    'Whose keys are these? You didn\'t tell me about them:'
  , 'I have no idea wtf these keys are:'
  , 'Ummmm... wut?'
  , 'Wait... what?'
  , 'What do you expect me to do with these illegals.'
  , 'http://bfy.tw/6xvq'
  , '"These keys don\'t belong here, dumb ass"'
  , '404: these keys, and your intelligence, not found.'
]

};


const isNotArray = _.compose(_.not, _.is(Array));


const nullOrEmpty = _.either( _.isNil, _.isEmpty );


const pickRandom = (list) => {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};


const getErrorMessages = (key, custom) => {
  return _.ifElse(
    _.either(nullOrEmpty, isNotArray)
  , _.always(_.prop(key, ERROR_MESSAGES))
  , _.identity
  )(_.propOr(null, key, custom));
}


const errorMessage = (custom) => {
  return {
    given: pickRandom(getErrorMessages('given', custom))
  , unexpected: pickRandom(getErrorMessages('unexpected', custom))
  , missing: pickRandom(getErrorMessages('missing', custom))
  , conclusion: pickRandom(getErrorMessages('conclusion', custom))
  , clueless: pickRandom(getErrorMessages('clueless', custom))
  };
};

module.exports = errorMessage;
