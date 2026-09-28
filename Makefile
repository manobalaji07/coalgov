.PHONY: install seed backend web dev test docker-up docker-down

install:
	python -m venv venv
	.\venv\Scripts\pip install -r backend\requirements.txt
	cmd /c "cd web && npm install"

seed:
	.\venv\Scripts\python backend\scripts\seed_demo.py

backend:
	.\venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend

web:
	cmd /c "cd web && npm run dev"

test:
	.\venv\Scripts\pytest backend\tests

docker-up:
	docker compose -f infra/docker-compose.yml up --build -d

docker-down:
	docker compose -f infra/docker-compose.yml down
