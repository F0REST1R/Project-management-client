package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"log"
	"net/http"
)

func main() {
	cfg := config.Load()

	db.Connect(cfg)
	
	authHandler := handlers.NewAuthHandler(cfg)

	http.HandleFunc("/api/auth/register", cors(authHandler.Register))
	http.HandleFunc("/api/auth/login", cors(authHandler.Login))

	http.HandleFunc("/api/auth/me", cors(authHandler.GetCurrentUser))
	
	http.HandleFunc("/health", health)

	
	log.Println("Server started on :8080")
	http.ListenAndServe(":8080", nil)

}

func health(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("OK"))
}

func cors(handler http.HandlerFunc) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if r.Method == "OPTIONS" {
			return
		}

		handler(w, r)
	}
}