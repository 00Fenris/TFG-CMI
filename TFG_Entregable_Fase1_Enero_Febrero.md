# TFG - Entregable Fase 1: Enero / Febrero 2026

**Alumno:** Ignacio Molina Palacios
**Directores:** Marcelo Vallejo García
**Empresa de estudio:** Claunafood S.L.

---

Este documento recopila de forma centralizada todos los hitos exigidos en el Anteproyecto Oficial para la entrega correspondiente a la **Fase 1 (Enero - Febrero 2026)**:
1. Desarrollo del marco teórico.
2. Recopilación de datos sobre Claunafood S.L. y análisis preliminar.
3. Entrega del prototipo del CMI.

---

## 2. Marco teórico
*(Corresponde a la sección 2 del Índice Oficial)*

### 2.1 Origen y Fundamentos del Cuadro de Mando Integral
El Cuadro de Mando Integral (CMI), conocido internacionalmente en la literatura de control de gestión como *Balanced Scorecard* (BSC), fue articulado por vez primera en 1992 por los académicos Robert S. Kaplan y David P. Norton en su seminal artículo de la Harvard Business Review **[INSERTAR CITA AQUÍ: Kaplan y Norton, 1992]**. El modelo nació para corregir una disfunción endémica en la gestión empresarial del siglo XX: la dependencia exclusiva de los modelos contables e indicadores financieros retrospectivos, los cuales contaban fielmente la historia de los eventos pasados pero resultaban totalmente ciegos y obsoletos para guiar la creación de valor y los activos intangibles futuros **[INSERTAR CITA AQUÍ: Amat, 2007 (Control de gestión) o Blanco Ibarra]**.

El CMI trasciende el mero control de las finanzas al alinear la estrategia corporativa con la operativa diaria mediante un "Mapa Estratégico", fundamentado en relaciones empíricas de causa-efecto. Tradicionalmente, se divide la medición en cuatro áreas que actúan como pilar central de la organización:
1. **Perspectiva Financiera:** Centrada en medir el crecimiento de los ingresos, la reducción de costes y la utilización de activos. En el entorno de la restauración comercial y las franquicias (HORECA - Hostelería, Restauración y Cafeterías), estas métricas se concentran irremediablemente en la gestión de los "Prime Costs" (*Food Cost* y *Labor Cost*) y en indicadores de liquidez bruta como el margen EBITDA **[INSERTAR CITA AQUÍ: Autor de finanzas hoteleras, p.ej. Dopson & Hayes, 2015 o Pizam]**.
2. **Perspectiva del Cliente:** Evalúa la viabilidad y fortaleza de la propuesta de valor entregada al mercado objetivo. Aquí se despliegan mediciones cualitativas y cuantitativas sobre tiempos de espera, índices de repetición de visita, captación del mercado (Delivery vs Sala) y métricas de recomendación estandarizadas mundialmente como el NPS (*Net Promoter Score*) **[INSERTAR CITA AQUÍ: Reichheld, 2003 (creador del NPS)]**.
3. **Perspectiva de los Procesos Internos:** Identifica y optimiza la "cadena de valor" y los procesos críticos e ineficientes donde la organización debe alcanzar la excelencia operativa para asegurar su rentabilidad frente a los accionistas. En restauración de volumen y alta demanda, el control de inventarios, las mermas, los protocolos sanitarios e inviolables de cocina (APPC) y la agresiva rotación de mesas para maximizar el factor de rendimiento RevPASH (*Revenue Per Available Seat Hour*) constituyen su espina dorsal **[INSERTAR CITA AQUÍ: Opcional: Kimes, 1999 (Revenue Management en restaurantes)]**.
4. **Perspectiva de Aprendizaje y Crecimiento:** Actúa como el motor del sistema a largo plazo, focalizándose en el capital humano (capacidades), el capital de información (sistemas) y el capital organizacional (clima). La altísima rotación endémica del sector servicios y la rampante falta de profesionalización obligan a las gerencias a auditar la retención y la formación continua de sus equipos base **[INSERTAR CITA AQUÍ: Tracey & Hinkin, 2008 (RRHH hospitality)]**.

### 2.2 Marco Tecnológico: Arquitectura del Software CMI
Este Trabajo de Fin de Grado rechaza el diseño del Cuadro de Mando en formatos estáticos y desactualizados tipo hoja de cálculo (Excel), aportando valor añadido mediante la programación y entrega de un Sistema de Información y software real. Para su concepción, se ha empleado una arquitectura *Full-Stack* moderna que garantiza un despliegue cloud, la seguridad y escalabilidad futura hacia nuevas franquicias operadas por Claunafood S.L.:

