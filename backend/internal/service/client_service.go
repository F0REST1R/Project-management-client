package service

import (
	db "backend/internal/database"
	"backend/internal/models"
	"fmt"
)

type ClientService struct {
}

func NewClientService() *ClientService {
	return &ClientService{}
}

func (s *ClientService) CreateClient(client models.Client) error {
	query := `
		INSERT INTO clients (name, inn, email, phone, stage)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	err := db.DB.QueryRow(
		query, 
		client.Name,
		client.INN,
		client.Email,
		client.Phone,
		client.Stage,
	).Scan(&client.ID)

	return err
}

func (s *ClientService) GetAllClients() ([]models.Client, error) {
	query := `
		SELECT id, name, inn, email, phone, stage
		FROM clients
		ORDER BY id DESC
	`

	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var clients []models.Client
	for rows.Next() {
		var client models.Client
		err := rows.Scan(
			&client.ID,
			&client.Name,
			&client.INN,
			&client.Email,
			&client.Phone,
			&client.Stage,
		)
		if err != nil {
			return nil, err
		}
		clients = append(clients, client)
	}

	return clients, nil
}

func (s *ClientService) UpdateClient(id string, client models.Client) error {
    query := `
        UPDATE clients 
        SET name = $1, inn = $2, email = $3, phone = $4, stage = $5
        WHERE id = $6
    `

    result, err := db.DB.Exec(
        query,
        client.Name,
        client.INN,
        client.Email,
        client.Phone,
        client.Stage,
        id,
    )
    
    if err != nil {
        return err
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return err
    }

    if rowsAffected == 0 {
        return fmt.Errorf("client not found")
    }

    return nil
}

func (s *ClientService) DeleteClient(id string) error {
    query := `DELETE FROM clients WHERE id = $1`
    _, err := db.DB.Exec(query, id)
    return err
}