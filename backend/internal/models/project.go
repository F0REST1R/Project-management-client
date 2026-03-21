package models

type Project struct {
    ID          int    `json:"id"`
    Name        string `json:"name"`
    ClientID    *int    `json:"client_id"`
    ClientName  string `json:"client_name,omitempty"`
    ManagerID   int    `json:"manager_id"`
    ManagerName string `json:"manager_name,omitempty"`
    StartDate   string `json:"start_date"`
    EndDate     *string `json:"end_date,omitempty"`
    Status      string `json:"status"`
    Archived    bool   `json:"archived"`
    CreatedAt   string `json:"created_at,omitempty"`
}

type ProjectStatus struct {
    ID          int    `json:"id"`
    Name        string `json:"name"`
    Description string `json:"description,omitempty"`
}