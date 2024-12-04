import requests
from bs4 import BeautifulSoup

def get_npm_packages():
    base_url = "https://www.npmjs.com"
    search_url = "/search?q=sanitization"
    packages = []

    response = requests.get('https://registry.npmjs.org/-/v1/search', 
                                params={'text': 'sanitization', 'size': 50})
    data = response.json()
    
    while len(packages) < 50:
        for package in data['objects']:
            package_name = package['package']['name']
            download_count = package['downloads']['monthly']
            print(package_name)
            if download_count < 10000:
                packages.append(package_name)
                if len(packages) == 50:
                    break

        if len(packages) < 50:
            if data['total'] > len(packages):
                search_url = f"https://registry.npmjs.org/-/v1/search?text=sanitization&from={len(packages)}"
                response = requests.get(search_url)
                data = response.json()
            else:
                break

    return packages

def main():
    npm_packages = get_npm_packages()
    with open('npm_packages.txt', 'w') as f:
        for package in npm_packages:
            f.write(package + '\n')

if __name__ == "__main__":
    main()