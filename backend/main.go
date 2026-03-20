package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"log"
	"net/http"
	"strings"
)

func main() {
	cfg := config.Load()

	db.Connect(cfg)

	authHandler := handlers.NewAuthHandler(cfg)
	clientHandler := handlers.NewClientHandler()

	//Страница регистрации
	http.HandleFunc("/api/auth/register", cors(authHandler.Register))
	http.HandleFunc("/api/auth/login", cors(authHandler.Login))

	http.HandleFunc("/api/auth/me", cors(authHandler.GetCurrentUser))
	
	http.HandleFunc("/health", health)
	
    //Страница клиентов 
    http.HandleFunc("/api/clients", cors(clientHandler.GetClients))   
	http.HandleFunc("/api/clients/", cors(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/api/clients/")
		
		// Если путь пустой или "create" - не обрабатываем здесь
		if path == "" || path == "create" {
			http.NotFound(w, r)
			return
		}
		
		// Определяем метод и вызываем нужный обработчик
		switch r.Method {
		case "PUT":
			clientHandler.UpdateClient(w, r)
		case "DELETE":
			clientHandler.DeleteClient(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})) 
    http.HandleFunc("/api/clients/create", cors(clientHandler.CreateClient)) 

	
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
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS	")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		handler(w, r)
	}
}