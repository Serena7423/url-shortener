# URL Shortener

A Flask-based URL shortening service with real-time analytics.

## Features

- Shorten long URLs to easy-to-share formats
- Real-time visit analytics
- Copy to clipboard functionality
- Input validation
- Responsive design

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Serena7423/url-shortener.git
   cd url-shortener
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   python app.py
   ```

5. Open http://127.0.0.1:5000 in your browser

## Usage

1. Enter a long URL in the input field
2. Click "Shorten URL" or press Enter
3. Copy the shortened URL using the "Copy" button
4. Track the number of visits in real-time

## Technologies Used

- Python/Flask
- JavaScript
- HTML/CSS