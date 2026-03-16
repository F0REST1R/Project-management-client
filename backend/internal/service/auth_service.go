package service

import (
	db "backend/internal/database"
	"backend/internal/models"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) Register(user models.User) error {
	hash, err := bcrypt.GenerateFromPassword(
		[]byte(user.Password),
		10,
	)

	if err != nil {
		return err
	}

	query := `
	INSERT INTO users
	(first_name,last_name,email,password,role)
	VALUES ($1,$2,$3,$4,$5)
	`

	_, err = db.DB.Exec(
		query, 
		user.FirstName,
		user.LastName,
		user.Email,
		string(hash),
		user.Role,
	)

	return err
}

func (s *AuthService) Login(email string, password string) (models.User, error) {
	var user models.User
	var passwordHash string

	query := `
	SELECT id, first_name, last_name, email, password, role
	FROM users
	WHERE email=$1
	`

	err := db.DB.QueryRow(query, email).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&passwordHash,
		&user.Role,
	)
	if err != nil {
		return user, err
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(passwordHash), 
		[]byte(password),
	)

	if err != nil {
		return user, err
	}

	return user, nil
}