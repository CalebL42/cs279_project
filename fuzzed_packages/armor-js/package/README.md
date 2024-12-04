========
Armor-JS
========

`Armor-JS` is a data validation and sanitization module for
JavaScript. It is primarily intended for the exchange of information
between a normalized data format and a human-friendly rendering,
however it be used anywhere there is an exchange of data. It plays
well by itself, and it plays well with Python's
[armor](https://pypi.python.org/pypi/armor) library.

Armor-JS's approach to data handling is to "validate-on-transform",
i.e. that it performs validation *during* the data
serialization/de-serialization process (as it is transformed between
the internal data state and the rendered state exposed to a human in
forms and other UI controls). This is, in our opinion, better than
decoupling the processes of validation and transformation because the
rules do not need to be implemented twice and kept in sync.

TODO: add documentation.

TODO: add examples.
