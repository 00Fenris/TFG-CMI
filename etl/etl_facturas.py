#!/usr/bin/env python3
"""
etl_facturas.py — Bot ETL de Claunafood S.L.
============================================
Nodo B (Windows) ejecuta este script periódicamente (Task Scheduler).
Lee los PDFs de caja del NAS, extrae los totales de ventas con OCR,
actualiza los KPIs en la base de datos PostgreSQL del CMI y envía
alertas de descuadre al bot de Telegram (OpenClaw).

Autor: Nodo A (Mac) — Ignacio Molina Palacios / TFG CMI 2026
"""

import os
import re
import sys
import logging
from datetime import date, datetime
from pathlib import Path

# ── Dependencias ──────────────────────────────────────────────────────────────
# pip install pytesseract Pillow pdf2image psycopg2-binary python-telegram-bot
# ────────────────────────────────────────────────────────────────────────────
try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_path
    import psycopg2
    from psycopg2.extras import RealDictCursor
    import telegram
    import asyncio
except ImportError as e:
    print(f"[ERROR] Dependencia faltante: {e}")
    print("Instala con: pip install pytesseract Pillow pdf2image psycopg2-binary python-telegram-bot")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURACIÓN — edita estos valores o usa variables de entorno
# ─────────────────────────────────────────────────────────────────────────────
NAS_FACTURAS_PATH = Path(os.getenv(
    "NAS_FACTURAS_PATH",
    r"F:\CerebroNAS\Facturas"          # Ruta en Nodo B (Windows)
))
PROCESSED_LOG = Path(os.getenv(
    "PROCESSED_LOG",
    r"F:\CerebroNAS\scripts\processed.log"
))

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     int(os.getenv("DB_PORT", "5432")),
    "dbname":   os.getenv("DB_NAME", "cmi"),
    "user":     os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
}

TELEGRAM_TOKEN   = os.getenv("TELEGRAM_TOKEN", "")   # Token del bot OpenClaw
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")  # Tu chat ID personal

# Mapa restaurante → kpi_id para "Ingresos Mensuales" (ajusta si cambia la BD)
RESTAURANT_KPI_MAP = {
    1: 1,   # Claunafood Salamanca → KPI id=1 (Ingresos Mensuales)
    2: 1,   # Claunafood Zamora    → mismo KPI (ajusta si tienes KPIs por restaurante)
}
RECORDED_BY_USER_ID = 2  # Manager Salamanca (seed data)

# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(r"F:\CerebroNAS\scripts\etl.log", encoding="utf-8"),
    ]
)
log = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# 1. OCR — Extraer datos del PDF
# ─────────────────────────────────────────────────────────────────────────────

def pdf_to_text(pdf_path: Path) -> str:
    """Convierte un PDF a texto plano vía OCR (pytesseract)."""
    log.info(f"OCR: procesando {pdf_path.name}...")
    images = convert_from_path(str(pdf_path), dpi=300)
    full_text = ""
    for img in images:
        full_text += pytesseract.image_to_string(img, lang="spa")
    return full_text


def extract_ventas(text: str) -> dict | None:
    """
    Extrae los KPIs de ventas del texto OCR de una factura/cierre de caja.
    Busca patrones como:
        TOTAL: 1.234,56 €
        TOTAL VENTAS: 1234.56
        Total del día: 2.500,00
    Devuelve un dict con los campos extraídos o None si no encuentra nada.
    """
    # Normaliza el texto
    text_norm = text.replace(".", "").replace(",", ".")

    patterns = {
        "total_ventas": [
            r"(?:TOTAL\s*VENTAS?|TOTAL\s*DÍA?|CIERRE\s*CAJA)[:\s]+(\d+\.?\d*)",
            r"TOTAL[:\s]+(\d+\.?\d*)\s*€?",
        ],
        "num_tickets": [
            r"(?:Nº?\s*TICKETS?|TICKETS?|COMANDAS?)[:\s]+(\d+)",
        ],
        "coste_alimentos": [
            r"(?:COSTE\s*ALIM\w*|FOOD\s*COST)[:\s]+(\d+\.?\d*)\s*€?",
        ],
    }

    result = {}
    for field, pats in patterns.items():
        for pat in pats:
            m = re.search(pat, text_norm, re.IGNORECASE)
            if m:
                result[field] = float(m.group(1))
                break

    if "total_ventas" not in result:
        log.warning("No se encontró TOTAL VENTAS en el documento.")
        return None

    # Ticket medio derivado
    if "num_tickets" in result and result["num_tickets"] > 0:
        result["ticket_medio"] = round(result["total_ventas"] / result["num_tickets"], 2)

    return result


# ─────────────────────────────────────────────────────────────────────────────
# 2. PostgreSQL — Insertar en kpi_entries
# ─────────────────────────────────────────────────────────────────────────────

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


def insert_kpi_entry(conn, kpi_id: int, value: float, period_start: date, note: str = ""):
    """Inserta un nuevo registro histórico de KPI."""
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO kpi_entries (kpi_id, recorded_by, value, period_start, note)
            VALUES (%s, %s, %s, %s, %s)
        """, (kpi_id, RECORDED_BY_USER_ID, value, period_start, note))
    conn.commit()
    log.info(f"✅ kpi_entries: KPI {kpi_id} = {value} para {period_start}")


def update_kpi_current_value(conn, kpi_id: int, value: float):
    """Actualiza el valor actual del KPI en la tabla kpis."""
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE kpis SET current_value = %s, updated_at = now()
            WHERE id = %s
        """, (value, kpi_id))
    conn.commit()


