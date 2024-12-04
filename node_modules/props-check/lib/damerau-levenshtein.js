
const algorithm = require('damerau-levenshtein');


const DL = (target, possibility) => {
  if (target === possibility) return 0;

  const results = algorithm(target, possibility);

  if (results.steps < 4 && results.similarity >= 0.5) {
    return 1;
  }

  return -1;
};


module.exports = DL;
