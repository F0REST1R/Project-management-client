package handlers

import (
	"backend/internal/models"
	"backend/internal/service"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

type ProjectHandler struct {
    Service *service.ProjectsService
}

func NewProjectHandler() *ProjectHandler {
    return &ProjectHandler{
        Service: service.NewProjectsService(),
    }
}

func (h *ProjectHandler) CreateProject(w http.ResponseWriter, r *http.Request) {
    var project models.Project

    err := json.NewDecoder(r.Body).Decode(&project)
    if err != nil {
        http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
        return
    }

    // Валидация
    if len(project.Name) < 3 {
        http.Error(w, `{"error":"project name must be at least 3 characters"}`, http.StatusBadRequest)
        return
    }


    if project.ManagerID == 0 {
        http.Error(w, `{"error":"manager is required"}`, http.StatusBadRequest)
        return
    }

    err = h.Service.CreateProject(project)
    if err != nil {
        http.Error(w, `{"error":"failed to create project"}`, http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{
        "message": "project created successfully",
    })
}

func (h *ProjectHandler) GetProjects(w http.ResponseWriter, r *http.Request) {
    archivedParam := r.URL.Query().Get("archived")
    
    var includeArchived bool
    if archivedParam == "true" {
        includeArchived = true  // показываем все проекты (включая архивные)
    } else {
        includeArchived = false  // показываем только активные (archived=false)
    }
    
    projects, err := h.Service.GetAllProjects(includeArchived)
    if err != nil {
        log.Println("Error getting projects:", err) // Добавьте лог
        http.Error(w, `{"error":"failed to get projects"}`, http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(projects)
}

func (h *ProjectHandler) GetProject(w http.ResponseWriter, r *http.Request) {
    pathParts := strings.Split(r.URL.Path, "/")
    id := pathParts[len(pathParts)-1]

    project, err := h.Service.GetProjectByID(id)
    if err != nil {
        http.Error(w, `{"error":"project not found"}`, http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(project)
}

func (h *ProjectHandler) UpdateProject(w http.ResponseWriter, r *http.Request) {
    pathParts := strings.Split(r.URL.Path, "/")
    id := pathParts[len(pathParts)-1]

    var project models.Project
    err := json.NewDecoder(r.Body).Decode(&project)
    if err != nil {
        http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
        return
    }

    if len(project.Name) < 3 {
        http.Error(w, `{"error":"project name must be at least 3 characters"}`, http.StatusBadRequest)
        return
    }

    err = h.Service.UpdateProject(id, project)
    if err != nil {
        if strings.Contains(err.Error(), "not found") {
            http.Error(w, `{"error":"project not found"}`, http.StatusNotFound)
            return
        }
        http.Error(w, `{"error":"failed to update project"}`, http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "message": "project updated successfully",
    })
}

func (h *ProjectHandler) ArchiveProject(w http.ResponseWriter, r *http.Request) {
    pathParts := strings.Split(r.URL.Path, "/")
    id := pathParts[len(pathParts)-2] // /api/projects/{id}/archive

    err := h.Service.ArchiveProject(id)
    if err != nil {
        if strings.Contains(err.Error(), "not found") {
            http.Error(w, `{"error":"project not found"}`, http.StatusNotFound)
            return
        }
        http.Error(w, `{"error":"failed to archive project"}`, http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "message": "project archived successfully",
    })
}

func (h *ProjectHandler) RestoreProject(w http.ResponseWriter, r *http.Request) {
    pathParts := strings.Split(r.URL.Path, "/")
    id := pathParts[len(pathParts)-2] // /api/projects/{id}/restore

    err := h.Service.RestoreProject(id)
    if err != nil {
        if strings.Contains(err.Error(), "not found") {
            http.Error(w, `{"error":"project not found"}`, http.StatusNotFound)
            return
        }
        http.Error(w, `{"error":"failed to restore project"}`, http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "message": "project restored successfully",
    })
}

func (h *ProjectHandler) DeleteProject(w http.ResponseWriter, r *http.Request) {
    pathParts := strings.Split(r.URL.Path, "/")
    id := pathParts[len(pathParts)-1]

    err := h.Service.DeleteProject(id)
    if err != nil {
        if strings.Contains(err.Error(), "cannot delete") {
            http.Error(w, `{"error":"cannot delete project with existing tasks"}`, http.StatusBadRequest)
            return
        }
        if strings.Contains(err.Error(), "not found") {
            http.Error(w, `{"error":"project not found"}`, http.StatusNotFound)
            return
        }
        http.Error(w, `{"error":"failed to delete project"}`, http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "message": "project deleted successfully",
    })
}

func (h *ProjectHandler) GetArchivedProjects(w http.ResponseWriter, r *http.Request) {
    projects, err := h.Service.GetArchivedProjects()
    if err != nil {
        http.Error(w, `{"error":"failed to get archived projects"}`, http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(projects)
}