# Entorno Ligero y Oficial de Python
FROM python:3.11-slim

# Metadatos del TFG
LABEL maintainer="Ignacio Molina Palacios <TFG CMI>"
LABEL description="OpenClaw Worker - Módulo ETL de Extracción y Procesamiento de Facturas PFD -> PostgreSQL"

# Desactivar buffer para ver los logs en tiempo real en la consola de Windows
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema operativo (Poppler para PDFs, tesseract-ocr si se usa OCR)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements (si no los hay, copiará el script directamente)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt || true

# Como el script de Python usa librerías específicas (pandas, pdfplumber, psycopg2, sqlalchemy, python-dotenv)
# nos aseguramos de instalarlas explícitamente en el contenedor:
RUN pip install --no-cache-dir \
    pandas \
    pdfplumber \
    psycopg2-binary \
    SQLAlchemy \
    python-dotenv \
    node-telegram-bot-api \
    watchdog

# Copiar todo el código de la carpeta ETL (workers, scripts, configs)
COPY . .

# Comando Inmortal que mantendrá el contenedor arriba escaneando
# Asumimos que el script principal se llama openclaw_worker.py (cámbialo si es otro)
CMD ["python", "openclaw_worker.py"]
