package models

type User struct {
	ID int `json:"id"`
	FirstName string `json:"first_name"`
	LastName string `json:"last_name"`
	Email string `json:"email"`
	Password string `json:"password"`
	Role string `json:"role"`
}

type Client struct {
	ID int `json:"id"`
	Name string `json:"name"`
	INN string `json:"inn"`
	Email string `json:"email"`
	Phone string `json:"phone"`
	Stage string `json:"stage"`
}