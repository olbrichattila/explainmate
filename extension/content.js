// Create a popup element for displaying explanations
let explanationPopup = null;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "explainText") {
    // Get the selected text and API endpoint
    const selectedText = request.text;
    const apiEndpoint = request.apiEndpoint;
    
    // Show loading popup
    showExplanationPopup("Loading explanation...");
    
    // Request explanation from the background script
    chrome.runtime.sendMessage({
      action: "getExplanation",
      text: selectedText
    }, (response) => {
      if (response && response.success) {
        // Update popup with explanation
        updateExplanationPopup(response.explanation);
      } else {
        // Show error message
        updateExplanationPopup(`Error: ${response?.error || 'Failed to get explanation'}`);
      }
    });
  }
});

// Function to create and show the explanation popup
function showExplanationPopup(content) {
  // Remove existing popup if any
  if (explanationPopup) {
    document.body.removeChild(explanationPopup);
  }
  
  // Create new popup
  explanationPopup = document.createElement("div");
  explanationPopup.style.position = "fixed";
  explanationPopup.style.top = "20px";
  explanationPopup.style.right = "20px";
  explanationPopup.style.width = "350px";
  explanationPopup.style.maxHeight = "500px";
  explanationPopup.style.overflowY = "auto";
  explanationPopup.style.backgroundColor = "#ffffff";
  explanationPopup.style.border = "1px solid #cccccc";
  explanationPopup.style.borderRadius = "8px";
  explanationPopup.style.padding = "15px";
  explanationPopup.style.zIndex = "10000";
  explanationPopup.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  explanationPopup.style.fontFamily = "Arial, sans-serif";
  
  // Add header with logo and title
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.marginBottom = "10px";
  header.style.paddingBottom = "10px";
  header.style.borderBottom = "1px solid #eee";
  
  // Add AWS Bedrock logo placeholder
  const logo = document.createElement("div");
  logo.innerHTML = "🧠";
  logo.style.fontSize = "24px";
  logo.style.marginRight = "10px";
  
  // Add title
  const title = document.createElement("h3");
  title.textContent = "AI Explanation";
  title.style.margin = "0";
  title.style.fontSize = "16px";
  title.style.fontWeight = "bold";
  
  // Add close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  closeButton.style.marginLeft = "auto";
  closeButton.style.border = "none";
  closeButton.style.background = "none";
  closeButton.style.fontSize = "20px";
  closeButton.style.cursor = "pointer";
  closeButton.style.padding = "0";
  closeButton.style.lineHeight = "1";
  closeButton.onclick = () => {
    document.body.removeChild(explanationPopup);
    explanationPopup = null;
  };
  
  // Assemble header
  header.appendChild(logo);
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Add content
  const contentElement = document.createElement("div");
  contentElement.id = "explanation-content";
  contentElement.textContent = content;
  contentElement.style.lineHeight = "1.5";
  contentElement.style.fontSize = "14px";
  
  // Add footer with powered by text
  const footer = document.createElement("div");
  footer.style.marginTop = "15px";
  footer.style.paddingTop = "10px";
  footer.style.borderTop = "1px solid #eee";
  footer.style.fontSize = "12px";
  footer.style.color = "#666";
  footer.textContent = "Powered by AWS Bedrock";
  
  // Assemble popup
  explanationPopup.appendChild(header);
  explanationPopup.appendChild(contentElement);
  explanationPopup.appendChild(footer);
  
  // Add to page
  document.body.appendChild(explanationPopup);
  
  // Add drag functionality
  makeDraggable(explanationPopup, header);
}

// Function to update the explanation popup content
function updateExplanationPopup(content) {
  if (explanationPopup) {
    const contentElement = document.getElementById("explanation-content");
    if (contentElement) {
      // Format the content with paragraphs
      contentElement.innerHTML = "";
      
      // Split by double newlines to create paragraphs
      const paragraphs = content.split(/\n\n+/);
      paragraphs.forEach(paragraph => {
        if (paragraph.trim()) {
          const p = document.createElement("p");
          p.textContent = paragraph.trim();
          p.style.margin = "0 0 10px 0";
          contentElement.appendChild(p);
        }
      });
      
      // If no paragraphs were created (single line response)
      if (contentElement.children.length === 0) {
        contentElement.textContent = content;
      }
    }
  }
}

// Make an element draggable
function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.style.cursor = "move";
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // Call a function whenever the cursor moves
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    // If it was positioned with right before, switch to left
    if (element.style.right) {
      element.style.left = element.offsetLeft + "px";
      element.style.right = "auto";
    }
  }
  
  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}