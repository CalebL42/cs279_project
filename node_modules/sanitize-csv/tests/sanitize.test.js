const { sanitizeValues } = require('../index');
const fs = require('fs');

describe('should return errors when arguments are missing', () => {
  test('throws error when delimiter is not provided', () => {
    expect(() => {
      // read csv file
      const csv = fs.readFileSync(__dirname + '/examples/example1.csv', 'utf-8');
      // call function
      sanitizeValues(csv, { quotes: `"` });
    }).toThrow(SyntaxError)
  })

  test('throws error when quotes is not provided', () => {
    expect(() => {
      // read csv file
      const csv = fs.readFileSync(__dirname + '/examples/example1.csv', 'utf-8');
      // call function
      sanitizeValues(csv, { delimiter: ',' });
    }).toThrow(SyntaxError)
  })
})

describe('should return sanitized csv data', () => {
  test('sanitizes csv example 1', () => {
    // read csv file
    const csv = fs.readFileSync(__dirname + '/examples/example1.csv', 'utf-8');
    // call function
    const sanitizationResult = sanitizeValues(csv, { delimiter: ',', quotes: `"` })
    console.log(sanitizationResult, '>> results <<');
    expect(sanitizationResult).toMatchSnapshot()
  })

  test('sanitizes csv example 2 with special characters', () => {
    // read csv file
    const csv = fs.readFileSync(__dirname + '/examples/example2.csv', 'utf-8');
    // call function
    const sanitizationResult = sanitizeValues(csv, { delimiter: ',', quotes: `"` })
    console.log(sanitizationResult, '>> results <<');
    expect(sanitizationResult).toMatchSnapshot()
  })
})

