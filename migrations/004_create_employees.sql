-- Создание таблицы должностей
CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Вставка должностей по умолчанию
INSERT INTO positions (name) VALUES
    ('Developer'),
    ('Senior Developer'),
    ('Designer'),
    ('Analyst'),
    ('QA Engineer'),
    ('DevOps Engineer'),
    ('Project Manager'),
    ('Team Lead')
ON CONFLICT (name) DO NOTHING;

-- Создание таблицы сотрудников (связь с users)
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    position_id INTEGER REFERENCES positions(id),
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_position ON employees(position_id);