const express = require('express');
const router = express.Router();
const { list } = require('../controllers/alertController');
const { requireAuth } = require('../middleware/auth');
const TelegramBot = require('node-telegram-bot-api');
const { KpiAlert, Kpi } = require('../models');

// Setup Telegram Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
let bot = null;

if (token && token.trim() !== '') {
    try {
        bot = new TelegramBot(token, { polling: false }); // No polling, solo push
    } catch (err) {
        console.warn('No se pudo inicializar Telegram Bot. Las alertas no se enviarán.', err);
    }
}

router.get('/', requireAuth, list);

router.post('/scan', requireAuth, async (req, res) => {
    try {
        const { kpis, scope } = req.body;
        let alertsTriggered = 0;

        if (!kpis || kpis.length === 0) {
            return res.json({ message: 'No hay KPIs para escanear', alerts: 0 });
        }

        if (!bot || !chatId) {
            return res.status(500).json({ error: 'Configuración de Telegram incompleta en el servidor' });
        }

        const scopeName = scope === 'global' ? 'FRANQUICIA GLOBAL' : kpis[0]?.restaurant?.name || 'RESTAURANTE';

        let telegramMessage = `🚨 OPENCLAW CMI ALERT SYSTEM\n\nEscaneo preventivo proactivo ejecutado sobre: ${scopeName}\n\n`;

        const alertsToInsert = [];

        // Escanear matemáticamente cada KPI inyectado desde el Frontend
        kpis.forEach(item => {
            const k = item.kpi;
            if (!k.alert_condition || k.alert_threshold == null || k.target_value == null) return;

            const curr = parseFloat(k.current_value || 0);
            const target = parseFloat(k.target_value || 0);
            if (!target) return;

            const ratio = curr / target;
            const threshold = parseFloat(k.alert_threshold) || 1;

            let isAlert = false;
            let conditionText = '';

            if (k.alert_condition === 'below' && ratio <= threshold) {
                isAlert = true;
                conditionText = 'por debajo del umbral mínimo';
            } else if (k.alert_condition === 'above' && ratio >= threshold) {
                isAlert = true;
                conditionText = 'excediendo el límite máximo';
            }

            if (isAlert) {
                alertsTriggered++;
                telegramMessage += `❌ ${k.name}\nValor Actual: ${curr} (Objetivo: ${target})\nDesviación Crítica: ${conditionText}.\n\n`;

                // Persistencia en Historial de BD
                alertsToInsert.push({
                    kpi_id: k.id,
                    recorded_value: curr,
                    target_value: target,
                    threshold: threshold,
                    condition: conditionText
                });
            }
        });

        // Bulk insert en BD
        if (alertsToInsert.length > 0) {
            await KpiAlert.bulkCreate(alertsToInsert);
        }

        if (alertsTriggered === 0) {
            telegramMessage += `✅ Sistema Nominal. No se detectan anomalías u holguras en los procesos operativos.\n`;
        } else {
            telegramMessage += `⚠️ ACCIÓN REQUERIDA: Acceda al CMI y despliegue un OKR correctivo en cascada al mánager responsable.`;
        }

        // Disparar Push a Telegram
        await bot.sendMessage(chatId, telegramMessage);

        res.json({ message: 'Escaneo ejecutado y notificado vía Telegram', alerts: alertsTriggered });

    } catch (error) {
        console.error('Error enviando Telegram Push:', error);
        res.status(500).json({ error: 'Fallo al ejecutar el escáner proactivo' });
    }
});

module.exports = router;