*   **Capa de Presentación y Frontend (React.js):** El ecosistema visual del *Dashboard* gerencial se ha programado utilizando React, una librería asíncrona de código abierto (*open-source*) originalmente desarrollada por los ingenieros de Meta. Su diseño modular fundamentado en la renderización del *Virtual DOM* permite mantener una inferfaz de respuesta instantánea donde gráficos avanzados (*Recharts*) se actualizan a inyección de pulsos sin verse obligada a recargar el navegador web **[INSERTAR CITA AQUÍ: Documetnación oficial de React o libro de desarrollo front-end]**.
*   **Capa de Negocio y Servidor (Node.js & Express):** La orquestación y las reglas de validación de los indicadores de Claunafood (alertas de despilfarro, KPIs caídos) se controlan mediante un entorno asíncrono y orientado a eventos basado en Javascript (V8 Engine) a través del micro-framework Express.js. Todo acceso de la franquicia es securizado con protocolos JWT (*JSON Web Tokens*) para asegurar el aislamiento de las métricas **[INSERTAR CITA AQUÍ: Tilkov et al., 2011 (sobre REST APIs) o documentación oficial]**.
*   **Persistencia y Almacenamiento (PostgreSQL):** La inmutabilidad e integridad temporal de los registros económicos son capitales para el análisis histórico y descriptivo de la empresa. Por ello, se desechan las bases de datos no relacionales, adoptando PostgreSQL, referente empresarial debido a su estricto nivel de aislamiento y cumplimiento de los axiomas transaccionales ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad) **[INSERTAR CITA AQUÍ: Momjian, 2001 (PostgreSQL) o libro académico de Arquitectura de Base de Datos relacional]**.

### 2.3 Modelo Subyacente: El Paradigma del "Vibe Coding"

La codificación íntegra y end-to-end (Frontend + Backend + Database) de esta arquitectura corporativa por un único autor se ha cimentado sobre la disrupción que plantea la Inteligencia Artificial Generativa y la ingeniería de instrucciones (*Prompt Engineering*), metodología bautizada en el paradigma pragmático de la Industria 4.0 como el **"Vibe Coding"**.

El "Vibe Coding" (Programación Asistida y Orquestada por Inteligencia Artificial Compleja en Lenguaje Natural) redefine el papel del analista de negocios. Demuestra académicamente que profesionales del control de gestión (perfil formativo ADET) no deben centrarse en actuar como picadores de sintaxis ("Coders"). Su inmenso valor emerge al posicionarse como **"Arquitectos Estratégicos" y "Orquestadores de Sistemas"**. Al modelar con precisión en su mente los requerimientos empresariales (arquitectura contable, modelo relacional, dependencias de diseño), el director de proyecto delega en mallas de LLMs avanzados la redacción hiper-eficiente del código máquina subyacente. Los errores y el *debugging* dejan de ser de sintaxis, y pasan a resolverse sobre modelados lógicos y abstractos liderados de forma visionaria por el propio estratega y directivo **[INSERTAR CITA AQUÍ: Puedes citar aquí cualquier fuente contemporánea de 2023-2025 sobre Inteligencia Artificial aplicada a los negocios o generación de código con LLMs]**.

## 4. Descripción de la empresa Claunafood S.L.
*(Corresponde a la sección 4 del Índice Oficial)*

Al operar bajo un modelo de franquicias, gran parte de los procesos estandarizados de Claunafood (como la facturación o los escandallos teóricos) se encuentran altamente procedimentados y parametrizados en los TPVs **[7] [INSERTAR CITA: Algún autor que hable de la estandarización en franquicias]**. Sin embargo, existe una importante brecha operativa en el **control de inventarios y mermas reales**, cuya gestión diaria en la sala y la cocina resulta dispersa y difícil de trazar. 

Esta falta de visibilidad en los consumos reales frente a los teóricos impide un análisis preciso del *Food Cost*, haciendo que decisiones críticas (reposición, ajustes de menú, capacitación de personal) dependan a menudo de la intuición del gerente y no de una verdadera analítica de datos (*Data-Driven Decision Making*) **[8] [INSERTAR CITA: Autor que defienda las decisiones basadas en datos vs intuición]**. Cubrir este punto ciego es el principal justificador de la implementación de este CMI.

**Estructura y Localización:**
Claunafood S.L. opera en el sector de la restauración masiva mediante el modelo de franquicias, gestionando locales maduros y en expansión. El CMI diseñado cuenta con la capacidad de aislar métricas y crear comparativas (*benchmarking* interno) entre:
- **Restaurante Salamanca:** Enfocado principalmente en un público objetivo universitario, con marcados picos de demanda estacionales.
- **Restaurante Zamora:** (A completar con el tipo de público y perfil de consumo específico de este local).
- **Restaurante LaRuqa (Nueva Apertura):** Local de nueva creación que representa el actual proceso de expansión corporativa de la empresa. Su inclusión en el CMI permitirá prever desviaciones presupuestarias en su fase de asentamiento.

