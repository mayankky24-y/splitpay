package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

func Loadenv() {
	// In cloud deployments (e.g., Render), env vars are injected by the platform
	// and a local .env file is usually not present.
	if err := godotenv.Load(".env", "backend/.env"); err != nil {
		log.Printf("No local .env loaded, relying on runtime environment: %v", err)
	}

	requiredEnv := []string{
		"DB_USER", "DB_PASS", "DB_HOST", "DB_PORT", "DB_NAME",
		"GEMINI_API_KEY", "GEMINI_API_URL",
	}
	missing := make([]string, 0)

	for _, key := range requiredEnv {
		if strings.TrimSpace(os.Getenv(key)) == "" {
			missing = append(missing, key)
		}
	}

	if len(missing) > 0 {
		log.Fatalf("Missing required environment variables: %s", strings.Join(missing, ", "))
	}
}
