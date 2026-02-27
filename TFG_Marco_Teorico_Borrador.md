# Marco Teórico: El Cuadro de Mando Integral (CMI) aplicado a Claunafood S.L.

> **Nota para la redacción final:** Este documento contiene los fundamentos teóricos del CMI. Puedes extraer estos textos, adaptarlos a la plantilla de la universidad (UPSA) y darles el formato (APA, bibliografía, etc.) que requiera la normativa de tu Grado en ADET.

## 1. Origen y Concepto del Cuadro de Mando Integral (Balanced Scorecard)

El Cuadro de Mando Integral (CMI), conocido internacionalmente como *Balanced Scorecard* (BSC), fue introducido en 1992 por Robert S. Kaplan y David P. Norton. Surgió como respuesta a la insuficiencia de los sistemas de medición de gestión tradicionales, los cuales se basaban casi exclusivamente en indicadores financieros retrospectivos. 

Según Kaplan y Norton, depender únicamente de métricas financieras es como conducir un coche mirando solo por el espejo retrovisor. El CMI propone una visión holística que traduce la estrategia y visión de la empresa en un conjunto coherente de indicadores de actuación que proporcionan la estructura necesaria para un sistema de gestión estratégica y medida.

En el contexto de las pequeñas y medianas empresas (PyMEs), y específicamente en el sector de la restauración como es el caso de **Claunafood S.L.**, el CMI permite alinear desde la alta gerencia hasta el personal de sala y cocina hacia unos objetivos comunes y cuantificables.

## 2. Las Cuatro Perspectivas del CMI

El modelo clásico del Cuadro de Mando Integral divide la visión de la empresa en cuatro perspectivas fundamentales e interrelacionadas:

### A. Perspectiva Financiera
Responde a la pregunta: *¿Cómo nos ven nuestros accionistas e inversores?*
Aunque el CMI critica la exclusividad de esta perspectiva, sigue siendo el fin último de las empresas con ánimo de lucro. En el sector HORECA (Hoteles, Restaurantes y Cafeterías), los indicadores clásicos incluyen la rentabilidad sobre la inversión, el crecimiento de los ingresos (Ingreso Total, Ticket Medio) y, fundamentalmente, el control de la estructura de costes (como el *Food Cost* y el coste laboral).

### B. Perspectiva del Cliente
Responde a la pregunta: *¿Cómo nos perciben los clientes?*
Mide la creación de valor para el consumidor. En Claunafood, este pilar mide factores críticos como el tiempo de espera, la satisfacción general respecto a la comida y el servicio, el porcentaje de fidelización (clientes recurrentes) y la percepción de la relación calidad-precio.

### C. Perspectiva de los Procesos Internos
Responde a la pregunta: *¿En qué procesos debemos alcanzar la excelencia?*
Se enfoca en las operaciones internas críticas que permiten satisfacer a los clientes y cumplir con los objetivos financieros. En la restauración, abarca desde la eficiencia en la gestión de inventarios y reducción de mermas, hasta la estandarización de recetas, tiempos de elaboración en cocina y rotación de mesas.

### D. Perspectiva de Aprendizaje y Crecimiento (o Innovación)
Responde a la pregunta: *¿Cómo podemos continuar mejorando y creando valor?*
Es la base que sustenta las otras tres perspectivas. Se refiere al capital humano, los sistemas de información y el clima organizacional. Incluye la formación del personal (camareros, cocineros), las tasas de rotación laboral, y la introducción de tecnología (por ejemplo, el propio desarrollo de este CMI automatizado y las integraciones con IA y OCR para facturas).

## 3. Justificación de la Implementación en Claunafood S.L.

### 3.1 El Problema: Desconexión de Datos en la Restauración
Históricamente, en la restauración independiente (como el de Claunafood en sus locales de Salamanca y Zamora), los datos se encuentran silados. La facturación en papel, las mermas registradas a mano o en hojas de cálculo aisladas, y el recuento manual de tickets (camareros/sala) no permiten tener una visión en tiempo real del estado de salud del negocio. Las previsiones se hacen por intuición y no por analítica de datos (*Data-Driven Decision Making*).

### 3.2 La Solución Arquitectónica (ETL + Dashboard en React/PostgreSQL)
El presente Trabajo de Fin de Grado (TFG) aborda el CMI desde una implementación técnica real y nativa en la nube, alejándose de los modelos estáticos en Excel. La arquitectura desarrollada para Claunafood consta de:
1. **Extracción y Transformación (ETL):** Mediante scripts automatizados en Python y Reconocimiento Óptico de Caracteres (OCR Tesseract), se ingestan los datos de facturación directos desde los cierres de caja en PDF diarios.
2. **Carga y Almacenamiento (Data Warehouse):** Los datos se estructuran en una base de datos relacional robusta (**PostgreSQL**), estandarizando las métricas e historificando los KPIs.
3. **Visualización y Monitoreo Frontend:** Una aplicación web desarrollada en **React** y Node.js que permite a la gerencia de Claunafood visualizar en tiempo real los KPIs críticos (Ingresos Totales, Ticket Medio, *Food Cost*), recibiendo además alertas proactivas a través de sistemas de mensajería (Telegram Bots).

### 3.3 El Papel Indispensable del "Vibe Coding" y la Asistencia de IA
Un aspecto fundamental que define la naturaleza disruptiva de este TFG es la metodología empleada para el desarrollo de la herramienta de software subyacente. La creación del complejo stack tecnológico (Backend, Frontend, Base de Datos y Scripts de Automatización OCR) ha sido posible gracias a la adopción del paradigma conocido como **"Vibe Coding"** (Programación Asistida por Inteligencia Artificial en Lenguaje Natural).

En lugar de requerir un equipo de ingenieros de software tradicional, el desarrollo de la aplicación CMI de Claunafood se ha orquestado delegando la redacción del código de alto nivel y la resolución de arquitecturas complejas a Agentes de Inteligencia Artificial Avanzados (como Google Gemini en entornos como *Antigravity/OpenClaw*). 

Esta metodología demuestra que, en el panorama tecnológico actual, el analista de negocio o el director de operaciones (perfiles ADET) ya no actúa como un mero programador picando código fuente, sino como un **"Orquestador"** o **"Arquitecto"**. Su valor reside en aplicar el conocimiento teórico del Cuadro de Mando Integral y la lógica de negocio de Claunafood, dirigiendo a la Inteligencia Artificial mediante lenguaje natural (*prompts* directivos) para que esta materialice y escriba el código de la herramienta final.

El "Vibe Coding" ha sido, por tanto, una pieza absolutamente indispensable y transversal para poder materializar la teoría del CMI en un software operativo real sin demoras en los tiempos de desarrollo.

---
**Referencias Bibliográficas Recomendadas (Añadir en el TFG):**
- Kaplan, R. S., & Norton, D. P. (1992). *The Balanced Scorecard: Measures That Drive Performance.* Harvard Business Review.
- Kaplan, R. S., & Norton, D. P. (1996). *El Cuadro de Mando Integral*. Gestión 2000.
- Amat, O. (2000). *Control de gestión: una perspectiva de dirección*. Gestión 2000.
