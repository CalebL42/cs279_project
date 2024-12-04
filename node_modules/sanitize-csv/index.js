/**
 * Based on the documentation of OWASP for CSV Injection
 * https://owasp.org/www-community/attacks/CSV_Injection
 */

const { escape } = require('lodash');
const _ = require('lodash');

const specialCharacters = [
  '=', '+', '-', '@', '0x09', '0x0D'
];

let fieldSeperator = `,`;
let quotes = `"`;

/**
 * For a given csv file with data including the headers
 * recursively escaping or removing found special characters in the first index of data
 * @param string csvData
 */
function sanitizeValues(csvData) {
  validateArgs(arguments);

  const dataInArray = String(csvData)
    .split(fieldSeperator)
    .map(data => {
      const firstChar = String(data).charAt(0);
      // detect if first char of data has one of the special characters
      if (specialCharacters.indexOf(firstChar) > -1) {
        // escape that character
        data = String(data).replace(firstChar, escape(firstChar));
        data = String(data).replace(firstChar, `'${firstChar}'`);
      }

      return data;
    })

  // return the csv string joined by field separator
  return dataInArray.join(fieldSeperator);
}

function validateArgs(args) {
  if (!args[1].delimiter) {
    throw SyntaxError("sanitizeValues requires delimiter argument")
  } else {
    this.fieldSeperator = args[1].delimiter;
  }

  if (!args[1].quotes) {
    throw SyntaxError("sanitizeValues requires quotes argument")
  } else {
    this.quotes = args[1].quotes;
  }

}

module.exports = {
  sanitizeValues
}