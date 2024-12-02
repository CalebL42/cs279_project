BASE_URL="http://128.111.49.59:4000"
API_KEY="<key>"

from openai import OpenAI
client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

completion = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {
            "role": "user",
            "content": "Write a haiku about recursion in programming."
        }
    ]
)

print(completion.choices[0].message)

