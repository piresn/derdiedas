import requests
from dotenv import load_dotenv
import csv
import os

load_dotenv()

account_id = os.getenv('cloudflare_api_account')
api_token = os.getenv('cloudflare_api_token')

def cloudflare_request(word):
    response = requests.post(
        f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/cloudflare/clef",
        headers={"Authorization": f"Bearer {api_token}"},
        json={
            "model": "clef",
            "state": "Gender of a German word",
            "questions": {
                "gender": {
                    "type": "choice",
                    "instructions": f"Word: {word}",
                    "criteria": {
                        "der": "masculine",
                        "die": "feminine",
                        "das": "neuter",
                    },
                },
            },
        },
    )
    response_data = response.json()

    probs = response_data["result"]["answers"]["gender"]["probabilities"]
    top_label = max(probs, key=probs.get)
    top_prob = probs[top_label]

    return top_label, top_prob

if __name__ == "__main__":

    n_to_check = 5001

    
    with open("/Users/nunopessoal/derdiedas/public/data/nouns_small.csv", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)

        for i, row in enumerate(reader):
            if i >= n_to_check:
                break
            cloud = cloudflare_request(row[0])
            if row[1] == cloud[0] or cloud[1] < 0.5:
                print(f"\r{i}/{n_to_check}", end="", flush=True)
            else:
                print(f"\n**{row[0]}**, model: {cloud}, csv: {row[1]}")
