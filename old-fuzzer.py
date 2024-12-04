import openai
from openai import OpenAI
import glob
from pydantic import BaseModel
import subprocess as subprocess
from datetime import datetime
import os
import time
import sys

client = OpenAI()
PACKAGE_NAME = sys.argv[1]
MAX_ITERS = 3
TIMESTAMP = datetime.now().strftime("%Y-%m-%d_%H:%M:%S")

class VulnerableFunction(BaseModel):
    file_name: str
    function_name: str

class VulnerableFunctionList(BaseModel):
    functions: list[VulnerableFunction]

class JestFunctionSignatureAndBody(BaseModel):
    signature_and_body: str

class TestSuite(BaseModel):
    function: VulnerableFunction
    jest_test_file_headers: list[str]
    jest_sanitization_test_cases: list[JestFunctionSignatureAndBody]

class TestSuiteList(BaseModel):
    test_suites: list[TestSuite]
    
class CriticResponse(BaseModel):
    is_happy: bool
    reasoning: str

# get names of all js files in the package
def get_package_file_names(package_name):
    file_names = []
    for file_name in glob.glob(f"{package_name}/**/*.js", recursive=True):
        if (f"test.js" not in file_name and "assets" not in file_name and "dist" not in file_name):
            file_names.append(file_name)
    return file_names

def get_test_file_names(package_name):
    file_names = []
    for file_name in glob.glob(f"{package_name}/**/*.test.js", recursive=True):
        file_names.append(file_name)
    return file_names

def get_readme_file_name(package_name):
    readmes = []
    for readme_name in glob.glob(f"{package_name}**/[Rr][Ee][Aa][Dd][Mm][Ee].[Mm][Dd]", recursive=True):
        readmes.append(readme_name)
    return readmes

# read each given file, return a list
def get_file_contents(file_names):
    file_strings = []
    for file_name in file_names:
        file = open(file_name, "r")
        file_strings.append(file.read())
    return file_strings

# wrap the body of code in a delimiter that marks the beginning and end of the code and the language.
# e.g.
# ```python
# print("hello there")
# ```
def delimit_code(code_str, lang):
    return "```" + lang + "\n" + code_str + "\n```\n"

# given the chatgpt client, readme string, and string containing all the code in the package,
# ask chat gpt to look at the readme and code to return a VulnerableFunctionList that
# is a list of function names with the names of the files the functions come from
def get_files_and_functions(client, readme_string, all_files_string):
    files_functions_response = client.beta.chat.completions.parse(
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
                        + all_files_string + "\n"
                        + "Given these files, list the names of files that contain API's for directly sanitizing/validating user inputs "
                        + "and from these files, list the function headers that actually conduct the sanitization/validation."
            }
        ],
        response_format = VulnerableFunctionList
    )

    files_functions_message = files_functions_response.choices[0].message
    if not files_functions_message.parsed:
        print("Error returning vulnerable functions/files")
    
    return files_functions_response, files_functions_message.parsed

def run_tests(harness_parsed):
    # write tests to file:
    package_filename = PACKAGE_NAME[:-1][PACKAGE_NAME.rfind("/")+1:]
    os.makedirs(f"test/{package_filename}", exist_ok=True)
    for test_suite in harness_parsed.test_suites:
        func_filename = test_suite.function.file_name[test_suite.function.file_name.rfind("/")+1:-3]
        func_name = test_suite.function.function_name
        test_filename = f"{func_filename}-{func_name}.test.js"
        
        # create if it doesn't exist, overwrites it if it does
        js_file = open(f"test{package_filename}/{test_filename}", "w")
        
        for header in test_suite.jest_test_file_headers:
            js_file.write(header + "\n\n")
        for test_case in test_suite.jest_sanitization_test_cases:
            js_file.write(test_case.signature_and_body + "\n\n")
        js_file.close()

    test_results = subprocess.run(
        ['npm', 'test'],   
        text=True,            
        capture_output=True   
    )

    return test_results

