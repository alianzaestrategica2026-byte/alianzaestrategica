# ALIANZA ESTRATÉGICA S.A.S. — Portal Corporativo & Marketplace Oficial

![Estado del Despliegue](https://img.shields.io/badge/Estado-Producci%C3%B3n-emerald?style=for-the-badge&logo=github)
![Seguridad Firebase](https://img.shields.io/badge/Seguridad-Firebase%20Auth%20v10-amber?style=for-the-badge&logo=firebase)
![Ubicación](https://img.shields.io/badge/Ubicaci%C3%B3n-El%20Coca%2C%20Orellana%2C%20Ecuador-sky?style=for-the-badge&logo=google-maps)
![RUC](https://img.shields.io/badge/RUC-2200260962001-blue?style=for-the-badge)

Plataforma web corporativa y marketplace de comercialización formal de activos inmobiliarios, vehículos y maquinaria pesada, con respaldo legal y corretaje notarial en la Provincia de Orellana y toda la Región Amazónica del Ecuador.

---

## 🏛️ Información Institucional

* **Razón Social:** ALIANZA ESTRATÉGICA S.A.S.
* **RUC:** 2200260962001
* **Dirección:** Puerto Francisco de Orellana (El Coca), Orellana — Ecuador.
* **Portal Web Oficial:** [https://www.alianzaestrategica2026.com](https://www.alianzaestrategica2026.com)
* **Gerencia General:** Adrián Arturo Íñiguez Lucio
* **Asesoría Jurídica & Notarial:** Abg. Carlos Alfredo Íñiguez Rodríguez
* **Contacto Corporativo:** `gerencia@alianzaestrategica2026.com` | `alianzaestrategica2026@gmail.com`
* **Línea Directa WhatsApp:** [+593 95 919 0794](https://wa.me/593959190794)

---

## 🚀 Arquitectura y Módulos de la Plataforma

### 1. Marketplace Público de Activos
* **Catálogo Multicategoría:** Bienes Raíces (terrenos, casas, fincas comerciales), Vehículos livianos/pesados y Maquinaria Pesada para el sector petrolero, agrícola y de transporte.
* **Búsqueda y Filtros Dinámicos:** Búsqueda en tiempo real por palabras clave, rango de precio, ubicación y estado comercial.
* **Fichas Técnicas Profesionales:** Generación y descarga de fichas técnicas comerciales listas para impresión o PDF con blindaje de marca de agua.
* **Enlace Rápido de Negociación:** Botones dinámicos de contacto por WhatsApp configurados con mensajes predeterminados para cada activo.

### 2. Seguridad y Autenticación Centralizada (Firebase Auth)
* **Cero Credenciales Expuestas:** El código fuente público no almacena contraseñas quemadas ni tokens vulnerables.
* **Autenticación Oficial:** Validación de acceso de Administradores y Agentes Comerciales ejecutada exclusivamente mediante el motor seguro de **Firebase Authentication** (`signInWithEmailAndPassword`).
* **Blindaje de Sesión y Control de Roles (RBAC):**
  * `GUEST` (Modo Público): Navegación libre para el público general y prospectos compradores.
  * `AGENT` (Agente Comercial): Permisos de captación de activos, registro de visitas y cálculo de comisiones.
  * `ADMIN` (Gerencia General): Control total de la plataforma, aprobación de activos, auditoría financiera y gestión del equipo.

### 3. Panel de Gerencia General y Herramientas Administrativas
* **Matriz Financiera v2.0:** Control de comisiones comerciales (fórmula 50/50), cálculo de ingresos corporativos, exportación directa a hojas de cálculo Excel (`.xlsx`) y generación de reportes financieros para impresión.
* **Bitácora de Prospectos y Visitas:** Registro de clientes interesados, fechas de visitas a inmuebles y seguimiento comercial de cierre.
* **Ingreso y Captación de Activos:** Carga de fotografías con compresión inteligente en cliente, especificaciones notariales y metadatos de ubicación.
* **Gestión Autónoma de Agentes y Colaboradores:**
  * Alta de nuevos agentes con contraseña asignada directamente desde el panel sin requerir acceso a la consola de Firebase (mediante patrón de instancia secundaria aislada).
  * Monitoreo dinámico del tiempo transcurrido desde la última conexión de cada colaborador.
  * Enlace directo a WhatsApp para seguimiento por inactividad.
  * Botón de revocación y eliminación inmediata: los agentes dados de baja quedan automáticamente bloqueados para volver a ingresar al sistema.
* **Asistente Virtual Sofía:** Sistema de atención y orientación corporativa con respuestas automáticas sobre servicios notariales y de corretaje.

---

## 🛠️ Stack Tecnológico

* **Frontend:** HTML5 Semántico, Tailwind CSS (Utility-First), JavaScript Modular (ES6+), FontAwesome Icons 6.5.
* **Backend as a Service (BaaS):**
  * **Firebase Authentication:** Gestión cifrada de usuarios y roles.
  * **Cloud Firestore:** Base de datos NoSQL para sincronización en tiempo real de activos, prospectos y bitácoras.
  * **Firebase Storage:** Almacenamiento seguro de documentación y fotografías de activos.
  * **Firebase Analytics:** Monitoreo y métricas de visitas e interacción de usuarios.
* **Despliegue y Alojamiento:** GitHub Pages bajo dominio corporativo con certificado SSL/TLS permanente.

---

## 📂 Estructura del Repositorio

```text
├── index.html            # Archivo maestro de la aplicación web (Marketplace + Dashboard)
├── favicon.ico           # Favicon corporativo oficial
├── og-image.png          # Imagen OpenGraph para previsualizaciones en WhatsApp y redes sociales
├── README.md             # Documentación técnica e institucional del proyecto
└── .gitignore            # Exclusión de temporales y dependencias locales
```

---

## ⚙️ Despliegue y Mantenimiento

Para actualizar cambios o nuevas funcionalidades en la plataforma:

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/alianzaestrategica2026-byte/alianzaestrategica.git
   ```
2. Realizar las modificaciones requeridas en el archivo `index.html`.
3. Confirmar y subir los cambios a la rama principal (`main`):
   ```bash
   git add index.html README.md
   git commit -m "feat: actualización de seguridad y gestión de agentes"
   git push origin main
   ```
4. GitHub Pages compilará y publicará la actualización de forma automática en [https://www.alianzaestrategica2026.com](https://www.alianzaestrategica2026.com) en menos de 60 segundos.

---

## ⚖️ Licencia y Propiedad Intelectual

Todos los derechos reservados © 2026 **ALIANZA ESTRATÉGICA S.A.S.**  
Queda prohibida la reproducción, distribución o modificación no autorizada del código fuente, marcas comerciales y logotipos institucionales sin el consentimiento expreso y por escrito de la Gerencia General.
