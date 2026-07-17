package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type User struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

var db *gorm.DB

func main() {

	// Load .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	// Create table
	db.AutoMigrate(&User{})

	r := gin.Default()

	r.Use(cors.Default())

	r.POST("/users", createUser)
	r.GET("/users", getUsers)
	r.DELETE("/users/:id", deleteUser)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run(":" + port)
}

func createUser(c *gin.Context) {
	var user User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Create(&user)

	c.JSON(http.StatusCreated, user)
}

func getUsers(c *gin.Context) {
	var users []User

	db.Find(&users)

	c.JSON(http.StatusOK, users)
}

func deleteUser(c *gin.Context) {
	id := c.Param("id")

	db.Delete(&User{}, id)

	c.JSON(http.StatusOK, gin.H{
		"message": "User deleted",
	})
}
