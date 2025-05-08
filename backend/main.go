package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/bedrockruntime"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// Request structure for the API
type ExplainRequest struct {
	Text string `json:"text"`
}

// Response structure for the API
type ExplainResponse struct {
	Explanation string `json:"explanation"`
	Error       string `json:"error,omitempty"`
}

// BedrockRequest structure for Claude model
type BedrockRequest struct {
	Prompt            string  `json:"prompt"`
	MaxTokensToSample int     `json:"max_tokens_to_sample"`
	Temperature       float64 `json:"temperature"`
	TopP              float64 `json:"top_p"`
}

// BedrockResponse structure for Claude model
type BedrockResponse struct {
	Completion string `json:"completion"`
}

func main() {
	// Check if AWS environment variables are set
	if os.Getenv("AWS_ACCESS_KEY_ID") == "" || os.Getenv("AWS_SECRET_ACCESS_KEY") == "" {
		log.Fatal("AWS credentials not found in environment variables")
	}

	// Create router
	r := mux.NewRouter()

	// Define routes
	r.HandleFunc("/api/explain", handleExplain).Methods("POST")
	r.HandleFunc("/health", handleHealth).Methods("GET")

	// Set up CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // Adjust this in production
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// Start server
	port := "8080"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	fmt.Printf("Server starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, c.Handler(r)))
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func handleExplain(w http.ResponseWriter, r *http.Request) {
	// Parse request
	var req ExplainRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendErrorResponse(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	if req.Text == "" {
		sendErrorResponse(w, "Text field is required", http.StatusBadRequest)
		return
	}

	// Get explanation from AWS Bedrock
	explanation, err := getExplanationFromBedrock(req.Text)
	if err != nil {
		sendErrorResponse(w, fmt.Sprintf("Error getting explanation: %v", err), http.StatusInternalServerError)
		return
	}

	// Send response
	resp := ExplainResponse{
		Explanation: explanation,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

func getExplanationFromBedrock(text string) (string, error) {
	// Load AWS configuration
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return "", fmt.Errorf("unable to load AWS SDK config: %v", err)
	}

	// Create Bedrock client
	client := bedrockruntime.NewFromConfig(cfg)

	// Prepare prompt for Claude model
	prompt := fmt.Sprintf("Human: Please explain the following text in detail:\n\n%s\n\nAssistant:", text)

	// Create request payload
	bedrockReq := BedrockRequest{
		Prompt:            prompt,
		MaxTokensToSample: 500,
		Temperature:       0.7,
		TopP:              0.9,
	}

	// Convert request to JSON
	reqBody, err := json.Marshal(bedrockReq)
	if err != nil {
		return "", fmt.Errorf("error marshaling request: %v", err)
	}

	// Call Bedrock API
	// Using Claude model ID - adjust as needed
	modelID := "anthropic.claude-v2"
	output, err := client.InvokeModel(context.TODO(), &bedrockruntime.InvokeModelInput{
		ModelId:     aws.String(modelID),
		ContentType: aws.String("application/json"),
		Body:        reqBody,
	})
	if err != nil {
		return "", fmt.Errorf("error calling Bedrock: %v", err)
	}

	// Parse response
	var bedrockResp BedrockResponse
	if err := json.Unmarshal(output.Body, &bedrockResp); err != nil {
		return "", fmt.Errorf("error unmarshaling response: %v", err)
	}

	return bedrockResp.Completion, nil
}

func sendErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	resp := ExplainResponse{
		Error: message,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(resp)
}