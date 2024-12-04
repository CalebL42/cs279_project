import json
import os
import subprocess
import glob

def create_package_json(npm_packages):
    package_dict = {
        "name": "my_project",
        "version": "1.0.0",
        "description": "",
        "main": "index.js",
        "scripts": {
            "test": "jest"
        },
        "author": "",
        "license": "ISC",
        "dependencies": {}
    }

    for package in npm_packages:
        package_dict["dependencies"][package] = "*"

    with open('package.json', 'w') as f:
        json.dump(package_dict, f, indent=2)

def install_packages():
    subprocess.call('npm install', shell=True)

def download_and_extract_package(package_name):
    download_command = f'npm pack {package_name}'
    subprocess.call(download_command, shell=True, cwd='fuzzed_packages')
    
    tgz_file = f'{package_name}-*.tgz'
    
    try: 
        os.mkdir('fuzzed_packages/' + package_name)
    except:
        return
    extract_command = f'tar -xzf {tgz_file} -C {package_name}'
    subprocess.call(extract_command, shell=True, cwd='fuzzed_packages')


def main():
    with open('npm_packages.txt', 'r') as f:
        npm_packages = [line.strip() for line in f]
    create_package_json(npm_packages)
    install_packages()
    for package_name in npm_packages:
        download_and_extract_package(package_name)
    for folder in glob.glob('./fuzzed_packages/*/'):
        subprocess.call('python3 fuzzer.py ' + folder, shell=True)
    
if __name__ == "__main__":
    main()