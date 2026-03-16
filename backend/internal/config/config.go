package config

import (
	"log"
	"os"
)

type Config struct {
	DBHost string
	DBPort string
	DBUser string
	DBPassword string
	DBName string

	JWTSecret string
}

func Load() *Config {
	cfg := &Config{
		DBHost: getEnv("POSTGRES_HOST", "localhost"),
		DBPort: getEnv("POSTGRES_PORT", "5432"),
		DBUser: getEnv("POSTGRES_USER", "postgres"),
		DBPassword: getEnv("POSTGRES_PASSWORD", ""),
		DBName: getEnv("POSTGRES_DBNAME", "project_management_client"),

		JWTSecret: getEnv("JWT_SECRET", ""),
	}
	return cfg
}

func getEnv(key string, fallback string) string {

	value := os.Getenv(key)

	if value == "" {
		if fallback == "" {
			log.Fatalf("Нехватает данных для подключения: %s", key)
		}
		return fallback
	}

	return value
}