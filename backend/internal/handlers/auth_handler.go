package handlers

import (
	"encoding/json"
	"net/http"

	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/service"
	"backend/internal/utils"
)

type AuthHandler struct {

	Config *config.Config

	Service *service.AuthService
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {

	return &AuthHandler{

		Config: cfg,

		Service: service.NewAuthService(),
	}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var user models.User

	err := json.NewDecoder(r.Body).Decode(&user)

	if err != nil {

		http.Error(w, "invalid request", 400)

		return
	}

	err = h.Service.Register(user)

	if err != nil {

		http.Error(w, err.Error(), 500)

		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {

	var data struct {

		Email string `json:"email"`

		Password string `json:"password"`
	}

	json.NewDecoder(r.Body).Decode(&data)

	user, err := h.Service.Login(
		data.Email,
		data.Password,
	)

	if err != nil {

		http.Error(w, "invalid credentials", 401)

		return
	}

	token, err := utils.GenerateJWT(
		*h.Config,
		user.ID,
		user.Role,
	)

	if err != nil {

		http.Error(w, "token error", 500)

		return
	}

	json.NewEncoder(w).Encode(map[string]string{

		"token": token,
	})
}

func (h *AuthHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
    // Получаем токен из заголовка
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
        http.Error(w, "missing token", http.StatusUnauthorized)
        return
    }

    // Убираем "Bearer " из токена
    tokenString := authHeader[7:] // len("Bearer ") == 7

    // Валидируем токен и получаем claims
    claims, err := utils.ValidateJWT(tokenString, h.Config.JWTSecret)
    if err != nil {
        http.Error(w, "invalid token", http.StatusUnauthorized)
        return
    }

    // Получаем пользователя из базы данных
    user, err := h.Service.GetUserByID(claims.UserID)
    if err != nil {
        http.Error(w, "user not found", http.StatusNotFound)
        return
    }

    // Отправляем данные пользователя (без пароля!)
    response := map[string]interface{}{
        "id":         user.ID,
        "first_name": user.FirstName,
        "last_name":  user.LastName,
        "email":      user.Email,
        "role":       user.Role,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}