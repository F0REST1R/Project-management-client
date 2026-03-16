package middleware

import (
	"backend/internal/config"
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

//Создаем чтобы бнзопасно хранить данные
type contextKey string

//Ключ для хранения пользователя в context
const UserContextKey = contextKey("user")

//Описываем что мы будем хранить в токене
type Claims struct {
	UserID int    `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims

	//RegisteredClaims - это стандартные поля JWT  (expiration, issued at, not before)
}

//Функция для создания middleware
func AuthMiddleware(cfg config.Config, next http.Handler) http.Handler {
	//Создаем функцию обработчика HTTP
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request)  {
		//Получаем HTTP заголовок
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "missing token", http.StatusUnauthorized)
			return 
		}
		//Удаляем Bearer, т.к. токен выглядит так Bearer dA321Ds...
		tokenStr := strings.Replace(authHeader, "Bearer ", "", 1)
		//Парсим JWT токен
		token, err := jwt.ParseWithClaims(
			tokenStr, &Claims{},
			//Функция ключа, говорим "вот секретный ключ, которым подписан токен"
			func(t *jwt.Token) (interface{}, error) {
				return []byte(cfg.JWTSecret), nil
			},
		)
		if err != nil {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return 
		}

		if claims, ok := token.Claims.(*Claims); ok && token.Valid {
			//Создаем новый контекст и добавляем туда данные
			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			//Передаем управление дальше
			next.ServeHTTP(w, r.WithContext(ctx))
			return 
		}

		http.Error(w, "invalid token", http.StatusUnauthorized)
	})
}