# Trabajo de Fin de Grado (ADET): Diseño e implementación de un Cuadro de Mando Integral en empresas del sector hostelero (Claunafood S.L.)

> **Alumno:** Ignacio Molina Palacios
> **Directores:** Marcelo Vallejo García
> **Empresa de estudio:** Claunafood S.L. (Restaurantes en Salamanca y Zamora)

---

## 1. Introducción y Justificación

### 1.1 Presentación del tema y relevancia
El presente Trabajo de Fin de Grado tiene como objetivo diseñar e implementar de forma técnica un Cuadro de Mando Integral (CMI) para Claunafood S.L., una empresa familiar en proceso de expansión que actualmente gestiona dos restaurantes franquiciados ubicados en Salamanca y Zamora, y un tercer restaurante de nueva apertura llamado **LaRuqa**. 

La elección de esta empresa obedece a la necesidad de desarrollar un proyecto con un enfoque eminentemente práctico, alejándose del plano meramente teórico. Históricamente, en la restauración independiente, los datos operativos se encuentran silados y dispersos (facturación en papel, control de mermas manual, etc.), impidiendo una visión holística y en tiempo real del estado de salud del negocio en una fase crítica como es la expansión a nuevos locales.

### 1.2 "Vibe Coding" como motor de desarrollo de la herramienta
Una aportación fundamental que define la naturaleza disruptiva de este TFG es la metodología empleada para la creación del software de Cuadro de Mando Integral. Frente a los tradicionales CMI teóricos plasmados en hojas de cálculo estáticas, este proyecto se ha materializado en un **stack web operativo y nativo (React y PostgreSQL)**.

La creación de arquitecturas de software tan complejas ha sido posible gracias a la adopción del paradigma conocido como **"Vibe Coding"** (Programación Asistida por Inteligencia Artificial en Lenguaje Natural). Esta metodología demuestra que en el panorama de la Industria 4.0, el analista de negocio o director de operaciones (perfil ADET) ya no actúa como un mero programador técnico. Su valor reside ahora en desempeñarse como un **"Orquestador" o "Arquitecto Estratégico"**. 

Aplicando su conocimiento sobre control de gestión e indicadores a la realidad de Claunafood, el orquestador dirige a Agentes de Inteligencia Artificial (como LLMs avanzados) para escribir, depurar e implementar el código de la herramienta final. El "Vibe Coding" ha resultado, por tanto, una pieza absolutamente indispensable y transversal para poder materializar el CMI y acortar los tiempos de desarrollo tradicional de software.

## 2. Marco Teórico
*Concepto y estructura del Cuadro de Mando Integral, referencias a Kaplan y Norton, y aplicación de las cuatro perspectivas clásicas (Financiera, de Cliente, Procesos Internos y Aprendizaje/Crecimiento) al sector HORECA.*

*(Ver sección teórica completa generada previamente al respecto).*

## 3. Revisión de Modelos de Control de Gestión y Arquitectura Técnica
Frente al modelo clásico de control *a posteriori*, el TFG propone una implementación técnica en tiempo real:
- **Extracción Automática (ETL):** Ingestión de facturas mediante Reconocimiento Óptico de Caracteres (OCR).
- **Almacenamiento (Warehouse):** Base de datos relacional PostgreSQL.
- **Visualización (Frontend):** Dashboard en tiempo real (React) con alertas automatizadas vía bots de mensajería al gerente de sala.

## 4. Descripción de la Empresa: Claunafood S.L.
### 4.1 Historia, actividad y estructura
Claunafood opera en el sector de la restauración masiva mediante el modelo de franquicias, con un enfoque en la estandarización operativa y el control estricto de costes (*Food Cost*, mermas).

### 4.2 Localización y particularidades
El CMI diseñado debe permitir analizar el rendimiento general de Claunafood, pero también debe contar con la capacidad de aislar métricas y crear comparativas (*benchmarking* interno) entre:
- **Restaurante Salamanca:** (Describir público objetivo, picos de demanda universitarios, volumen).
- **Restaurante Zamora:** (Describir público y comportamiento).
- **Nuevo Restaurante (LaRuqa):** Local en fase de expansión/apertura. El CMI será clave para monitorizar su rentabilidad inicial y el coste de asentamiento frente a los locales maduros.

## 5. Análisis de la Situación Actual
*Esta sección se desarrollará en futuras iteraciones del documento.*
- Diagnóstico general y Análisis DAFO.
- Identificación de procesos clave (Cocina, Sala, Compras).

## 6. Diseño del Cuadro de Mando Integral
*Definición de objetivos estratégicos, selección de KPIs (Ticket Medio, % Coste de Personal, Rentabilidad de mesas) y trazado del Mapa Estratégico (causa-efecto).*

## 7. Plan de Implantación y Conclusiones
*Roles, despliegue físico de la aplicación web en los restaurantes y evaluación del impacto analítico en Claunafood.*