def check_alert(conn, kpi_id: int, value: float) -> tuple[bool, dict | None]:
    """Comprueba si el nuevo valor del KPI dispara una alerta."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT name, target_value, alert_condition, alert_threshold
            FROM kpis WHERE id = %s
        """, (kpi_id,))
        kpi = cur.fetchone()

    if not kpi or kpi["target_value"] is None or kpi["alert_threshold"] is None:
        return False, None

    ratio = value / float(kpi["target_value"]) if float(kpi["target_value"]) != 0 else 1.0
    threshold = float(kpi["alert_threshold"])

    triggered = (
        (kpi["alert_condition"] == "below" and ratio < threshold) or
        (kpi["alert_condition"] == "above" and ratio > threshold)
    )
    return triggered, dict(kpi) if triggered else None


def log_kpi_alert(conn, kpi_id: int, value: float, kpi_data: dict):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO kpi_alerts (kpi_id, recorded_value, target_value, threshold, condition)
            VALUES (%s, %s, %s, %s, %s)
        """, (kpi_id, value, kpi_data["target_value"], kpi_data["alert_threshold"], kpi_data["alert_condition"]))
    conn.commit()


# ─────────────────────────────────────────────────────────────────────────────
# 3. Telegram — Alertas vía OpenClaw
# ─────────────────────────────────────────────────────────────────────────────

async def _send_telegram(token: str, chat_id: str, message: str):
    bot = telegram.Bot(token=token)
    await bot.send_message(chat_id=chat_id, text=message, parse_mode="Markdown")


def send_telegram_alert(message: str):
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        log.warning("Telegram no configurado (TELEGRAM_TOKEN / TELEGRAM_CHAT_ID vacíos).")
        return
    try:
        asyncio.run(_send_telegram(TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, message))
        log.info("📱 Alerta enviada por Telegram.")
    except Exception as e:
        log.error(f"Error enviando Telegram: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# 4. Archivos procesados — evitar re-procesar
# ─────────────────────────────────────────────────────────────────────────────

def load_processed(log_path: Path) -> set:
    if not log_path.exists():
        return set()
    with open(log_path, "r", encoding="utf-8") as f:
        return set(line.strip() for line in f if line.strip())


def mark_processed(log_path: Path, filename: str):
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(filename + "\n")


# ─────────────────────────────────────────────────────────────────────────────
# 5. MAIN — Orquestación del pipeline
# ─────────────────────────────────────────────────────────────────────────────

def run_etl():
    log.info("=" * 60)
    log.info("🚀 ETL Claunafood — Inicio de proceso")
    log.info(f"📂 Carpeta NAS: {NAS_FACTURAS_PATH}")

    if not NAS_FACTURAS_PATH.exists():
        log.error(f"La carpeta NAS no existe o no está montada: {NAS_FACTURAS_PATH}")
        send_telegram_alert(
            f"⚠️ *ETL Claunafood ERROR*\n"
            f"No se puede acceder a la carpeta de facturas:\n`{NAS_FACTURAS_PATH}`"
        )
        return

    processed = load_processed(PROCESSED_LOG)
    pdfs = sorted(NAS_FACTURAS_PATH.glob("*.pdf"))

    if not pdfs:
        log.info("No hay PDFs nuevos para procesar.")
        return

    conn = get_db_connection()
    summary_lines = []
    errors = []

    for pdf_path in pdfs:
        if pdf_path.name in processed:
            log.debug(f"Saltando (ya procesado): {pdf_path.name}")
            continue

        log.info(f"📄 Procesando: {pdf_path.name}")

        try:
            text = pdf_to_text(pdf_path)
            datos = extract_ventas(text)

            if datos is None:
                log.warning(f"⚠️ No se pudieron extraer datos de: {pdf_path.name}")
                errors.append(pdf_path.name)
                continue

            # Inferir restaurante desde el nombre del archivo (ej: "2026-02-25_Salamanca.pdf")
            restaurant_id = 1
            if "zamora" in pdf_path.stem.lower():
                restaurant_id = 2

            kpi_id = RESTAURANT_KPI_MAP.get(restaurant_id, 1)
            period = date.today()
            total = datos["total_ventas"]
            note = f"ETL automático desde: {pdf_path.name}"

            # Insertar en BD
            insert_kpi_entry(conn, kpi_id, total, period, note)
            update_kpi_current_value(conn, kpi_id, total)

            # Comprobar alerta
            alerted, kpi_data = check_alert(conn, kpi_id, total)
            if alerted:
                log_kpi_alert(conn, kpi_id, total, kpi_data)
                msg = (
                    f"🚨 *Alerta KPI — {kpi_data['name']}*\n"
                    f"📅 Fecha: {period}\n"
                    f"📉 Valor registrado: *{total:,.2f}€*\n"
                    f"🎯 Objetivo: {float(kpi_data['target_value']):,.2f}€\n"
                    f"📄 Fuente: `{pdf_path.name}`"
                )
                send_telegram_alert(msg)

            summary_lines.append(f"✅ {pdf_path.name}: {total:,.2f}€")
            mark_processed(PROCESSED_LOG, pdf_path.name)

        except Exception as e:
            log.exception(f"Error procesando {pdf_path.name}: {e}")
            errors.append(pdf_path.name)

    conn.close()

    # Resumen diario por Telegram
    if summary_lines:
        resumen = (
            f"📊 *ETL Claunafood — Resumen {date.today()}*\n\n"
            + "\n".join(summary_lines)
        )
        if errors:
            resumen += f"\n\n⚠️ *Con errores:* {', '.join(errors)}"
        send_telegram_alert(resumen)

    log.info("✅ ETL completado.")
    log.info("=" * 60)


if __name__ == "__main__":
    run_etl()
