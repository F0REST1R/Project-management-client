package service

import (
    db "backend/internal/database"
    "backend/internal/models"
    "fmt"
)

type EmployeeService struct{}

func NewEmployeeService() *EmployeeService {
    return &EmployeeService{}
}

func (s *EmployeeService) CreateEmployee(employee models.Employee) error {
    // Проверяем существует ли пользователь с таким email
    var userID int
    var firstName, lastName, role string
    err := db.DB.QueryRow(`
        SELECT id, first_name, last_name, role 
        FROM users 
        WHERE email = $1
    `, employee.Email).Scan(&userID, &firstName, &lastName, &role)

    if err != nil {
        return fmt.Errorf("user with email %s does not exist", employee.Email)
    }

    // Проверяем не является ли пользователь уже сотрудником
    var exists bool
    err = db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM employees WHERE user_id = $1)", userID).Scan(&exists)
    if err != nil {
        return err
    }

    if exists {
        return fmt.Errorf("user %s is already an employee", employee.Email)
    }

    // Создаем сотрудника
    query := `
        INSERT INTO employees (user_id, position_id, hourly_rate, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `

    err = db.DB.QueryRow(
        query,
        userID,
        employee.PositionID,
        employee.HourlyRate,
        employee.IsActive,
    ).Scan(&employee.ID)

    return err
}

func (s *EmployeeService) GetAllEmployees() ([]models.Employee, error) {
    query := `
        SELECT e.id, e.user_id, u.first_name, u.last_name, u.email, u.role,
               COALESCE(p.name, '') as position, e.position_id,
               e.hourly_rate, e.is_active
        FROM employees e
        JOIN users u ON e.user_id = u.id
        LEFT JOIN positions p ON e.position_id = p.id
        ORDER BY e.id DESC
    `

    rows, err := db.DB.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var employees []models.Employee
    for rows.Next() {
        var emp models.Employee
        err := rows.Scan(
            &emp.ID,
            &emp.UserID,
            &emp.FirstName,
            &emp.LastName,
            &emp.Email,
            &emp.Role,
            &emp.Position,
            &emp.PositionID,
            &emp.HourlyRate,
            &emp.IsActive,
        )
        if err != nil {
            return nil, err
        }
        employees = append(employees, emp)
    }

    return employees, nil
}

func (s *EmployeeService) GetEmployeeByID(id string) (*models.Employee, error) {
    query := `
        SELECT e.id, e.user_id, u.first_name, u.last_name, u.email, u.role,
               COALESCE(p.name, '') as position, e.position_id,
               e.hourly_rate, e.is_active
        FROM employees e
        JOIN users u ON e.user_id = u.id
        LEFT JOIN positions p ON e.position_id = p.id
        WHERE e.id = $1
    `

    var emp models.Employee
    err := db.DB.QueryRow(query, id).Scan(
        &emp.ID,
        &emp.UserID,
        &emp.FirstName,
        &emp.LastName,
        &emp.Email,
        &emp.Role,
        &emp.Position,
        &emp.PositionID,
        &emp.HourlyRate,
        &emp.IsActive,
    )
    if err != nil {
        return nil, err
    }

    return &emp, nil
}

func (s *EmployeeService) UpdateEmployee(id string, employee models.Employee) error {
    // Проверяем существует ли сотрудник
    var userID int
    err := db.DB.QueryRow("SELECT user_id FROM employees WHERE id = $1", id).Scan(&userID)
    if err != nil {
        return fmt.Errorf("employee not found")
    }

    query := `
        UPDATE employees 
        SET position_id = $1, hourly_rate = $2, is_active = $3
        WHERE id = $4
    `

    result, err := db.DB.Exec(
        query,
        employee.PositionID,
        employee.HourlyRate,
        employee.IsActive,
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
        return fmt.Errorf("employee not found")
    }

    return nil
}

func (s *EmployeeService) DeleteEmployee(id string) error {
    // Проверяем есть ли у сотрудника задачи
    var taskCount int
    err := db.DB.QueryRow(`
        SELECT COUNT(*) FROM tasks 
        WHERE executor_id = (SELECT user_id FROM employees WHERE id = $1)
    `, id).Scan(&taskCount)
    if err != nil {
        return err
    }

    if taskCount > 0 {
        return fmt.Errorf("cannot delete employee with assigned tasks")
    }

    query := `DELETE FROM employees WHERE id = $1`
    _, err = db.DB.Exec(query, id)
    return err
}

func (s *EmployeeService) GetPositions() ([]models.Position, error) {
    query := `SELECT id, name FROM positions ORDER BY id`

    rows, err := db.DB.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var positions []models.Position
    for rows.Next() {
        var p models.Position
        err := rows.Scan(&p.ID, &p.Name)
        if err != nil {
            return nil, err
        }
        positions = append(positions, p)
    }

    return positions, nil
}