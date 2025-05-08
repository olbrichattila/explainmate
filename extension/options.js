// Save options to Chrome storage
function saveOptions() {
  const apiEndpoint = document.getElementById('api-endpoint').value.trim();
  
  // Validate the API endpoint
  if (!apiEndpoint) {
    showStatus('Please enter a valid API endpoint.', 'error');
    return;
  }
  
  // Try to validate URL format
  try {
    new URL(apiEndpoint);
  } catch (e) {
    showStatus('Please enter a valid URL.', 'error');
    return;
  }
  
  // Save to Chrome storage
  chrome.storage.sync.set({ apiEndpoint: apiEndpoint }, function() {
    // Update status to let user know options were saved
    showStatus('Options saved.', 'success');
    
    // Test the connection
    testConnection(apiEndpoint);
  });
}

// Load saved options from Chrome storage
function loadOptions() {
  chrome.storage.sync.get(['apiEndpoint'], function(items) {
    document.getElementById('api-endpoint').value = items.apiEndpoint || 'http://localhost:8080/api/explain';
    
    // Test the connection on load
    testConnection(items.apiEndpoint || 'http://localhost:8080/api/explain');
  });
}

// Test the connection to the API
function testConnection(apiEndpoint) {
  const connectionStatus = document.getElementById('connection-status');
  connectionStatus.textContent = 'Testing connection...';
  connectionStatus.className = 'status';
  connectionStatus.style.display = 'block';
  
  // Extract base URL for health check
  const baseUrl = apiEndpoint.replace(/\/api\/explain$/, '');
  const healthUrl = `${baseUrl}/health`;
  
  fetch(healthUrl, { method: 'GET' })
    .then(response => {
      if (response.ok) {
        connectionStatus.textContent = 'Connection successful! API is online.';
        connectionStatus.className = 'status success';
      } else {
        connectionStatus.textContent = `Connection failed. Server returned status: ${response.status}`;
        connectionStatus.className = 'status error';
      }
    })
    .catch(error => {
      connectionStatus.textContent = `Connection failed: ${error.message}`;
      connectionStatus.className = 'status error';
    });
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
  
  // Hide status after 3 seconds
  setTimeout(function() {
    status.style.display = 'none';
  }, 3000);
}

// Reset to default settings
function resetOptions() {
  const defaultEndpoint = 'http://localhost:8080/api/explain';
  document.getElementById('api-endpoint').value = defaultEndpoint;
  
  chrome.storage.sync.set({ apiEndpoint: defaultEndpoint }, function() {
    showStatus('Options reset to default.', 'success');
    testConnection(defaultEndpoint);
  });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save-button').addEventListener('click', saveOptions);
document.getElementById('test-button').addEventListener('click', function() {
  testConnection(document.getElementById('api-endpoint').value.trim());
});
document.getElementById('reset-button').addEventListener('click', resetOptions);