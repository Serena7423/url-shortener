async function shortenUrl() {
    const longUrl = document.getElementById('longUrl').value;
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const shortenButton = document.querySelector('.btn-primary');
    
    // Reset previous results
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    // Show loading state
    shortenButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    shortenButton.disabled = true;

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

        // Display the result with animation
        document.getElementById('shortUrl').value = data.short_url;
        document.getElementById('visitCount').textContent = data.analytics.visits;
        const originalUrlLink = document.getElementById('originalUrl');
        originalUrlLink.href = data.long_url;
        originalUrlLink.textContent = data.long_url;
        
        resultDiv.style.opacity = '0';
        resultDiv.classList.remove('hidden');
        setTimeout(() => {
            resultDiv.style.transition = 'opacity 0.3s ease';
            resultDiv.style.opacity = '1';
        }, 10);

        // Start polling analytics
        startAnalyticsPolling(data.short_url.split('/').pop());
    } catch (error) {
        errorDiv.querySelector('span').textContent = error.message;
        errorDiv.classList.remove('hidden');
    } finally {
        // Reset button state
        shortenButton.innerHTML = '<i class="fas fa-compress-alt"></i> Shorten URL';
        shortenButton.disabled = false;
    }
}

async function copyToClipboard() {
    const shortUrl = document.getElementById('shortUrl');
    const copyButton = document.querySelector('.short-url-container .btn-secondary');
    
    try {
        await navigator.clipboard.writeText(shortUrl.value);
        
        // Visual feedback with icon change
        const originalHTML = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        
        setTimeout(() => {
            copyButton.innerHTML = originalHTML;
            copyButton.style.background = '';
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        shortUrl.select();
        document.execCommand('copy');
        
        // Visual feedback
        copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    }
}

function startAnalyticsPolling(shortCode) {
    // Clear previous interval if exists
    if (window.currentAnalyticsInterval) {
        clearInterval(window.currentAnalyticsInterval);
    }

    // Poll for analytics every 5 seconds
    const intervalId = setInterval(async () => {
        try {
            const response = await fetch(`/analytics/${shortCode}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const visitCount = document.getElementById('visitCount');
            const oldValue = parseInt(visitCount.textContent);
            const newValue = data.visits;

            if (newValue > oldValue) {
                // Animate the counter update
                visitCount.style.color = '#10b981';
                visitCount.style.transform = 'scale(1.2)';
                visitCount.textContent = newValue;
                
                setTimeout(() => {
                    visitCount.style.transition = 'all 0.3s ease';
                    visitCount.style.color = '';
                    visitCount.style.transform = '';
                }, 500);
            } else {
                visitCount.textContent = newValue;
            }
        } catch (error) {
            console.error('Analytics polling error:', error);
            clearInterval(intervalId);
        }
    }, 5000);

    window.currentAnalyticsInterval = intervalId;
}

// Event listener for Enter key
document.getElementById('longUrl').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        shortenUrl();
    }
});