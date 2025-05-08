// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainText",
    title: "Explain with AI",
    contexts: ["selection"]
  });
  
  // Set default options if not already set
  chrome.storage.sync.get(["apiEndpoint"], (result) => {
    if (!result.apiEndpoint) {
      chrome.storage.sync.set({ apiEndpoint: "http://localhost:8080/api/explain" });
    }
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainText" && info.selectionText) {
    // Get the API endpoint from storage
    chrome.storage.sync.get(["apiEndpoint"], (result) => {
      const apiEndpoint = result.apiEndpoint || "http://localhost:8080/api/explain";
      
      // Send message to content script with the selected text and API endpoint
      chrome.tabs.sendMessage(tab.id, {
        action: "explainText",
        text: info.selectionText,
        apiEndpoint: apiEndpoint
      });
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getExplanation") {
    // Get the API endpoint from storage
    chrome.storage.sync.get(["apiEndpoint"], (result) => {
      const apiEndpoint = result.apiEndpoint || "http://localhost:8080/api/explain";
      
      // Make API request to the backend
      fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: request.text })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        sendResponse({ success: true, explanation: data.explanation });
      })
      .catch(error => {
        console.error("Error fetching explanation:", error);
        sendResponse({ 
          success: false, 
          error: error.message || "Failed to get explanation from server" 
        });
      });
    });
    
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
  
  // Handle direct explanation requests from popup
  if (request.action === "explainDirectly") {
    // Get the API endpoint from storage
    chrome.storage.sync.get(["apiEndpoint"], (result) => {
      const apiEndpoint = result.apiEndpoint || "http://localhost:8080/api/explain";
      
      // Make API request to the backend
      fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: request.text })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        sendResponse({ success: true, explanation: data.explanation });
      })
      .catch(error => {
        console.error("Error fetching explanation:", error);
        sendResponse({ 
          success: false, 
          error: error.message || "Failed to get explanation from server" 
        });
      });
    });
    
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
  
  // Handle health check requests
  if (request.action === "checkApiHealth") {
    chrome.storage.sync.get(["apiEndpoint"], (result) => {
      const apiBase = result.apiEndpoint || "http://localhost:8080/api/explain";
      const healthEndpoint = apiBase.replace(/\/api\/explain$/, "/health");
      
      fetch(healthEndpoint, { method: "GET" })
        .then(response => {
          sendResponse({ 
            success: response.ok, 
            status: response.status,
            message: response.ok ? "API is online" : "API is offline"
          });
        })
        .catch(error => {
          sendResponse({ 
            success: false, 
            status: 0,
            message: "Cannot connect to API server"
          });
        });
    });
    
    return true;
  }
});