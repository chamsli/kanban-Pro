
# KANBAN PRO – Gestor de tareas y planificación diaria

## 1. Descripción del proyecto

Kanban Pro es una aplicación web desarrollada con HTML, CSS y JavaScript que permite gestionar tareas mediante un tablero Kanban y organizar el tiempo disponible de cada día.

El proyecto parte de la aplicación desarrollada anteriormente en la actividad AC6 y amplía sus funcionalidades mediante la integración de librerías JavaScript externas.

El objetivo principal es ayudar al usuario a organizar sus tareas, distribuir el tiempo disponible y visualizar de forma gráfica su planificación diaria.

## 2. Tecnologías utilizadas

- HTML5 y CSS3: estructura de la aplicación diseño y estilos.
- JavaScript: lógica e interactividad.
- localStorage: almacenamiento de información en el navegador.
- Apache ECharts: visualización gráfica del tiempo.
- Driver.js: tutorial interactivo.
- canvas-confetti: animaciones de celebración.

Las librerías externas se integran mediante CDN, por lo que no es necesario instalar dependencias con npm.

## 3. Funcionalidades principales

### 3.1. Tablero Kanban

Se conserva la funcionalidad de la actividad AC6.

El usuario puede:

- Crear nuevas tareas.
- Añadir una descripción.
- Seleccionar el estado de una tarea.
- Cambiar el estado entre pendiente, en proceso y completada.
- Eliminar tareas.
- Cambiar el orden de las tareas.
- Contraer y expandir las columnas.
- Consultar el número total de tareas.

### 3.2. Daily Planner

Se incorpora una nueva sección denominada Daily Planner.
Esta funcionalidad permite:

- Seleccionar una fecha.
- Definir las horas disponibles para trabajar.
- Seleccionar tareas existentes del tablero Kanban.
- Añadir tareas a la planificación diaria.
- Asignar una duración en minutos.
- Modificar la duración de las tareas.
- Eliminar tareas de la planificación sin eliminarlas del tablero.
- Consultar el tiempo total planificado.
- Consultar el tiempo restante.
- Detectar cuando el tiempo planificado supera la disponibilidad.

Cada fecha tiene su propia planificación independiente.

### 3.3. Visualización gráfica

El tiempo se representa mediante un gráfico circular tipo doughnut.
El gráfico muestra la distribución del tiempo entre las tareas planificadas y el tiempo restante.
Se actualiza automáticamente cuando el usuario modifica la planificación.

### 3.4. Tutorial interactivo

Se incorpora un botón de ayuda que inicia un tutorial guiado.
El tutorial explica cómo utilizar el Daily Planner mediante elementos destacados y mensajes informativos.

### 3.5. Animación de finalización

Cuando una tarea pasa al estado completado, se muestra una animación de confeti para celebrar su finalización.

## 4. Librería principal: Apache ECharts

### 4.1. ¿Por qué he elegido ECharts?

He elegido Apache ECharts porque permite crear visualizaciones interactivas y dinámicas mediante JavaScript.

Esta librería es adecuada para mi proyecto porque necesito representar gráficamente cómo se distribuye el tiempo disponible entre diferentes tareas.

Además, permite actualizar los datos del gráfico sin tener que reconstruir manualmente todos sus elementos HTML.

Documentación oficial:
https://echarts.apache.org/en/index.html

### 4.2. Integración de ECharts

La librería se incorpora mediante CDN en `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js"></script>
```

El gráfico se muestra dentro del siguiente contenedor:

```html
<div id="time-chart"></div>
```

El contenedor tiene una altura definida mediante CSS para permitir su correcta visualización.

### 4.3. Funciones y objetos utilizados

**echarts.init()**

Inicializa una instancia de ECharts dentro del contenedor HTML.

```javascript
timeChart = echarts.init(chartElement);
```

**timeChart.setOption()**

Permite configurar el gráfico y actualizar sus datos.

```javascript
timeChart.setOption({
    tooltip: {
        trigger: "item"
    },
    series: [{
        type: "pie",
        radius: ["45%", "70%"],
        data: chartData
    }]
}, true);
```

