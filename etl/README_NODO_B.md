# 🖥️ Instrucciones para Nodo B (Windows) — Bot ETL Grupo HORECA Demo

> Este script lo diseñó **Nodo A (Mac)**. Tú (Nodo B) solo tienes que instalarlo y programarlo.

---

## 1. Instalar dependencias Python

Abre PowerShell como Administrador y ejecuta:

```powershell
pip install pytesseract Pillow pdf2image psycopg2-binary python-telegram-bot
```

También necesitas **Tesseract OCR** instalado en el sistema:
- Descarga el instalador de: https://github.com/UB-Mannheim/tesseract/wiki
- Durante la instalación, marca la opción de **español (spa)**
- Añade la ruta al PATH (normalmente `C:\Program Files\Tesseract-OCR`)

Y **Poppler** para pdf2image:
- Descarga de: https://github.com/oschwartz10612/poppler-windows/releases
- Extrae y añade `<poppler>\bin` al PATH

---

## 2. Configurar variables de entorno

```powershell
# Copia el .env.example y rellena tus datos
copy .env.example .env
notepad .env
```

Edita al menos:
- `DB_PASSWORD` → tu contraseña de PostgreSQL
- `TELEGRAM_TOKEN` → token de OpenClaw
- `TELEGRAM_CHAT_ID` → tu chat ID

---

## 3. Crear la carpeta de facturas en el NAS

```powershell
mkdir F:\CerebroNAS\Facturas
mkdir F:\CerebroNAS\scripts
```

Los PDFs de caja que tires aquí serán procesados automáticamente.

**Convención de nombres recomendada para los PDFs:**
```
2026-02-25_Salamanca.pdf
2026-02-25_Zamora.pdf
```

---

## 4. Programar el script con Task Scheduler

Ejecuta desde PowerShell:

```powershell
$action  = New-ScheduledTaskAction -Execute "python" -Argument "F:\CerebroNAS\scripts\etl_facturas.py"
$trigger = New-ScheduledTaskTrigger -Daily -At "08:00AM"
$settings = New-ScheduledTaskSettingsSet -RunOnlyIfNetworkAvailable -WakeToRun
Register-ScheduledTask -TaskName "ETL_Grupo HORECA Demo" -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest
```

> El script correrá todos los días a las 8:00 AM, procesará los PDFs nuevos y enviará el resumen a Telegram.

---

## 5. Test manual

```powershell
cd F:\CerebroNAS\scripts
python etl_facturas.py
```

Comprueba el log generado en `F:\CerebroNAS\scripts\etl.log`.

---

## 6. ACK — Deja un mensaje en el Inbox.md para Nodo A

Cuando hayas terminado la instalación, añade un bloque en el `Inbox.md`:

```
> ✅ NODO B ACK: Entorno ETL preparado. Tesseract instalado, Task Scheduler configurado.
```

---

*Script generado automáticamente por Nodo A (Mac) — 25 Feb 2026*
