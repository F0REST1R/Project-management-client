-- Создание таблицы статусов проектов
CREATE TABLE IF NOT EXISTS project_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Вставка статусов по умолчанию
INSERT INTO project_status (name, description) VALUES
    ('initiation', 'Project is being initiated'),
    ('planning', 'Project planning phase'),
    ('active', 'Project is in active development'),
    ('completed', 'Project is completed'),
    ('on-hold', 'Project is temporarily on hold')
ON CONFLICT (name) DO NOTHING;

-- Создание таблицы проектов
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client_id INTEGER REFERENCES clients(id) ON DELETE RESTRICT,
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'initiation',
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_status FOREIGN KEY (status) REFERENCES project_status(name)
);

-- Создание индексов для ускорения запросов
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_manager_id ON projects(manager_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_archived ON projects(archived);

-- Добавьте колонку archived если её нет
ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Добавьте колонку created_at если её нет
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Добавьте колонку updated_at если её нет
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;