## 8. Plan de implantación del CMI (Prototipo funcional)
*(Se adelanta la presentación técnica del Prototipo CMI desarrollada en la Fase 1)*

La entrega práctica de esta fase consiste en el **Prototipo Funcional del CMI**. 
La solución arquitectónica implementada consta de:
1. **Frontend (Visualización):** Aplicación web desarrollada en **React**, que presenta un Panel de Control (Dashboard) con gráficos dinámicos (Recharts).
2. **Backend (API + Base de Datos):** Servidor API programado en NodeJS (Express) que conecta con una base de datos relacional robusta (**PostgreSQL**).
3. **Batería de Indicadores (KPIs) Operativos Justificados:** El prototipo ya incluye la base de datos precargada con un ecosistema de KPIs monitorizados para los restaurantes maduros (Salamanca y Zamora) y preparados para la integración de **LaRuqa**. La selección de estos indicadores no es arbitraria, sino que responde a la literatura académica especializada en control de gestión hostelera:

| Perspectiva CMI | Indicador (KPI) | Justificación Académica / Autor |
| :--- | :--- | :--- |
| **Financiera** | *Rentabilidad EBITDA* | Indicador universal de eficiencia operativa neta en HORECA. (Dopson & Hayes, 2015). |
| **Financiera** | *Food Cost % y Labor Cost %* | Los "Prime Costs" (Materia prima + Personal) son los pilares de la viabilidad estructural de cualquier franquicia. (Pizam, 2010). |
| **Clientes** | *Índice NPS (Net Promoter Score)* | Métrica estándar para medir la lealtad y probabilidad empírica de recomendación del restaurante. (Reichheld, 2003). |
| **Clientes** | *Tasa de Clientes Recurrentes* | El coste de adquisición de un cliente nuevo supera ampliamente al de retención en entornos saturados. (Kotler et al., 2017). |
| **Procesos** | *Rotación de Mesas (Turnover)* | Métrica esencial del "Revenue Management" en restauración para maximizar el RevPASH (Revenue Per Available Seat Hour). (Kimes, 1999). |
| **Procesos** | *Tiempo Medio de Preparación* | Mide el flujo tenso entre sala y cocina, impactando directamente en la rotación y el NPS. (Davis et al., 2008). |
| **Aprendizaje** | *Tasa de Rotación de Personal* | El coste oculto del sector HORECA. Una alta rotación destruye el conocimiento acumulado y erosiona el servicio. (Tracey & Hinkin, 2008). |

*(En este apartado se incluirán capturas de pantalla del prototipo en funcionamiento visualizando los gráficos y métricas del Dashboard de Claunafood).*

#### 4.1. Fundamentación del Índice de Lealtad: El *Net Promoter Score* (NPS)

De entre la batería de indicadores monitorizados por el panel de control de Claunafood, cobra especial relevancia estratégica el **Net Promoter Score (NPS)**. Desarrollado en 2003 por Fred Reichheld (Bain & Company), el NPS ha trascendido como el estándar de oro (*gold standard*) en la medición empírica de la lealtad y la experiencia del comensal en la hostelería contemporánea.

A diferencia de métricas reactivas y de corto plazo como el ticket medio o el EBITDA (que diagnostican el rendimiento financiero *pasado*), el NPS actúa como un **indicador predictivo (*leading indicator*) de la rentabilidad futura**. Su cálculo se fundamenta en estructurar el *feedback* post-servicio mediante una única pregunta de fácil tabulación: _"En una escala del 0 al 10, ¿con qué probabilidad recomendaría la experiencia en [La Mafia / Ditaly] a un amigo o familiar?"_

El algoritmo de cálculo integrado en el *Backend* del CMI divide a la base de clientes en tres espectros actitudinales:
1. **Promotores (9-10):** Clientes hiper-satisfechos con alto índice de repetición y poder evangelizador (*Word of Mouth* positivo).
2. **Pasivos (7-8):** Clientes mercenarios o indiferentes. Su retención es frágil frente a promociones agresivas de competidores adyacentes.
3. **Detractores (0-6):** Clientes insatisfechos con poder destructor de marca. Impactan severamente en la reputación online (*TripAdvisor, Google Reviews*).

La formulación final, sobre la que el Cuadro de Mando alerta ante desviaciones críticas, se establece como la sustracción porcentual: `NPS = % Promotores - % Detractores`. Un índice NPS consolidado para los locales de Claunafood igual o superior a +50 puntos certifica la excelencia operativa en sala y cocina, garantizando el blindaje de la cuota de mercado local frente a la competencia entrante.
