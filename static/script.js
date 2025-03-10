async function shortenUrl() {
    const longUrl = document.getElementById('longUrl').value;
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    
    // Reset previous results
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    try {
        const response = await fetch('/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: longUrl })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to shorten URL');
        }

        // Display the result
        document.getElementById('shortUrl').value = data.short_url;
        document.getElementById('visitCount').textContent = data.analytics.visits;
        const originalUrlLink = document.getElementById('originalUrl');
        originalUrlLink.href = data.long_url;
        originalUrlLink.textContent = data.long_url;
        resultDiv.classList.remove('hidden');

        // Start polling analytics
        startAnalyticsPolling(data.short_url.split('/').pop());
    } catch (error) {
        errorDiv.querySelector('p').textContent = error.message;
        errorDiv.classList.remove('hidden');
    }
}

async function copyToClipboard() {
    const shortUrl = document.getElementById('shortUrl');
    try {
        await navigator.clipboard.writeText(shortUrl.value);
        
        // Visual feedback
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        shortUrl.select();
        document.execCommand('copy');
    }
}

function startAnalyticsPolling(shortCode) {
    // Poll for analytics every 5 seconds
    const intervalId = setInterval(async () => {
        try {
            const response = await fetch(`/analytics/${shortCode}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            document.getElementById('visitCount').textContent = data.visits;
        } catch (error) {
            console.error('Analytics polling error:', error);
            clearInterval(intervalId);
        }
    }, 5000);

    // Store the interval ID to clear it when generating a new short URL
    window.currentAnalyticsInterval = intervalId;
}

// Event listener for Enter key
document.getElementById('longUrl').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        shortenUrl();
    }
});