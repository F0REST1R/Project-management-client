package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"log"
	"net/http"
	"strings"
)

func main() {
	cfg := config.Load()

	db.Connect(cfg)

	authHandler := handlers.NewAuthHandler(cfg)
	clientHandler := handlers.NewClientHandler()
	projectHandler := handlers.NewProjectHandler()
    employeeHandler := handlers.NewEmployeeHandler()

	//Страница регистрации
	http.HandleFunc("/api/auth/register", cors(authHandler.Register))
	http.HandleFunc("/api/auth/login", cors(authHandler.Login))
	http.HandleFunc("/api/auth/me", cors(authHandler.GetCurrentUser))
	
	http.HandleFunc("/health", health)
	
    //=============== Страница клиентов ===============
    http.HandleFunc("/api/clients", cors(clientHandler.GetClients))   
    http.HandleFunc("/api/clients/create", cors(clientHandler.CreateClient)) 
	http.HandleFunc("/api/clients/", cors(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/api/clients/")
		
		// Если путь пустой или "create" - не обрабатываем здесь
		if path == "" || path == "create" {
			http.NotFound(w, r)
			return
		}
		
		// Определяем метод и вызываем нужный обработчик
		switch r.Method {
		case "PUT":
			clientHandler.UpdateClient(w, r)
		case "DELETE":
			clientHandler.DeleteClient(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})) 
    //=============== Страница проектов ===============
        http.HandleFunc("/api/projects", cors(projectHandler.GetProjects))
	    http.HandleFunc("/api/projects/", cors(func(w http.ResponseWriter, r *http.Request) {
        path := strings.TrimPrefix(r.URL.Path, "/api/projects/")

        // GET /api/projects - список проектов
        if path == "" && r.Method == "GET" {
            projectHandler.GetProjects(w, r)
            return
        }

        // GET /api/projects/archived - архивные проекты
        if path == "archived" && r.Method == "GET" {
            projectHandler.GetArchivedProjects(w, r)
            return
        }

        // POST /api/projects/create - создание
        if path == "create" && r.Method == "POST" {
            projectHandler.CreateProject(w, r)
            return
        }

        parts := strings.Split(path, "/")
        if len(parts) >= 2 {
            action := parts[1]

            switch action {
            case "archive":
                if r.Method == "PUT" {
                    projectHandler.ArchiveProject(w, r)
                    return
                }
            case "restore":
                if r.Method == "PUT" {
                    projectHandler.RestoreProject(w, r)
                    return
                }
            }
        }

        // Обработка /api/projects/{id}
        if path != "" && path != "create" && path != "archived" {
            switch r.Method {
            case "GET":
                projectHandler.GetProject(w, r)
            case "PUT":
                projectHandler.UpdateProject(w, r)
            case "DELETE":
                projectHandler.DeleteProject(w, r)
            default:
                http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            }
            return
        }

        http.NotFound(w, r)
    }))

    //=============== Страница работников ===============
    http.HandleFunc("/api/employees", cors(employeeHandler.GetEmployees))
    http.HandleFunc("/api/employees/positions", cors(employeeHandler.GetPositions))
    http.HandleFunc("/api/employees/create", cors(employeeHandler.CreateEmployee))
    http.HandleFunc("/api/employees/", cors(func(w http.ResponseWriter, r *http.Request) {
        path := strings.TrimPrefix(r.URL.Path, "/api/employees/")
        
        if path == "" {
            http.NotFound(w, r)
            return
        }
        
        switch r.Method {
        case "GET":
            employeeHandler.GetEmployee(w, r)
        case "PUT":
            employeeHandler.UpdateEmployee(w, r)
        case "DELETE":
            employeeHandler.DeleteEmployee(w, r)
        default:
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        }
    }))
	log.Println("Server started on :8080")
	http.ListenAndServe(":8080", nil)

}

func health(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("OK"))
}

func cors(handler http.HandlerFunc) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS	")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		handler(w, r)
	}
}