# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend and frontend code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Set the working directory to the backend for running the app
WORKDIR /app/backend

# Expose the port (handled by Cloud Run via environment variable)
# But we can document it here
EXPOSE 8080

# Command to run the application
# We use uvicorn directly. For production, gunicorn with uvicorn workers is better, 
# but uvicorn is sufficient for this prototype.
CMD ["python", "main.py"]
