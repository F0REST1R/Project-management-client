package models

type Client struct {
	ID int `json:"id"`
	Name string `json:"name"`
	INN string `json:"inn"`
	Email string `json:"email"`
	Phone string `json:"phone"`
	Stage string `json:"stage"`
}