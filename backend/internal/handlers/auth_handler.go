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