package database

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/JZ23-2/splitbill-backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dbUser := strings.TrimSpace(os.Getenv("DB_USER"))
	dbPass := strings.TrimSpace(os.Getenv("DB_PASS"))
	dbHost := strings.TrimSpace(os.Getenv("DB_HOST"))
	dbPort := strings.TrimSpace(os.Getenv("DB_PORT"))
	dbName := strings.TrimSpace(os.Getenv("DB_NAME"))

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser,
		dbPass,
		dbHost,
		dbPort,
		dbName,
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Connected to MySQL")

	DB = db

	// DB.Migrator().DropTable(&models.User{}, &models.Bill{}, &models.Item{}, &models.Participant{})
	db.AutoMigrate(
		&models.User{}, &models.Bill{}, &models.Item{}, &models.Participant{}, &models.Friend{}, &models.PendingFriendRequest{}, &models.Inbox{},
	)
}