# critique the tests the other agent wrote
# test results is a string containing the command line output of `npm test`
# all_test_files_string is the test code that ran
def critique(client, test_results, all_test_files_string):
    critic_response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": f"""You're a skeptic for evluating the effectivness of unit tests for catching sanitization errors examine each test case and the relevant source code. Here is the README file for the npm package: {readme_string}\n\n
                Here is a set of file paths and their contents from an npm package meant to sanitize/validate user input: {full_file_string}"""
            },
            {
                "role": "user", 
                "content": f"""Your reply should indicate whether you are satisfied or dissatisfied with the following test cases and the corresponding outputs in the test results. Given your understanding of the source code's intended behavior, your should disapprove of test cases that show failure for trivial reasons. Note that all test cases are meant to fail, but they should fail through a bypass of the sanitization function specifically. Here is the test file: {all_test_files_string}\n\n Here are the test results: {test_results}"""
            }
        ],
        response_format = CriticResponse
    )
    
    critic_message = critic_response.choices[0].message
    if not critic_message.parsed:
        print("Error critiquing test cases")
    
    return critic_response, critic_message, critic_message.parsed.is_happy


# generate the tests given optional feedback from the critic
# all_test_files_string contains all the test file names and code
# critic message contains the critic's response to the 

def generate_tests(client, readme_string, full_file_string, files_functions_response, atf="", cm=""):
    # scratch pad step
    scratchpad_response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are an expert hacker with malicious intentions attempting to generate dirty user input that when passed into a sanitization function result in outputs that are still dirty and contain 'unsafe characters'."
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
                    + "Now, for each of these functions, your task is to generate a Jest test harness and 3 adversarial inputs that exploit logical bugs in the sanitization function's source code. "
                    + "They should be dirty inputs that bypass the sanitization. "
                    + "Don't actually execute the task yet, for now I just want you to "
                    + "use <scratchpad> tags to outline your step-by-step methodology for analyzing the source code, generating the harness, and generating the test cases with the appropriate dirty inputs."

                    + "Here is an example of a dirty input for 'bypassing sanitization': Some test case might use as input '<script>' for an html sanitizer sanitizeHtml(dirty), which is intended to output the escaped versions of the 'less than' and 'greater than' symbols like '&lt;script&g;. However, due to some "
                    + "flaw in the source code, like using the wrong list of allowed tags, the return value of "
                    + "sanitizeHtml('<script>') is still a dirty string like '<script>' after sanitization. "
                    + ("" if (cm == "") else f"The catch now is that you've actually done this task before, but a critic did not like your work so you have to generate new test cases to the critic's satisfication. When creating your scratchpad, you need to also take into consideration the critic's response to a previous Jest test harness and adversarial inputs that you generated in the past. The critic found your previous test suite unsatisfactory and here is the critic's feedback: {cm}\n\nHere is your previous testing suite as well, which needs revision: {atf}")
            }
        ]
    )

    # now given the scratchpad generate new tests
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
                    + "Now, for each of these functions, your task is to generate a Jest test harness and 3 adversarial inputs that exploit logical bugs in the sanitization function's source code. "
                    + "They should be dirty inputs that bypass the sanitization. "
                    + "Don't actually execute the task yet, for now I just want you to "
                    + "use <scratchpad> tags to outline your step-by-step methodology for analyzing the source code, generating the harness, and generating the test cases with the appropriate dirty inputs."

                    + "Here is an example of a dirty input for 'bypassing sanitization': Some test case might use as input '<script>' for an html sanitizer sanitizeHtml(dirty), which is intended to output the escaped versions of the 'less than' and 'greater than' symbols like '&lt;script&g;. However, due to some "
                    + "flaw in the source code, like using the wrong list of allowed tags, the return value of "
                    + "sanitizeHtml('<script>') is still a dirty string like '<script>' after sanitization"
                    + ("" if (cm == "") else f"The catch now is that you've actually done this task before, but a critic did not like your work so you have to generate new test cases to the critic's satisfication. When creating your scratchpad, you need to also take into consideration the critic's response to a previous Jest test harness and adversarial inputs that you generated in the past. The critic found your previous test suite unsatisfactory and here is the critic's feedback: {cm}\n\nHere is your previous testing suite as well, which needs revision: {atf}")
            },
            {
                "role": "assistant", 
                "content": scratchpad_response.choices[0].message.content
            },
            {
                "role": "user",
                "content": "Following the outline from your scratchpad, you will execute the intended task described earlier, which was: Generate a Jest test harness and 3 adversarial inputs that exploit bugs in the sanitization logic. "
                    + "They should mainly be inputs that bypass the sanitization. "
                    + ("" if (cm == "") else "Remember now that you have done this task before, so you need to keep in mind the critic's response to your old work to revise your output and make them happy.")
                    + "As an example of how to create a basic Jest test harness and one test case, suppose we have this function defined in the file sum.js:\n"
                    + "```js\nfunction sum(a, b) {\n\treturn a + b;\n}\nmodule.exports = sum;\n```\n"
                    + "The start of the test file should handle the necessary imports and setup for the test cases, which looks something like this:\n"
                    + "```js\nconst sum = require('<package_name>/sum.js');\n```\n"
                    + "The test cases are located in a folder called 'test' that is adjacent to the folder 'fuzzed_packages'. Therefore you requires should look like require(../fuzzed_packages/<package_name>/<js_library>). Then all 3 test functions should be written. A single test function might look like this:\n"
                    + "```js\ntest('adds 1 + 2 to equal 3', () => {\n\texpect(sum(1, 2)).toBe(3);\n});\n```\n"
                    + "All of the test cases should use as input a dirty string that exploits a flaw in the source code, but the test should expect the theoretical desired result assuming the function works as intended."
                    + "Therefore, we want all the tests to fail, and they should fail in a way that indicates a security vulnerability."
            }
        ],
        response_format = TestSuiteList
    )

    harness_message = harness_response.choices[0].message
    if not harness_message.parsed:
        print("Error returning harnesses")
    
    return harness_response, harness_message.parsed 

