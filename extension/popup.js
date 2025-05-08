// Add event listeners when the popup is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check API status
  checkApiStatus();
  
  // Options button opens the options page
  document.getElementById('options-button').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
  
  // About button shows information about the extension
  document.getElementById('about-button').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://github.com/yourusername/browser-helper' });
  });
  
  // Explain button sends text for explanation
  document.getElementById('explain-button').addEventListener('click', function() {
    const text = document.getElementById('direct-text').value.trim();
    
    if (text) {
      // Show loading spinner
      document.getElementById('loading').style.display = 'block';
      document.getElementById('result').style.display = 'none';
      
      // Request explanation
      chrome.runtime.sendMessage({
        action: 'explainDirectly',
        text: text
      }, function(response) {
        // Hide loading spinner
        document.getElementById('loading').style.display = 'none';
        
        // Show result
        const resultElement = document.getElementById('result');
        resultElement.style.display = 'block';
        
        if (response && response.success) {
          // Format the explanation with paragraphs
          resultElement.innerHTML = '';
          
          // Split by double newlines to create paragraphs
          const paragraphs = response.explanation.split(/\n\n+/);
          paragraphs.forEach(paragraph => {
            if (paragraph.trim()) {
              const p = document.createElement('p');
              p.textContent = paragraph.trim();
              p.style.margin = '0 0 10px 0';
              resultElement.appendChild(p);
            }
          });
          
          // If no paragraphs were created (single line response)
          if (resultElement.children.length === 0) {
            resultElement.textContent = response.explanation;
          }
        } else {
          resultElement.textContent = `Error: ${response?.error || 'Failed to get explanation'}`;
        }
      });
    }
  });
  
  // Allow pressing Enter in textarea to submit
  document.getElementById('direct-text').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
      document.getElementById('explain-button').click();
      e.preventDefault();
    }
  });
});

// Function to check API status
function checkApiStatus() {
  const statusIndicator = document.getElementById('api-status');
  
  // Set to loading state
  statusIndicator.className = 'status-indicator';
  statusIndicator.title = 'Checking API status...';
  
  // Send health check request
  chrome.runtime.sendMessage({
    action: 'checkApiHealth'
  }, function(response) {
    if (response && response.success) {
      statusIndicator.className = 'status-indicator status-online';
      statusIndicator.title = 'API is online';
    } else {
      statusIndicator.className = 'status-indicator status-offline';
      statusIndicator.title = response?.message || 'API is offline';
    }
  });
}