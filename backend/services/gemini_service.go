package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/JZ23-2/splitbill-backend/dtos"
)

func SendToGemini(file io.Reader) (*dtos.ReceiptResponse, error) {
	promptBytes, err := os.ReadFile("prompts/extract_text.txt")
	if err != nil {
		return nil, fmt.Errorf("failed to read prompt: %w", err)
	}
	prompt := string(promptBytes)

	imgBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	base64Image := base64.StdEncoding.EncodeToString(imgBytes)

	payload := dtos.GeminiRequest{
		Contents: []dtos.Content{
			{
				Parts: []dtos.Part{
					{Text: prompt},
					{
						InlineData: &dtos.InlineData{
							MimeType: "image/png",
							Data:     base64Image,
						},
					},
				},
			},
		},
	}

	body, _ := json.Marshal(payload)

	geminiBaseURL := strings.TrimSpace(os.Getenv("GEMINI_API_URL"))
	geminiAPIKey := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))
	if geminiBaseURL == "" || geminiAPIKey == "" {
		return nil, fmt.Errorf("missing GEMINI_API_URL or GEMINI_API_KEY")
	}
	apiURL := geminiBaseURL + "?key=" + geminiAPIKey

	res, err := postGeminiWithRetry(apiURL, body)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var geminiRes dtos.GeminiResponse
	if err := json.NewDecoder(res.Body).Decode(&geminiRes); err != nil {
		return nil, fmt.Errorf("failed to decode gemini response: %v", err)
	}

	if len(geminiRes.Candidates) == 0 || len(geminiRes.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("invalid response structure")
	}

	jsonText := geminiRes.Candidates[0].Content.Parts[0].Text

	jsonText = strings.TrimSpace(jsonText)
	if strings.HasPrefix(jsonText, "```") {
		jsonText = strings.TrimPrefix(jsonText, "```json")
		jsonText = strings.TrimPrefix(jsonText, "```")
		jsonText = strings.TrimSuffix(jsonText, "```")
		jsonText = strings.TrimSpace(jsonText)
	}

	var receipt dtos.ReceiptResponse
	if err := json.Unmarshal([]byte(jsonText), &receipt); err != nil {
		return nil, fmt.Errorf("failed to parse JSON from gemini response: %v", err)
	}

	return &receipt, nil
}

func postGeminiWithRetry(apiURL string, body []byte) (*http.Response, error) {
	client := &http.Client{Timeout: 25 * time.Second}
	retryDelays := []time.Duration{0, 1500 * time.Millisecond}
	var lastErr error

	for attempt, delay := range retryDelays {
		if delay > 0 {
			time.Sleep(delay)
		}

		req, err := http.NewRequest(http.MethodPost, apiURL, bytes.NewReader(body))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Content-Type", "application/json")

		res, err := client.Do(req)
		if err != nil {
			lastErr = err
			continue
		}

		if res.StatusCode == http.StatusOK {
			return res, nil
		}

		resBody, _ := io.ReadAll(res.Body)
		res.Body.Close()
		lastErr = fmt.Errorf("status %d: %s", res.StatusCode, resBody)

		// Retry only transient upstream failures.
		if res.StatusCode != http.StatusTooManyRequests &&
			res.StatusCode != http.StatusServiceUnavailable &&
			res.StatusCode != http.StatusInternalServerError {
			break
		}

		// Last attempt already used; stop retrying.
		if attempt == len(retryDelays)-1 {
			break
		}
	}

	return nil, lastErr
}
