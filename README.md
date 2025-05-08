# ExplainMate, the Browser Context Helper AI Extension

A Chrome extension that allows users to highlight text on a webpage and get AI-powered explanations using AWS Bedrock.

## Components

1. **Chrome Extension**: Frontend that allows users to highlight text and request explanations
2. **Golang Backend**: Server that processes requests and communicates with AWS Bedrock

## Setup Instructions

### Backend Setup

1. Ensure you have Go installed on your system
2. Set the required AWS environment variables:
   ```
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=your_aws_region
   ```
3. Navigate to the `backend` directory
4. Run `go mod tidy` to install dependencies
5. Start the server with `go run main.go`

### Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top-right corner)
3. Click "Load unpacked" and select the `extension` directory
4. Configure the API endpoint in the extension settings

## Usage

1. Highlight text on any webpage
2. Right-click and select "Explain with AI"
3. View the explanation in the popup window

## Features

- Highlight text on any webpage and get AI-powered explanations
- Direct input in the extension popup for quick explanations
- Configurable API endpoint for connecting to your backend
- Draggable explanation popup on webpages
- API status indicator to check backend connectivity
- Responsive and user-friendly interface

## Backend Deployment

### Local Development
Run the backend locally for testing:
```
cd backend
go run main.go
```

### Docker Deployment
Build and run using Docker:
```
cd backend
docker build -t browser-helper-backend .
docker run -p 8080:8080 -e AWS_ACCESS_KEY_ID=your_key -e AWS_SECRET_ACCESS_KEY=your_secret -e AWS_REGION=your_region browser-helper-backend
```

### Cloud Deployment
The backend can be deployed to AWS EC2, ECS, or any other cloud provider that supports Docker containers.

## Security Considerations

- The extension communicates with your backend server, which should be secured with HTTPS in production
- AWS credentials should be stored securely and never exposed in client-side code
- Consider implementing authentication for the API in production environments
- Review AWS IAM permissions to ensure least privilege access to Bedrock services

## Troubleshooting

- If the extension shows "API is offline", check that your backend server is running
- Verify AWS credentials are correctly set in your environment
- Check browser console for any JavaScript errors
- Ensure the API endpoint in extension settings matches your backend server address

## License

This project is licensed under the MIT License - see the LICENSE file for details.# explainmate
