package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// Entry is a generic full-CRUD record you manage from the admin panel.
type Entry struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// Feedback is a message left by a visitor of the site (e.g. from LinkedIn).
type Feedback struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

var db *gorm.DB

func main() {

	// Load .env (don't hard fail in prod if it's missing — env vars may be
	// injected directly by Docker/compose instead of a .env file)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	var err error
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	// Create tables
	db.AutoMigrate(&Entry{}, &Feedback{})

	r := gin.Default()

	r.Use(cors.Default())

	// Full CRUD for entries
	r.POST("/entries", createEntry)
	r.GET("/entries", getEntries)
	r.GET("/entries/:id", getEntry)
	r.PUT("/entries/:id", updateEntry)
	r.DELETE("/entries/:id", deleteEntry)

	// Feedback wall
	r.POST("/feedbacks", createFeedback)
	r.GET("/feedbacks", getFeedbacks)
	r.DELETE("/feedbacks/:id", deleteFeedback)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run(":" + port)
}

// ---------- Entries (CRUD) ----------

func createEntry(c *gin.Context) {
	var entry Entry

	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if entry.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	db.Create(&entry)

	c.JSON(http.StatusCreated, entry)
}

func getEntries(c *gin.Context) {
	var entries []Entry

	db.Order("id desc").Find(&entries)

	c.JSON(http.StatusOK, entries)
}

func getEntry(c *gin.Context) {
	id := c.Param("id")
	var entry Entry

	if err := db.First(&entry, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "entry not found"})
		return
	}

	c.JSON(http.StatusOK, entry)
}

func updateEntry(c *gin.Context) {
	id := c.Param("id")
	var entry Entry

	if err := db.First(&entry, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "entry not found"})
		return
	}

	var input Entry
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	entry.Title = input.Title
	entry.Description = input.Description

	db.Save(&entry)

	c.JSON(http.StatusOK, entry)
}

func deleteEntry(c *gin.Context) {
	id := c.Param("id")

	if err := db.Delete(&Entry{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Entry deleted"})
}

// ---------- Feedback (visitor messages) ----------

func createFeedback(c *gin.Context) {
	var feedback Feedback

	if err := c.ShouldBindJSON(&feedback); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if feedback.Name == "" || feedback.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name and message are required"})
		return
	}

	feedback.CreatedAt = time.Now()

	db.Create(&feedback)

	c.JSON(http.StatusCreated, feedback)
}

func getFeedbacks(c *gin.Context) {
	var feedbacks []Feedback

	db.Order("created_at desc").Find(&feedbacks)

	c.JSON(http.StatusOK, feedbacks)
}

func deleteFeedback(c *gin.Context) {
	id := c.Param("id")

	if err := db.Delete(&Feedback{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Feedback deleted"})
}