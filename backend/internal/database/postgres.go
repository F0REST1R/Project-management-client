package db

import (
	"backend/internal/config"
	"database/sql"
	_ "github.com/lib/pq"
	"fmt"
	"log"
)

var DB *sql.DB

func Connect(cfg *config.Config) {

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", 
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName)

	var err error

	DB, err = sql.Open("postgres", connStr)
	
	if err != nil {
		log.Fatal("Ошибка при открытии БД: ", err)
	}

	err = DB.Ping()

	if err != nil {
		log.Fatal("Ошибка связи с БД: ", err)
	}
}