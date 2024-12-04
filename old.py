def old_generate_tests(client, readme_string, full_file_string, files_functions_response):
    # scratch pad step
    scratchpad_response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are an expert hacker with malicious intentions attempting to generate dirty user input that when passed into a "
                + "sanitization function result in outputs that are still dirty and contain 'unsafe characters'."
            },
            {
                "role": "user", 
                "content": "We're looking for security vulnerabilities in a javascript NPM package. "
                        + "Here is the README file for the npm package: "
                        + readme_string + "\n"
                        + "Here is a set of file paths and their contents from an npm package meant to sanitize/validate user input: " 
                        + full_file_string + "\n"
                        + "Given these files, list the names of files that contain API's for directly sanitizing/validating user inputs "
                        + "and from these files, list the function headers that actually conduct the sanitization/validation."
            },
            {
                "role": "assistant", 
                "content": files_functions_response.choices[0].message.content
            },
            {
                "role": "user", 
                "content": "I have attached the relevant files now, and you already know the relevant functions. "
                    + "Now, for each of these functions, your task is to generate a Jest test harness and 10 adversarial inputs that exploit logical bugs in the sanitization function's source code. "
                    + "They should be dirty inputs that bypass the sanitization. "
                    + "Don't actually execute the task yet, for now I just want you to "
                    + "use <scratchpad> tags to outline your step-by-step methodology for analyzing the source code, generating the harness, and generating the test cases with the appropriate dirty inputs."

                    + "Here is an example of a dirty input for 'bypassing sanitization': Some test case might use as input '<script>' for an html sanitizer sanitizeHtml(dirty), which is intended to output the escaped versions of the 'less than' and 'greater than' symbols like '&lt;script&g;. However, due to some "
                    + "flaw in the source code, like using the wrong list of allowed tags, the return value of "
                    + "sanitizeHtml('<script>') is still a dirty string like '<script>' after sanitization"
            }
        ]
    )

    scratchpad_message = scratchpad_response.choices[0].message

    # now given vulnerable files and functions, generate the harnesses
    harness_response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are an expert hacker with malicious intentions attempting to generate dirty user input that when passed into a "
                + "sanitization function result in outputs that are still dirty and contain 'unsafe characters'."
            },
            {
                "role": "user", 
                "content": "We're looking for security vulnerabilities in a javascript NPM package. "
                        + "Here is the README file for the npm package: "
                        + readme_string + "\n"
                        + "Here is a set of file paths and their contents from an npm package meant to sanitize/validate user input: " 
                        + full_file_string + "\n"
                        + "Given these files, list the names of files that contain API's for directly sanitizing/validating user inputs "
                        + "and from these files, list the function headers that actually conduct the sanitization/validation"
            },
            {
                "role": "assistant", 
                "content": files_functions_response.choices[0].message.content
            },
            {
                "role": "user", 
                "content": "I have attached the relevant files now, and you already know the relevant functions. "
                    + "Now, for each of these functions, your task is to generate a Jest test harness and 10 adversarial inputs that exploit logical bugs in the sanitization function's source code. "
                    + "They should be dirty inputs that bypass the sanitization. "
                    + "Don't actually execute the task yet, for now I just want you to "
                    + "use <scratchpad> tags to outline your step-by-step methodology for analyzing the source code, generating the harness, and generating the test cases with the appropriate dirty inputs."

                    + "Here is an example of a dirty input for 'bypassing sanitization': Some test case might use as input '<script>' for an html sanitizer sanitizeHtml(dirty), which is intended to output the escaped versions of the 'less than' and 'greater than' symbols like '&lt;script&g;. However, due to some "
                    + "flaw in the source code, like using the wrong list of allowed tags, the return value of "
                    + "sanitizeHtml('<script>') is still a dirty string like '<script>' after sanitization"
            },
            {
                "role": "assistant", 
                "content": scratchpad_response.choices[0].message.content
            },
            {
                "role": "user",
                "content": "Following the outline from your scratchpad, you will execute the intended task described earlier, which was: Generate a Jest test harness and 10 adversarial inputs that exploit bugs in the sanitization logic. "
                    + "They should mainly be inputs that bypass the sanitization. "

                    + "As an example of how to create a basic Jest test harness and one test case, suppose we have this function defined in the file sum.js:\n"
                    + "```js\nfunction sum(a, b) {\n\treturn a + b;\n}\nmodule.exports = sum;\n```\n"
                    + "The start of the test file should handle the necessary imports and setup for the test cases, which looks something like this:\n"
                    + "```js\nconst sum = require('<package_name>/sum.js');\n```\n"
                    + "Then all 10 test functions should be written. A single test function might look like this:\n"
                    + "```js\ntest('adds 1 + 2 to equal 3', () => {\n\texpect(sum(1, 2)).toBe(3);\n});\n```\n"
                    + "All of the test cases should use as input a dirty string that exploits a flaw in the source code, but the test should expect the theoretical desired result assuming the function works as intended."
                    + "Therefore, we want all the tests to fail, and they should fail in a way that indicates a security vulnerability."
            }
        ],
        response_format = TestSuiteList
    )

    harness_message = harness_response.choices[0].message
    if not harness_message.parsed:
        print("Error returning test harnesses")

    # return files_functions_response, files_functions_message.parsed
    return scratchpad_response, scratchpad_message, harness_response, harness_message.parsed
