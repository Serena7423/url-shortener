from flask import Flask, render_template, request, redirect, jsonify, abort
import random
import string
import re

app = Flask(__name__)

url_storage = {}
url_analytics = {}

def is_valid_url(url):
    url_pattern = re.compile(
        r'^https?://' 
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|' 
        r'localhost|' 
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return url_pattern.match(url) is not None

def generate_short_code():
    characters = string.ascii_letters + string.digits
    while True:
        code = ''.join(random.choice(characters) for _ in range(6))
        if code not in url_storage:
            return code

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/shorten', methods=['POST'])
def shorten_url():
    data = request.get_json()
    long_url = data.get('url')
    
    if not long_url:
        return jsonify({'error': 'URL is required'}), 400
    
    if not is_valid_url(long_url):
        return jsonify({'error': 'Invalid URL format'}), 400

    short_code = generate_short_code()
    url_storage[short_code] = long_url
    url_analytics[short_code] = 0

    short_url = request.host_url + short_code
    return jsonify({
        'short_url': short_url,
        'long_url': long_url,
        'analytics': {
            'visits': 0
        }
    })

@app.route('/<short_code>')
def redirect_to_url(short_code):
    long_url = url_storage.get(short_code)
    if long_url is None:
        abort(404)
    
    url_analytics[short_code] += 1
    return redirect(long_url)

@app.route('/analytics/<short_code>')
def get_analytics(short_code):
    if short_code not in url_storage:
        abort(404)
    
    return jsonify({
        'short_code': short_code,
        'long_url': url_storage[short_code],
        'visits': url_analytics[short_code]
    })

if __name__ == '__main__':
    app.run(debug=True)