start_time = time.time()
print(f"Testing package {PACKAGE_NAME}:")

file_names = get_package_file_names(PACKAGE_NAME)
file_contents = get_file_contents(file_names)

print(f"Filenames are {file_names}")

readmes = get_readme_file_name(PACKAGE_NAME)
try:
    readme_contents = open(readmes[0], "r").read()
except:
    readme_contents = "There is no README.md for this file"
readme_string = delimit_code(readme_contents, "markdown")

full_file_string = ""
for i in range(len(file_names)):
    full_file_string += f"FILENAME: {file_names[i]}\n"
    full_file_string += f"Contents: {delimit_code(file_contents[i], 'js')}"

gpt_outputs = open("gpt_outputs.txt", "a")

files_functions_response, files_functions_parsed = get_files_and_functions(client, readme_string, full_file_string)
gpt_outputs.write("files and functions that appear vulnerable:" + files_functions_parsed.model_dump_json(indent=4) + "\n\n")

harness_response, harness_parsed = generate_tests(client, readme_string, full_file_string, files_functions_response)

gpt_outputs.write("harness:" + harness_parsed.model_dump_json(indent=4) + "\n\n")



# for up to MAX_ITERS:
# 1. run the tests
# 2. critique the tests to find any issues
#    - if there are none, break
# 3. generate new tests using the critic's feedback if needed, and run again
for i in range(MAX_ITERS):

    print("loop interation: " + str(i))
    print("running tests")
    test_results = run_tests(harness_parsed)
    print("tests ran")
    loop_iteration = 0
    print("getting file contents")
    test_file_names = get_test_file_names(PACKAGE_NAME)
    test_file_contents = get_file_contents(test_file_names)
    print("extracted file contents")
    test_file_string = ""
    for i in range(len(test_file_names)):
        test_file_string += f"FILENAME: {test_file_names[i]}\n"
        test_file_string += f"Contents: {delimit_code(test_file_contents[i], 'js')}"

    print("running critique")
    critic_response, critic_message, is_happy = critique(client, test_results, all_test_files_string=test_file_string)
    if is_happy:
        print("Critic is happy with the tests")
        break
    
    print("critique is not happy")
    if i < MAX_ITERS - 1: # repair is useless on the last iteration, since the loop ends
        print("running generate_tests")
        harness_response, harness_parsed = generate_tests(client, readme_string, full_file_string, files_functions_response, atf=test_file_string, cm=critic_message)
        print("completed generating_tests")
    #def generate_tests(client, readme_string, full_file_string, files_functions_response, all_test_files_string, cm=""):
    
if not is_happy: 
    print(f"Ran out of iterations ({MAX_ITERS}) and the critic is still unhappy")

gpt_outputs.write("------------\n")
gpt_outputs.close()

end_time = time.time()
time_difference = end_time - start_time
print(f"Time taken for the request: {time_difference:.2f} seconds")

# name each test file after the file and function in which it exists

#run Jest test harnesses automatically here, and examine the results manually:
subprocess.check_call('npm test', shell=True)

#print(generate_harness.choices[0].message)
