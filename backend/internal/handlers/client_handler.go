package handlers

import (
	"backend/internal/models"
	"backend/internal/service"
	"encoding/json"
	"net/http"
	"strings"
)

type ClientHandler struct {
	Service *service.ClientService
}

func NewClientHandler() *ClientHandler {
	return &ClientHandler{
		Service: service.NewClientService(),
	}
}

func (h *ClientHandler) CreateClient(w http.ResponseWriter, r *http.Request) {
	var client models.Client

	err := json.NewDecoder(r.Body).Decode(&client)
	if err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
	}

    // Валидация
    if len(client.Name) < 2 {
        http.Error(w, "company name is required", http.StatusBadRequest)
        return
    }

    if !isValidINN(client.INN) {
        http.Error(w, "INN must contain 10 or 12 digits", http.StatusBadRequest)
        return
    }

    if client.Email == "" && client.Phone == "" {
        http.Error(w, "enter email or phone", http.StatusBadRequest)
        return
    }

    if client.Email != "" && !isValidEmail(client.Email) {
        http.Error(w, "invalid email format", http.StatusBadRequest)
        return
    }

    err = h.Service.CreateClient(client)
    if err != nil {
        http.Error(w, "failed to create client", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{
        "message": "client created successfully",
    })	
}

func (h *ClientHandler) GetClients(w http.ResponseWriter, r *http.Request) {
    clients, err := h.Service.GetAllClients()
    if err != nil {
        http.Error(w, "failed to get clients", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(clients)
}

func (h *ClientHandler) UpdateClient(w http.ResponseWriter, r *http.Request) {
    // Получаем ID из URL
    pathParts := strings.Split(r.URL.Path, "/")
    id := pathParts[len(pathParts)-1]
    
    var client models.Client
    err := json.NewDecoder(r.Body).Decode(&client)
    if err != nil {
        http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
        return
    }

    // Валидация
    if len(client.Name) < 2 {
        http.Error(w, `{"error":"company name is required"}`, http.StatusBadRequest)
        return
    }

    if !isValidINN(client.INN) {
        http.Error(w, `{"error":"INN must contain 10 or 12 digits"}`, http.StatusBadRequest)
        return
    }

    if client.Email == "" && client.Phone == "" {
        http.Error(w, `{"error":"enter email or phone"}`, http.StatusBadRequest)
        return
    }

    if client.Email != "" && !isValidEmail(client.Email) {
        http.Error(w, `{"error":"invalid email format"}`, http.StatusBadRequest)
        return
    }

    err = h.Service.UpdateClient(id, client)
    if err != nil {
        if strings.Contains(err.Error(), "duplicate key") {
            http.Error(w, `{"error":"client with this email already exists"}`, http.StatusConflict)
            return
        }
        http.Error(w, `{"error":"failed to update client"}`, http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "message": "client updated successfully",
    })
}

func (h *ClientHandler) DeleteClient(w http.ResponseWriter, r *http.Request) {
    pathParts := strings.Split(r.URL.Path, "/")
    id := pathParts[len(pathParts)-1]

    err := h.Service.DeleteClient(id)
    if err != nil {
        http.Error(w, `{"error":"failed to delete client"}`, http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "message": "client deleted successfully",
    })
}

// Вспомогательные функции
func isValidINN(inn string) bool {
    return len(inn) == 10 || len(inn) == 12
}

func isValidEmail(email string) bool {
    // Простая проверка email
    for i := 0; i < len(email); i++ {
        if email[i] == '@' {
            return true
        }
    }
    return false
}
