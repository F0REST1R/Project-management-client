package models

type Employee struct {
    ID         int     `json:"id"`
    UserID     int     `json:"user_id"`
    FirstName  string  `json:"first_name"`
    LastName   string  `json:"last_name"`
    Email      string  `json:"email"`
    Role       string  `json:"role"`
    Position   string  `json:"position"`
    PositionID int     `json:"position_id,omitempty"`
    HourlyRate float64 `json:"hourly_rate"`
    IsActive   bool    `json:"is_active"`
}

type Position struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}