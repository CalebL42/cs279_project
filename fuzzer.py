import openai
from openai import OpenAI
import glob
from pydantic import BaseModel
import subprocess as subprocess
from datetime import datetime
import os

client = OpenAI()

PACKAGE_NAME = "sanitize-csv"
file_names = []
for file_name in glob.glob(f"node_modules/{PACKAGE_NAME}/**/*.js", recursive=True):
    if (f"node_modules/{PACKAGE_NAME}/test" not in file_name):
        file_names.append(file_name)

file_strings = []
for file_name in file_names:
    file = open(file_name, "r")
    file_strings.append(file.read())

readme_string = "```markdown\n" + open(f"node_modules/{PACKAGE_NAME}/README.md", "r").read() + "\n```"

full_file_contents = ""
for i in range(len(file_names)):
    full_file_contents += f"FILENAME: {file_names[i]}\n"
    full_file_contents += f"Contents: ```js\n{file_strings[i]}\n```\n\n"
# print(len(full_file_contents))
# print(full_file_contents)

gpt_outputs = open("gpt_outputs.txt", "a")


# find the vulnerable functions
class VulnerableFunction(BaseModel):
    file_name: str
    function_name: str

class VulnerableFunctionList(BaseModel):
    functions: list[VulnerableFunction]

completion_select = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[
        {
            "role": "system",
            "content": "You are a malicious agent attempting to generate special user input strings that when passed into a "
            + "sanitization function result in outputs that still contain 'unsafe characters'."
        },
        {
            "role": "user", 
            "content": "We're looking for security vulnerabilities in a javascript NPM package. "
                     + "Here is the README file for the npm package: "
                     + readme_string + "\n"
                     + "Here is a set of file paths and their contents from an npm package meant to sanitize/validate user input strings: " 
                     + full_file_contents + "\n"
                     + "Given these files, list the names of files that contain API's for directly sanitizing/validating user inputs "
                     + "and from these files, list the function headers that actually conduct the sanitization/validation."
        }
    ],
    response_format = VulnerableFunctionList
)
select_response = completion_select.choices[0].message
if not select_response.parsed:
    print("Error returning vulnerable functions/files")
select_parsed = select_response.parsed

gpt_outputs.write("completion_select:" + select_parsed.model_dump_json(indent=4) + "\n\n")


# now given vulnerable files and functions, generate the harnesses
class JestFunctionSignatureAndBody(BaseModel):
    signature_and_body: str

class TestSuite(BaseModel):
    function: VulnerableFunction
    jest_test_file_headers: list[str]
    jest_sanitization_test_cases: list[JestFunctionSignatureAndBody]

class TestSuiteList(BaseModel):
    test_suites: list[TestSuite]

completion_harness = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[
        {
            "role": "system",
            "content": "You are a malicious agent attempting to generate special user input strings that when passed into a "
            + "sanitization function result in outputs that still contain 'unsafe characters'."
        },
        {
            "role": "user", 
            "content": "We're looking for security vulnerabilities in a javascript NPM package. "
                     + "Here is the README file for the npm package: "
                     + readme_string + "\n"
                     + "Here is a set of file paths and their contents from an npm package meant to sanitize/validate user input strings: " 
                     + full_file_contents + "\n"
                     + "Given these files, list the names of files that contain API's for directly sanitizing/validating user inputs "
                     + "and from these files, list the function headers that actually conduct the sanitization/validation."
        },
        {
            "role": "assistant", 
            "content": completion_select.choices[0].message.content
        },
        {
            "role": "user",
            "content": "I have attached the relevant files now, and you already know the relevant functions. "
                + "Now, for each of these functions, generate a Jest test harness and 10 adversarial inputs that exploit bugs in the sanitization logic. "
                + "They could be inputs that bypass the sanitization, trigger a crash, or expose sensitive data."
                + "As an example of how to create a basic Jest test harness and one test case, suppose we have this function defined in sum.js:\n"
                + "```js\nfunction sum(a, b) {\n\treturn a + b;\n}\nmodule.exports = sum;\n```\n"
                + "There start of the test file should handle the necessary imports and setup for the test cases, which looks something like this:\n"
                + "```js\nconst sum = require('<package_name>/sum.js');\n```\n"
                + "Then all 10 test functions should be written. A single test function might look like this:\n"
                + "```js\ntest('adds 1 + 2 to equal 3', () => {\n\texpect(sum(1, 2)).toBe(3);\n});\n```\n"
                + "All of the test cases should pass in a string that exploits a flaw in the source code, but the test should expect the desired result assuming the function works as intended."
                + "Therefore, if the test fails, it's an indicator there's a bug that could be a security vulnerability. "
                + "For example, you might pass in '<script>' to an html sanitizer, which is intended to output '&lt;script&gt;, but due to some "
                + "flaw in the source code, it still gets sanitized into '<script>'"
        }
    ],
    response_format = TestSuiteList
)
harness_response = completion_harness.choices[0].message
if not harness_response.parsed:
    print("Error returning test harnesses")
harness_parsed = harness_response.parsed

gpt_outputs.write("completion_harness:" + harness_parsed.model_dump_json(indent=4) + "\n\n")

gpt_outputs.write("------------\n")
gpt_outputs.close()



# write tests to file:
timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
os.mkdir(timestamp)
for test_suite in harness_parsed.test_suites:
    func_filename = test_suite.function.file_name[test_suite.function.file_name.rfind("/")+1:-3]
    func_name = test_suite.function.function_name
    test_filename = f"{func_filename}-{func_name}.test.js"
    js_file = open(f"{timestamp}/{test_filename}", "w")
    for header in test_suite.jest_test_file_headers:
        js_file.write(header + "\n\n")
    for test_case in test_suite.jest_sanitization_test_cases:
        js_file.write(test_case.signature_and_body + "\n\n")
    js_file.close()


# name each test file after the file and function in which it exists

#run Jest test harnesses automatically here, and examine the results manually:
# subprocess.check_call('npm test', shell=True)

# print(generate_harness.choices[0].message)
