package handlers

import (
    "backend/internal/models"
    "backend/internal/service"
    "encoding/json"
    "log"
    "net/http"
    "strings"
)

type EmployeeHandler struct {
    Service *service.EmployeeService
}

func NewEmployeeHandler() *EmployeeHandler {
    return &EmployeeHandler{
        Service: service.NewEmployeeService(),
    }
}

func (h *EmployeeHandler) CreateEmployee(w http.ResponseWriter, r *http.Request) {
    var employee models.Employee

    err := json.NewDecoder(r.Body).Decode(&employee)
    if err != nil {
        http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
        return
    }

    // Валидация
    if employee.Email == "" {
        http.Error(w, `{"error":"email is required"}`, http.StatusBadRequest)
        return
    }

    if employee.PositionID == 0 {
        http.Error(w, `{"error":"position is required"}`, http.StatusBadRequest)
        return
    }

    if employee.HourlyRate <= 0 {
        http.Error(w, `{"error":"hourly rate must be greater than 0"}`, http.StatusBadRequest)
        return
    }

    err = h.Service.CreateEmployee(employee)
    if err != nil {
        log.Println("Error creating employee:", err)
        http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{
        "message": "employee created successfully",
    })
}

func (h *EmployeeHandler) GetEmployees(w http.ResponseWriter, r *http.Request) {
    employees, err := h.Service.GetAllEmployees()
    if err != nil {
        log.Println("Error getting employees:", err)
        http.Error(w, `{"error":"failed to get employees"}`, http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(employees)
}

func (h *EmployeeHandler) GetEmployee(w http.ResponseWriter, r *http.Request) {
    pathParts := strings.Split(r.URL.Path, "/")
    id := pathParts[len(pathParts)-1]

    employee, err := h.Service.GetEmployeeByID(id)
    if err != nil {
        http.Error(w, `{"error":"employee not found"}`, http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(employee)
}

func (h *EmployeeHandler) UpdateEmployee(w http.ResponseWriter, r *http.Request) {
    pathParts := strings.Split(r.URL.Path, "/")
    id := pathParts[len(pathParts)-1]

    var employee models.Employee
    err := json.NewDecoder(r.Body).Decode(&employee)
    if err != nil {
        http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
        return
    }

    if len(employee.FirstName) < 2 {
        http.Error(w, `{"error":"first name must be at least 2 characters"}`, http.StatusBadRequest)
        return
    }

    if len(employee.LastName) < 2 {
        http.Error(w, `{"error":"last name must be at least 2 characters"}`, http.StatusBadRequest)
        return
    }

    if employee.Email == "" {
        http.Error(w, `{"error":"email is required"}`, http.StatusBadRequest)
        return
    }

    err = h.Service.UpdateEmployee(id, employee)
    if err != nil {
        if strings.Contains(err.Error(), "not found") {
            http.Error(w, `{"error":"employee not found"}`, http.StatusNotFound)
            return
        }
        log.Println("Error updating employee:", err)
        http.Error(w, `{"error":"failed to update employee"}`, http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "message": "employee updated successfully",
    })
}

func (h *EmployeeHandler) DeleteEmployee(w http.ResponseWriter, r *http.Request) {
    pathParts := strings.Split(r.URL.Path, "/")
    id := pathParts[len(pathParts)-1]

    err := h.Service.DeleteEmployee(id)
    if err != nil {
        if strings.Contains(err.Error(), "cannot delete") {
            http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
            return
        }
        if strings.Contains(err.Error(), "not found") {
            http.Error(w, `{"error":"employee not found"}`, http.StatusNotFound)
            return
        }
        log.Println("Error deleting employee:", err)
        http.Error(w, `{"error":"failed to delete employee"}`, http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "message": "employee deleted successfully",
    })
}

func (h *EmployeeHandler) GetPositions(w http.ResponseWriter, r *http.Request) {
    positions, err := h.Service.GetPositions()
    if err != nil {
        log.Println("Error getting positions:", err)
        http.Error(w, `{"error":"failed to get positions"}`, http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(positions)
}

