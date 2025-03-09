# Gestor de Tareas

Una aplicación web para gestionar tareas que puede ser alojada gratuitamente en GitHub Pages.

## Características

- Crear, editar y eliminar tareas
- Filtrar tareas por estado y prioridad
- Gestionar dependencias entre tareas
- Almacenamiento local en el navegador (localStorage)
- Interfaz responsive para dispositivos móviles y de escritorio

## Campos para cada tarea

- Tipo de tarea
- Informe
- Descripción de tarea
- Fecha de Alta
- Estado
- Dependencia
- Prioridad

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- localStorage para persistencia de datos

## Cómo usar la aplicación

1. Añade una nueva tarea rellenando el formulario y haciendo clic en "Agregar Tarea"
2. Visualiza todas tus tareas en la tabla inferior
3. Edita una tarea haciendo clic en el botón "Editar"
4. Elimina una tarea haciendo clic en el botón "Eliminar"
5. Filtra las tareas por estado o prioridad usando los selectores de filtrado

## Cómo desplegar en GitHub Pages

1. Crea un nuevo repositorio en GitHub
2. Sube todos los archivos de este proyecto al repositorio
3. Ve a la sección "Settings" de tu repositorio
4. Navega hasta "Pages" en el menú lateral
5. En "Source", selecciona la rama principal (main o master)
6. Haz clic en "Save"
7. Espera unos minutos y tu aplicación estará disponible en la URL proporcionada (generalmente https://[tu-nombre-de-usuario].github.io/[nombre-del-repositorio])

## Estructura de archivos

- `index.html` - Estructura HTML de la aplicación
- `styles.css` - Estilos CSS para la interfaz de usuario
- `app.js` - Lógica JavaScript para la funcionalidad de la aplicación
- `README.md` - Este archivo de documentación

## Persistencia de datos

Esta aplicación utiliza localStorage para guardar tus tareas, lo que significa que:

- Los datos se almacenan localmente en tu navegador
- Los datos persistirán incluso después de cerrar el navegador
- Los datos solo serán accesibles desde el mismo navegador y dispositivo
- No se necesita conexión a internet para usar la aplicación una vez cargada

## Limitaciones

- Al usar localStorage, los datos están limitados a aproximadamente 5MB
- No hay sincronización entre dispositivos
- Si limpias la caché del navegador, todos los datos se perderán

## Contribuir

Si quieres contribuir a este proyecto, puedes:

1. Hacer un fork del repositorio
2. Crear una rama con tu nueva funcionalidad (`git checkout -b nueva-funcionalidad`)
3. Hacer commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. 