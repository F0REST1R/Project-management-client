package main

import (
	"backend/internal/database"
	"backend/internal/config"
	"log"
	"net/http"

)

func main() {
	cfg := config.Load()

	db.Connect(cfg)

	http.HandleFunc("/health", health)
	log.Println("Server started on :8080")
	http.ListenAndServe(":8080", nil)

}

func health(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("OK"))
}