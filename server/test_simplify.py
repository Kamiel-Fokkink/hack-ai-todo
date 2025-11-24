import requests

def test_simplify():
    url = "http://20.224.45.128:80/simplify"
    data = {
        "language": "nl",
        "level": "a2",
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("Test PASSED")
        else:
            print("Test FAILED")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_simplify()
