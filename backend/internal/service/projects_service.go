package service

import (
	db "backend/internal/database"
	"backend/internal/models"
	"fmt"
)

type ProjectsService struct {
}

func NewProjectsService() *ProjectsService {
	return &ProjectsService{}
}

func (s *ProjectsService) CreateProject(project models.Project) error {
    query := `
		INSERT INTO projects (name, client_id, manager_id, start_date, end_date, status, archived)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id 
	`

	err := db.DB.QueryRow(
		query, 
		project.Name,
		project.ClientID,
		project.ManagerID,
		project.StartDate,
		project.EndDate,
		project.Status,
		false,
	).Scan(&project.ID)

	return err
}

func (s *ProjectsService) GetAllProjects(includeArchived bool) ([]models.Project, error) {
	query := `
        SELECT p.id, p.name, p.client_id, COALESCE(c.name, '') as client_name, 
               p.manager_id, COALESCE(u.first_name || ' ' || u.last_name, '') as manager_name,
               p.start_date, p.end_date, p.status, p.archived, p.created_at
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN users u ON p.manager_id = u.id
	`

	if !includeArchived {
        query += " WHERE p.archived = false"
    }

    query += " ORDER BY p.id DESC"

    rows, err := db.DB.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var projects []models.Project
    for rows.Next() {
        var p models.Project
        var clientName string
        var managerName string
        err := rows.Scan(
            &p.ID,
            &p.Name,
            &p.ClientID,
            &clientName,
            &p.ManagerID,
            &managerName,
            &p.StartDate,
            &p.EndDate,
            &p.Status,
            &p.Archived,
            &p.CreatedAt,
        )
        if err != nil {
            return nil, err
        }

        p.ClientName = clientName
        p.ManagerName = managerName

        projects = append(projects, p)
    }

    return projects, nil
}

func (s *ProjectsService) GetProjectByID(id string) (*models.Project, error) {
    query := `
        SELECT p.id, p.name, p.client_id, COALESCE(c.name, '') as client_name, 
               p.manager_id, COALESCE(u.first_name || ' ' || u.last_name, '') as manager_name,
               p.start_date, p.end_date, p.status, p.archived, p.created_at
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN users u ON p.manager_id = u.id
        WHERE p.id = $1
    `

    var p models.Project
    var clientName string
    var managerName string
    
    err := db.DB.QueryRow(query, id).Scan(
        &p.ID,
        &p.Name,
        &p.ClientID,
        &clientName,
        &p.ManagerID,
        &managerName,
        &p.StartDate,
        &p.EndDate,
        &p.Status,
        &p.Archived,
        &p.CreatedAt,
    )
    if err != nil {
        return nil, err
    }
    
    p.ClientName = clientName
    p.ManagerName = managerName

    return &p, nil
}

func (s *ProjectsService) UpdateProject(id string, project models.Project) error {
    query := `
        UPDATE projects 
        SET name = $1, client_id = $2, manager_id = $3, 
            start_date = $4, end_date = $5, status = $6
        WHERE id = $7
    `

    result, err := db.DB.Exec(
        query,
        project.Name,
        project.ClientID,
        project.ManagerID,
        project.StartDate,
        project.EndDate,
        project.Status,
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
        return fmt.Errorf("project not found")
    }

    return nil
}

// Архивация проекта (мягкое удаление)
func (s *ProjectsService) ArchiveProject(id string) error {
    query := `UPDATE projects SET archived = true WHERE id = $1`

    result, err := db.DB.Exec(query, id)
    if err != nil {
        return err
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return err
    }

    if rowsAffected == 0 {
        return fmt.Errorf("project not found")
    }

    return nil
}

// Восстановление проекта из архива
func (s *ProjectsService) RestoreProject(id string) error {
    query := `UPDATE projects SET archived = false WHERE id = $1`

    result, err := db.DB.Exec(query, id)
    if err != nil {
        return err
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return err
    }

    if rowsAffected == 0 {
        return fmt.Errorf("project not found")
    }

    return nil
}

// Полное удаление проекта (hard delete)
func (s *ProjectsService) DeleteProject(id string) error {
    // Проверяем есть ли задачи у проекта
    var taskCount int
    err := db.DB.QueryRow("SELECT COUNT(*) FROM tasks WHERE project_id = $1", id).Scan(&taskCount)
    if err != nil {
        return err
    }

    if taskCount > 0 {
        return fmt.Errorf("cannot delete project with existing tasks")
    }

    query := `DELETE FROM projects WHERE id = $1`
    _, err = db.DB.Exec(query, id)
    return err
}

// Получение архивных проектов
func (s *ProjectsService) GetArchivedProjects() ([]models.Project, error) {
    query := `
        SELECT p.id, p.name, p.client_id, COALESCE(c.name, '') as client_name, 
               p.manager_id, COALESCE(u.first_name || ' ' || u.last_name, '') as manager_name,
               p.start_date, p.end_date, p.status, p.archived, p.created_at
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN users u ON p.manager_id = u.id
        WHERE p.archived = true
        ORDER BY p.id DESC
    `

    rows, err := db.DB.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var projects []models.Project
    for rows.Next() {
        var p models.Project
        var clientName string
        var managerName string
        
        err := rows.Scan(
            &p.ID,
            &p.Name,
            &p.ClientID,
            &clientName,
            &p.ManagerID,
            &managerName,
            &p.StartDate,
            &p.EndDate,
            &p.Status,
            &p.Archived,
            &p.CreatedAt,
        )
        if err != nil {
            return nil, err
        }
        
        p.ClientName = clientName
        p.ManagerName = managerName
        
        projects = append(projects, p)
    }

    return projects, nil
}