**timeChart.resize()**

Adapta el tamaño del gráfico cuando cambia el tamaño de la ventana o cuando se muestra la sección del planificador.

**series**

Define el tipo de visualización utilizado. En este proyecto se utiliza `pie` con dos valores de radio para crear un gráfico doughnut.

**data**

Contiene los nombres de las tareas y sus duraciones en minutos.

### 4.4. Integración con la aplicación anterior

ECharts se integra con los datos de las tareas existentes en Kanban.

El funcionamiento es el siguiente:

1. El usuario selecciona una tarea del tablero.
2. La aplicación obtiene su identificador.
3. El usuario asigna una duración.
4. La planificación guarda el identificador y los minutos asignados.
5. JavaScript obtiene el nombre de la tarea y su duración.
6. Se prepara un array con los datos necesarios para ECharts.
7. `setOption()` actualiza el gráfico.

De esta manera, la visualización está conectada con los datos reales de la aplicación y no utiliza valores estáticos.

## 5. Tutorial interactivo: Driver.js

### 5.1. ¿Por qué he elegido Driver.js?

Driver.js permite crear tutoriales interactivos que destacan diferentes elementos de una página y muestran explicaciones mediante ventanas emergentes.

Esta elegido para facilitar el aprendizaje de la nueva funcionalidad Daily Planner.

Documentación oficial:
https://driverjs.com/

### 5.2. Integración

La librería se incorpora mediante CDN:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/driver.js@1.10.2/dist/driver.min.css"
>

<script src="https://cdn.jsdelivr.net/npm/driver.js@1.10.2/dist/driver.js.iife.min.js"></script>
```

### 5.3. Funciones y objetos utilizados

**driver()**

Crea una instancia del tutorial y recibe su configuración.

**steps**

Array que contiene los diferentes pasos del tutorial.

**element**

Selector CSS que identifica el elemento que se debe destacar.

**popover**

Contiene el título y la descripción que aparecen en cada paso.

**drive()**

Inicia el recorrido interactivo.

### 5.4. Integración con Daily Planner

El tutorial se inicia mediante el botón Help.
Antes de comenzar, la aplicación muestra la sección Daily Planner para asegurar que los elementos estén visibles.
El tutorial explica los elementos principales de la planificación:

- Selección de fecha.
- Horas disponibles.
- Selección de tareas.
- Incorporación de tareas.
- Visualización del gráfico.
- Gestión de las tareas planificadas.

## 6. Librería complementaria: canvas-confetti

Se utiliza canvas-confetti para añadir una animación de celebración cuando una tarea se completa.

Documentación:
https://github.com/catdad/canvas-confetti

La librería se incorpora mediante CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>
```

La función `celebrate()` ejecuta la animación utilizando las opciones `particleCount`, `spread` y `origin`.

La animación se activa cuando el estado de una tarea cambia a `done`, evitando repetirla cuando la tarea ya estaba completada.

## 7. Almacenamiento de datos

Se utiliza localStorage para conservar la información del usuario en el navegador.

La aplicación guarda dos elementos principales:

- `tasks`: contiene las tareas del tablero Kanban.
- `dailyPlans`: contiene las planificaciones organizadas por fecha.

Las funciones principales son:

- `loadData()`: recupera la información guardada.
- `saveData()`: guarda los cambios realizados.

Los datos permanecen disponibles después de actualizar la página en el mismo navegador.

## 8. Estructura de la aplicación

```text
kanban-pro/
│
├── index.html
├── styles.css
├── app.js
└── README.md
```

## 9. Publicación

La aplicación se publica mediante GitHub Pages.
Enlace:https://chamsli.github.io/kanban-Pro/

## 10. Conclusión

Kanban Pro amplía la aplicación original AC6 mediante nuevas funcionalidades orientadas a la organización del tiempo y la productividad.

La integración de Apache ECharts permite visualizar de forma gráfica la distribución del tiempo, mientras que Driver.js facilita el aprendizaje de la nueva funcionalidad mediante un tutorial interactivo.

Además, localStorage permite conservar las tareas y planificaciones, y canvas-confetti añade una animación al completar objetivos.#
