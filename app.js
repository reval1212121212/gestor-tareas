// Elementos del DOM
let taskForm;
let tasksTable;
let tasksList;
let addTaskBtn;
let updateTaskBtn;
let filterStatus;
let filterPriority;
let taskDependency;

// Variables globales
let tasks = [];
let currentTaskId = null;

// Sistema de almacenamiento - con respaldo en caso de error
const Storage = {
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log('Datos guardados correctamente:', key);
            return true;
        } catch (error) {
            console.error('Error al guardar datos:', error);
            return false;
        }
    },
    load: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al cargar datos:', error);
            return null;
        }
    }
};

// Inicialización de la aplicación - Versión unificada y simplificada
function initApp() {
    console.log('Iniciando aplicación...');
    
    // Inicializar referencias a elementos DOM
    initDOMReferences();
    
    // Cargar tareas desde almacenamiento
    const storedTasks = Storage.load('tasks');
    if (storedTasks) {
        tasks = storedTasks;
        console.log('Tareas cargadas:', tasks.length);
    } else {
        console.log('No se encontraron tareas guardadas');
        tasks = [];
    }
    
    // Renderizar tareas y actualizar opciones
    renderTasks();
    updateDependencyOptions();
    
    // Configurar los event listeners
    setupEventListeners();
    
    // Establecer la fecha actual como valor predeterminado
    const dateInput = document.getElementById('taskDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    // Inicializar el sistema de pestañas
    initTabSystem();
    
    // Actualizar app status
    updateAppStatus();
    
    console.log('Aplicación inicializada correctamente');
}

// Inicializar referencias a elementos DOM
function initDOMReferences() {
    console.log('Inicializando referencias DOM...');
    taskForm = document.getElementById('taskForm');
    tasksTable = document.getElementById('tasksTable');
    tasksList = document.getElementById('tasksList') || document.getElementById('tasks-list-body');
    addTaskBtn = document.getElementById('addTask');
    updateTaskBtn = document.getElementById('updateTask');
    filterStatus = document.getElementById('filterStatus');
    filterPriority = document.getElementById('filterPriority');
    taskDependency = document.getElementById('taskDependency');
    
    // Verificar elementos críticos
    if (!taskForm) console.error('No se encontró el elemento taskForm');
    if (!tasksList) console.error('No se encontró el elemento tasksList o tasks-list-body');
    if (!addTaskBtn) console.error('No se encontró el elemento addTaskBtn');
    if (!updateTaskBtn) console.error('No se encontró el elemento updateTaskBtn');
}

// Configurar todos los event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Formulario principal
    if (taskForm) {
        taskForm.onsubmit = function(e) {
            e.preventDefault();
            handleFormSubmit(e);
            return false;
        };
        console.log('Event listener de formulario configurado');
    } else {
        console.error('No se pudo configurar el event listener del formulario - elemento no encontrado');
    }
    
    // Botones de acciones principales
    if (updateTaskBtn) {
        updateTaskBtn.onclick = function(e) {
            e.preventDefault();
            handleTaskUpdate();
        };
        console.log('Event listener de botón de actualización configurado');
    }
    
    // Filtros
    if (filterStatus) {
        filterStatus.onchange = applyFilters;
        console.log('Event listener de filtro de estado configurado');
    }
    
    if (filterPriority) {
        filterPriority.onchange = applyFilters;
        console.log('Event listener de filtro de prioridad configurado');
    }
    
    // Botón de prueba (si existe)
    const testConnBtn = document.getElementById('test-btn');
    if (testConnBtn) {
        testConnBtn.onclick = function() {
            try {
                // Agregar una tarea de prueba
                const testTask = {
                    id: 'test-' + Date.now(),
                    type: 'Prueba',
                    report: 'TEST-' + Math.floor(Math.random() * 1000),
                    description: 'Tarea de prueba creada el ' + new Date().toLocaleString(),
                    date: new Date().toISOString().split('T')[0],
                    status: 'Pendiente',
                    dependency: '',
                    priority: 'Media'
                };
                
                // Agregar a la lista de tareas
                tasks.push(testTask);
                
                // Guardar y renderizar
                saveTasks();
                renderTasks();
                updateDependencyOptions();
                
                // Mostrar notificación
                showNotification('Tarea de prueba agregada correctamente', 'success');
            } catch (error) {
                console.error('Error al agregar tarea de prueba:', error);
                showNotification('Error al agregar tarea de prueba', 'error');
            }
        };
        console.log('Event listener de botón de prueba configurado');
    }
    
    // Configurar navegación del calendario
    setupCalendarNavigation();
    
    console.log('Event listeners configurados correctamente');
}

// Actualizar el estado de la aplicación en la UI
function updateAppStatus() {
    const appStatus = document.getElementById('app-status');
    if (appStatus) {
        appStatus.innerHTML = '<span style="color: #4CAF50; font-weight: bold;">Funcionando correctamente</span>';
    }
}

// Guardar tareas en almacenamiento
function saveTasks() {
    if (Storage.save('tasks', tasks)) {
        console.log('Tareas guardadas correctamente. Total:', tasks.length);
    }
}

// Renderizar la lista de tareas
function renderTasks(filteredTasks = null) {
    console.log('Renderizando tareas...');
    
    // Intentar obtener el contenedor de tareas específico
    const tasksContainer = document.getElementById('tasksContainer');
    
    // Verificar que el elemento exista (ya sea tasksList o tasksContainer)
    if (!tasksList && !tasksContainer) {
        console.error('No se encontró el elemento para la lista de tareas (ni tasksList ni tasksContainer)');
        return;
    }
    
    const tasksToRender = filteredTasks || tasks;
    console.log('Tareas a renderizar:', tasksToRender.length);
    
    // Renderizar en el contenedor de tarjetas si existe
    if (tasksContainer) {
        // Limpiar el contenedor
        tasksContainer.innerHTML = '';
        
        // Mostrar mensaje si no hay tareas
        if (!tasksToRender || tasksToRender.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No hay tareas disponibles</h3>
                    <p>Agrega una nueva tarea para comenzar</p>
                </div>
            `;
            return;
        }
        
        // Renderizar cada tarea como tarjeta
        tasksToRender.forEach(task => {
            try {
                // Crear elemento de tarjeta
                const card = document.createElement('div');
                card.className = `task-card priority-${(task.priority || 'media').toLowerCase()}`;
                
                // Crear contenido de la tarjeta
                card.innerHTML = `
                    <div class="task-header">
                        <h3 class="task-title">${task.report || 'Sin título'}</h3>
                    </div>
                    <div class="task-meta">
                        <span class="task-tag tag-type">
                            <i class="fas fa-tag"></i> ${task.type || 'General'}
                        </span>
                        <span class="task-tag status-${(task.status || 'pendiente').toLowerCase().replace(/ /g, '-')}">
                            <i class="fas fa-spinner"></i> ${task.status || 'Pendiente'}
                        </span>
                        <span class="task-tag priority-${(task.priority || 'media').toLowerCase()}">
                            <i class="fas fa-flag"></i> ${task.priority || 'Media'}
                        </span>
                    </div>
                    <p class="task-description">${task.description || 'Sin descripción'}</p>
                    <p class="task-date">
                        <i class="far fa-calendar-alt"></i> ${formatDate(task.date)}
                    </p>
                    ${task.dependency ? `<p class="task-date"><i class="fas fa-link"></i> Dependencia: ${task.dependency}</p>` : ''}
                    <div class="task-actions">
                        <button class="btn btn-primary btn-small edit-btn" data-id="${task.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-small delete-btn" data-id="${task.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                `;
                
                // Agregar la tarjeta al contenedor
                tasksContainer.appendChild(card);
            } catch (error) {
                console.error('Error al renderizar tarjeta de tarea:', error, task);
            }
        });
        
        // Agregar event listeners después de renderizar
        setTimeout(addActionButtonListeners, 0);
        console.log('Tarjetas de tareas renderizadas correctamente');
        return;
    }
    
    // Si llegamos aquí, usaremos el tasksList (tabla)
    if (tasksList) {
        // Limpiar la lista de tareas
        tasksList.innerHTML = '';
        
        // Mostrar mensaje si no hay tareas
        if (!tasksToRender || tasksToRender.length === 0) {
            console.log('No hay tareas para mostrar');
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="8" style="text-align: center; padding: 20px;">No hay tareas disponibles</td>`;
            tasksList.appendChild(emptyRow);
            return;
        }
        
        // Renderizar cada tarea
        tasksToRender.forEach(task => {
            try {
                // Garantizar que los valores existan para evitar errores
                const taskType = task.type || '';
                const taskReport = task.report || '';
                const taskDesc = task.description || '';
                const taskDate = task.date || '';
                const taskStatus = task.status || 'Pendiente';
                const taskDependency = task.dependency || 'Ninguna';
                const taskPriority = task.priority || 'Media';
                const taskId = task.id || Date.now().toString();
                
                // Crear la fila para la tarea
                const row = document.createElement('tr');
                
                // Generar el HTML de la fila
                row.innerHTML = `
                    <td>${taskType}</td>
                    <td>${taskReport}</td>
                    <td>${taskDesc.length > 50 ? taskDesc.substring(0, 50) + '...' : taskDesc}</td>
                    <td>${formatDate(taskDate)}</td>
                    <td class="status-${taskStatus.toLowerCase().replace(/ /g, '-')}">${taskStatus}</td>
                    <td>${taskDependency}</td>
                    <td class="priority-${taskPriority.toLowerCase()}">${taskPriority}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" data-id="${taskId}"><i class="fas fa-edit"></i> Editar</button>
                        <button class="delete-btn" data-id="${taskId}"><i class="fas fa-trash"></i> Eliminar</button>
                    </td>
                `;
                
                // Agregar la fila a la tabla
                tasksList.appendChild(row);
            } catch (error) {
                console.error('Error al renderizar tarea:', error, task);
            }
        });
        
        // Agregar event listeners a los botones de acción
        setTimeout(addActionButtonListeners, 0);
        console.log('Tareas renderizadas correctamente en tabla');
    }
}

// Agregar event listeners a los botones de acción
function addActionButtonListeners() {
    try {
        console.log('Añadiendo event listeners a los botones de acción...');
        
        // Botones de edición
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.removeEventListener('click', handleEditClick); // Remover primero para evitar duplicados
            button.addEventListener('click', handleEditClick);
        });
        
        // Botones de eliminación
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.removeEventListener('click', handleDeleteClick); // Remover primero para evitar duplicados
            button.addEventListener('click', handleDeleteClick);
        });
        
        console.log('Event listeners añadidos a los botones de acción');
    } catch (error) {
        console.error('Error al añadir event listeners a los botones:', error);
    }
}

// Manejo del envío del formulario
function handleFormSubmit(e) {
        e.preventDefault();
    
    try {
        console.log('Procesando envío de formulario...');
        
        // Obtener los valores del formulario
        const type = document.getElementById('taskType').value.trim();
        const report = document.getElementById('taskReport').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const date = document.getElementById('taskDate').value;
        const status = document.getElementById('taskStatus').value;
        const dependency = document.getElementById('taskDependency').value;
        const priority = document.getElementById('taskPriority').value;
        
        // Validar campos requeridos
        if (!type || !report || !description || !date || !status || !priority) {
            showNotification('Por favor, completa todos los campos requeridos', 'error');
            return false;
        }
        
        // Comprobar si estamos actualizando una tarea existente
        if (currentTaskId) {
            // Buscar y actualizar la tarea
            const taskIndex = tasks.findIndex(task => task.id === currentTaskId);
            
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    type,
                    report,
                    description,
                    date,
                    status,
                    dependency,
                    priority
                };
                
                saveTasks();
                renderTasks();
                updateDependencyOptions();
                showNotification('Tarea actualizada correctamente', 'success');
                
                // Restaurar el formulario para agregar nuevas tareas
                document.getElementById('taskForm').reset();
                document.getElementById('addTask').style.display = 'inline-block';
                document.getElementById('updateTask').style.display = 'none';
                currentTaskId = null;
                
                // Establecer la fecha actual como valor predeterminado
                document.getElementById('taskDate').valueAsDate = new Date();
            } else {
                showNotification('Error: No se encontró la tarea para actualizar', 'error');
            }
        } else {
            // Crear una nueva tarea
            const newTask = {
                id: Date.now().toString(), // Usar timestamp como ID único
                type,
                report,
                description,
                date,
                status,
                dependency,
                priority
            };
            
            // Agregar a la lista, guardar y renderizar
            tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateDependencyOptions();
            showNotification('Tarea agregada correctamente', 'success');
            
            // Limpiar el formulario
            document.getElementById('taskForm').reset();
            
            // Establecer la fecha actual como valor predeterminado
            document.getElementById('taskDate').valueAsDate = new Date();
        }
        
        return false;
    } catch (error) {
        console.error('Error al procesar el formulario:', error);
        showNotification('Error al procesar el formulario', 'error');
        return false;
    }
}

// Manejo del click en el botón de editar
function handleEditClick(e) {
    try {
    const taskId = e.currentTarget.getAttribute('data-id');
        console.log('Editando tarea con ID:', taskId);
        
        // Buscar la tarea por ID
        const task = tasks.find(task => task.id === taskId);
    
    if (task) {
            // Llenar el formulario con los datos de la tarea
            document.getElementById('taskType').value = task.type || '';
            document.getElementById('taskReport').value = task.report || '';
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskDate').value = task.date || '';
            document.getElementById('taskStatus').value = task.status || '';
            document.getElementById('taskDependency').value = task.dependency || '';
            document.getElementById('taskPriority').value = task.priority || '';
            
            // Cambiar el estado de los botones
            document.getElementById('addTask').style.display = 'none';
            const updateBtn = document.getElementById('updateTask');
            updateBtn.style.display = 'inline-block';
            
            // Almacenar el ID de la tarea actual
        currentTaskId = taskId;
        
            // Desplazarse hasta el formulario
            document.querySelector('header').scrollIntoView({ behavior: 'smooth' });
            
            showNotification('Tarea cargada para edición', 'info');
        } else {
            console.error('No se encontró la tarea con ID:', taskId);
            showNotification('Error: No se pudo cargar la tarea', 'error');
        }
    } catch (error) {
        console.error('Error al editar tarea:', error);
        showNotification('Error al editar tarea', 'error');
    }
}

// Manejo de la actualización de una tarea
function handleTaskUpdate() {
    try {
        if (!currentTaskId) {
            showNotification('Error: No hay tarea seleccionada para actualizar', 'error');
            return;
        }
        
        // Obtener los valores del formulario
        const type = document.getElementById('taskType').value.trim();
        const report = document.getElementById('taskReport').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const date = document.getElementById('taskDate').value;
        const status = document.getElementById('taskStatus').value;
        const dependency = document.getElementById('taskDependency').value;
        const priority = document.getElementById('taskPriority').value;
        
        // Validar campos requeridos
        if (!type || !report || !description || !date || !status || !priority) {
            showNotification('Por favor, completa todos los campos requeridos', 'error');
            return;
        }
        
        // Buscar y actualizar la tarea
        const taskIndex = tasks.findIndex(task => task.id === currentTaskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
                type,
                report,
                description,
                date,
                status,
                dependency,
                priority
        };
        
        saveTasks();
        renderTasks();
        updateDependencyOptions();
            showNotification('Tarea actualizada correctamente', 'success');
            
            // Restaurar el formulario para agregar nuevas tareas
            document.getElementById('taskForm').reset();
            document.getElementById('addTask').style.display = 'inline-block';
            document.getElementById('updateTask').style.display = 'none';
        currentTaskId = null;
        
            // Establecer la fecha actual como valor predeterminado
            document.getElementById('taskDate').valueAsDate = new Date();
        } else {
            showNotification('Error: No se encontró la tarea para actualizar', 'error');
        }
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        showNotification('Error al actualizar tarea', 'error');
    }
}

// Manejo del click en el botón de eliminar
function handleDeleteClick(e) {
    try {
    const taskId = e.currentTarget.getAttribute('data-id');
        console.log('Eliminando tarea con ID:', taskId);
        
        // Confirmación de eliminación
        if (confirm('¿Estás seguro que deseas eliminar esta tarea?')) {
            // Verificar si hay tareas dependientes
            const dependentTasks = tasks.filter(task => task.dependency === getTaskNameById(taskId));
        
        if (dependentTasks.length > 0) {
                const confirmDependents = confirm(`Esta tarea tiene ${dependentTasks.length} tareas dependientes. Si continúas, esas dependencias se eliminarán. ¿Deseas continuar?`);
                
                if (!confirmDependents) {
            return;
        }
        
                // Eliminar dependencias
                dependentTasks.forEach(task => {
                    task.dependency = '';
                });
            }
            
            // Eliminar la tarea
            tasks = tasks.filter(task => task.id !== taskId);
            
            // Guardar y renderizar
        saveTasks();
        renderTasks();
        updateDependencyOptions();
        
            // Si estábamos editando esta tarea, resetear el formulario
        if (currentTaskId === taskId) {
                document.getElementById('taskForm').reset();
                document.getElementById('addTask').style.display = 'inline-block';
                document.getElementById('updateTask').style.display = 'none';
            currentTaskId = null;
                
                // Establecer la fecha actual como valor predeterminado
                document.getElementById('taskDate').valueAsDate = new Date();
        }
        
        showNotification('Tarea eliminada correctamente', 'success');
        }
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        showNotification('Error al eliminar tarea', 'error');
    }
}

// Actualizar opciones de dependencia
function updateDependencyOptions() {
    const select = document.getElementById('taskDependency');
    const currentValue = select.value;
    
    // Mantener la opción "Ninguna"
    select.innerHTML = '<option value="">Ninguna</option>';
    
    // Agregar opciones basadas en tareas existentes
    tasks.forEach(task => {
        // Si estamos editando, no mostrar la tarea actual como opción de dependencia
        if (task.id !== currentTaskId) {
            const option = document.createElement('option');
            option.value = task.report;
            option.textContent = task.report;
            select.appendChild(option);
        }
    });
    
    // Restaurar el valor seleccionado si existe
    if (currentValue && tasks.some(t => t.report === currentValue)) {
        select.value = currentValue;
    }
}

// Aplicar filtros a la lista de tareas
function applyFilters() {
    const statusFilter = filterStatus.value;
    const priorityFilter = filterPriority.value;
    
    let filteredTasks = [...tasks];
    
    if (statusFilter) {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    if (priorityFilter) {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    renderTasks(filteredTasks);
}

// Obtener el nombre de la tarea por su ID
function getTaskNameById(id) {
    const task = tasks.find(t => t.id === id);
    return task ? task.report : '';
}

// Formatear fecha para mostrar
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
}

// Mostrar notificación al usuario
function showNotification(message, type = 'info') {
    try {
        console.log(`Notificación (${type}): ${message}`);
        
        // Obtener o crear el elemento de notificación
        let notification = document.getElementById('notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
    document.body.appendChild(notification);
        }
    
        // Detener cualquier animación existente
        notification.style.animation = 'none';
    setTimeout(() => {
            notification.style.animation = '';
    }, 10);
    
        // Establecer tipo y mensaje
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${getNotificationIcon(type)}"></i>
            </div>
            <div class="notification-message">${message}</div>
            <button class="notification-close">×</button>
        `;
        
        // Mostrar la notificación
        notification.classList.add('show');
        
        // Agregar evento para cerrar la notificación
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.onclick = function() {
        notification.classList.remove('show');
            };
        }
        
        // Ocultar automáticamente después de 5 segundos
        setTimeout(() => {
            if (notification) {
                notification.classList.remove('show');
            }
        }, 5000);
    } catch (error) {
        console.error('Error al mostrar notificación:', error);
    }
}

// Obtener el icono adecuado según el tipo de notificación
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
}

// Inicialización del sistema de pestañas
function initTabSystem() {
    console.log('Inicializando sistema de pestañas...');
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (!tabButtons.length || !tabPanes.length) {
        console.log('No se encontraron elementos de pestañas');
        return;
    }
    
    console.log(`Encontrados ${tabButtons.length} botones de pestaña y ${tabPanes.length} paneles`);
    
    // Remover listeners antiguos para evitar duplicados (importante en GitHub Pages)
    tabButtons.forEach(button => {
        const clonedButton = button.cloneNode(true);
        button.parentNode.replaceChild(clonedButton, button);
    });
    
    // Volver a seleccionar los botones actualizados
    const updatedTabButtons = document.querySelectorAll('.tab-btn');
    
    // Activar la primera pestaña por defecto
    if (updatedTabButtons[0] && tabPanes[0]) {
        updatedTabButtons[0].classList.add('active');
        tabPanes[0].classList.add('active');
    }
    
    // Agregar event listeners a los botones de pestaña
    updatedTabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            console.log(`Clic en pestaña: ${tabId}`);
            
            // Remover clase active de todos los botones y contenidos
            updatedTabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            // Obtener el contenido correspondiente y activarlo
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
                
                // Renderizar contenido específico según la pestaña
                if (tabId === 'tab-kanban') {
                    renderKanbanBoard();
                } else if (tabId === 'tab-list') {
                    renderTasksList();
                } else if (tabId === 'tab-calendar') {
                    renderCalendar();
                } else if (tabId === 'tab-dashboard') {
                    renderDashboard();
                }
            } else {
                console.error(`No se encontró el panel para la pestaña: ${tabId}`);
            }
        });
    });
    
    console.log('Sistema de pestañas inicializado correctamente');
}

// Renderizar el tablero Kanban
function renderKanbanBoard() {
        console.log('Renderizando tablero Kanban...');
        
    const kanbanContainer = document.getElementById('kanban-board');
    if (!kanbanContainer) {
        console.error('No se encontró el contenedor del tablero Kanban');
            return;
        }
        
    // Crear las columnas del tablero Kanban
    kanbanContainer.innerHTML = `
        <div class="kanban-column" id="column-pendiente">
            <div class="column-header" style="background-color: #3498db;">
                <h3>Pendiente</h3>
            </div>
            <div class="column-body" id="tasks-pendiente"></div>
        </div>
        <div class="kanban-column" id="column-en-progreso">
            <div class="column-header" style="background-color: #f39c12;">
                <h3>En Progreso</h3>
            </div>
            <div class="column-body" id="tasks-en-progreso"></div>
        </div>
        <div class="kanban-column" id="column-en-revision">
            <div class="column-header" style="background-color: #9b59b6;">
                <h3>En Revisión</h3>
            </div>
            <div class="column-body" id="tasks-en-revision"></div>
        </div>
        <div class="kanban-column" id="column-completada">
            <div class="column-header" style="background-color: #2ecc71;">
                <h3>Completada</h3>
            </div>
            <div class="column-body" id="tasks-completada"></div>
        </div>
    `;
    
    // Agrupar tareas por estado
    const tasksByStatus = {
        'pendiente': [],
        'en-progreso': [],
        'en-revision': [],
        'completada': []
    };
    
        tasks.forEach(task => {
        const status = (task.status || 'Pendiente').toLowerCase().replace(' ', '-');
        if (tasksByStatus[status]) {
            tasksByStatus[status].push(task);
        } else {
            // Si el estado no existe en las columnas predefinidas, agregarlo a pendiente
            tasksByStatus['pendiente'].push(task);
        }
    });
    
    // Renderizar tareas en cada columna
    for (const status in tasksByStatus) {
        const columnBody = document.getElementById(`tasks-${status}`);
        if (columnBody) {
            if (tasksByStatus[status].length === 0) {
                columnBody.innerHTML = '<div class="empty-column">No hay tareas</div>';
                continue;
            }
            
            columnBody.innerHTML = '';
            tasksByStatus[status].forEach(task => {
                const card = createKanbanCard(task);
                columnBody.appendChild(card);
            });
        }
    }
        
        console.log('Tablero Kanban renderizado correctamente');
}

// Crear una tarjeta para el tablero Kanban
function createKanbanCard(task) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.style.borderLeft = `4px solid ${getPriorityColor(task.priority)}`;
    
    card.innerHTML = `
        <div class="card-header">
            <h4 class="card-title">${task.report || 'Sin título'}</h4>
            <span class="card-priority" style="color: ${getPriorityColor(task.priority)}">${task.priority || 'Normal'}</span>
        </div>
        <div class="card-body">
            <p>${task.description ? (task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description) : 'Sin descripción'}</p>
        </div>
        <div class="card-footer">
            <span class="card-type">${task.type || 'General'}</span>
            <span class="card-date">${formatDate(task.date)}</span>
        </div>
        <div class="card-actions">
            <button class="edit-btn-sm" data-id="${task.id}"><i class="fas fa-edit"></i></button>
            <button class="delete-btn-sm" data-id="${task.id}"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    // Agregar event listeners a los botones
    setTimeout(() => {
        const editBtn = card.querySelector('.edit-btn-sm');
        const deleteBtn = card.querySelector('.delete-btn-sm');
        
        if (editBtn) editBtn.addEventListener('click', handleEditClick);
        if (deleteBtn) deleteBtn.addEventListener('click', handleDeleteClick);
    }, 0);
    
    return card;
}

// Obtener color según la prioridad
function getPriorityColor(priority) {
    if (!priority) return '#3498db';
    
    const lowerPriority = priority.toLowerCase();
    if (lowerPriority === 'baja') return '#3498db';
    if (lowerPriority === 'media') return '#f39c12';
    if (lowerPriority === 'alta') return '#e67e22';
    if (lowerPriority === 'urgente') return '#e74c3c';
    
    return '#3498db';
}

// Funciones para Vista Lista
function renderTasksList() {
    try {
        console.log('Renderizando vista lista...');
        
        const tbody = document.getElementById('tasks-list-body');
        if (!tbody) {
            console.error('No se encontró el elemento para la lista de tareas');
            return;
        }
        
        // Limpiar la tabla
        tbody.innerHTML = '';
        
        // Obtener filtros específicos de la vista lista
        const statusFilter = document.getElementById('filterStatus-list')?.value || '';
        const priorityFilter = document.getElementById('filterPriority-list')?.value || '';
        const typeFilter = document.getElementById('filterType-list')?.value || '';
        
        // Filtrar tareas
        let filteredTasks = [...tasks];
        
        if (statusFilter) {
            filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
        }
        
        if (priorityFilter) {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        
        if (typeFilter) {
            filteredTasks = filteredTasks.filter(task => task.type === typeFilter);
        }
        
        // Si no hay tareas después de filtrar
        if (filteredTasks.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="7" style="text-align: center; padding: 20px;">No hay tareas disponibles</td>`;
            tbody.appendChild(emptyRow);
            return;
        }
        
        // Renderizar cada tarea
        filteredTasks.forEach(task => {
            try {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${task.report || ''}</td>
                    <td>${task.type || ''}</td>
                    <td>${task.description ? (task.description.length > 30 ? task.description.substring(0, 30) + '...' : task.description) : ''}</td>
                    <td>${formatDate(task.date)}</td>
                    <td class="status-${(task.status || '').toLowerCase().replace(' ', '-')}">${task.status || ''}</td>
                    <td class="priority-${(task.priority || '').toLowerCase()}">${task.priority || ''}</td>
                    <td class="action-buttons">
                        <button class="btn btn-primary btn-small edit-btn" data-id="${task.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-small delete-btn" data-id="${task.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                tbody.appendChild(row);
            } catch (error) {
                console.error('Error al renderizar tarea en la lista:', error, task);
            }
        });
        
        // Añadir event listeners
        document.querySelectorAll('#tasks-list-body .edit-btn').forEach(button => {
            button.onclick = handleEditClick;
        });
        
        document.querySelectorAll('#tasks-list-body .delete-btn').forEach(button => {
            button.onclick = handleDeleteClick;
        });
        
        console.log('Vista lista renderizada correctamente');
    } catch (error) {
        console.error('Error al renderizar vista lista:', error);
        showNotification('Error al cargar vista Lista', 'error');
    }
}

// Configurar filtros para la vista de lista
function setupListFilters() {
    const statusFilter = document.getElementById('filterStatus-list');
    const priorityFilter = document.getElementById('filterPriority-list');
    const typeFilter = document.getElementById('filterType-list');
    
    if (statusFilter) statusFilter.addEventListener('change', renderTasksList);
    if (priorityFilter) priorityFilter.addEventListener('change', renderTasksList);
    if (typeFilter) typeFilter.addEventListener('change', renderTasksList);
}

// Funciones para Vista Calendario
function renderCalendar() {
    console.log('Renderizando calendario...');
    
    // Obtener fecha actual o fecha almacenada
    const currentDate = calendarCurrentDate || new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Actualizar título del calendario
    const calendarTitle = document.getElementById('calendar-month-year');
    if (calendarTitle) {
        const options = { year: 'numeric', month: 'long' };
        calendarTitle.textContent = currentDate.toLocaleDateString('es-ES', options);
    }
    
    // Obtener el contenedor de días
    const calendarDays = document.getElementById('calendar-days');
    if (!calendarDays) {
        console.error('No se encontró el contenedor de días del calendario');
        return;
    }
    
    // Limpiar el calendario
    while (calendarDays.firstChild) {
        calendarDays.removeChild(calendarDays.firstChild);
    }
    
    // Obtener el primer día del mes (0 = Domingo, 1 = Lunes, ...)
    const firstDay = new Date(year, month, 1).getDay();
    // Ajustar para que la semana comience el lunes (0 = Lunes, 6 = Domingo)
    const startingDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // Obtener el número de días en el mes
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Crear celdas para los días
    // Agregar celdas vacías para los días anteriores al primer día del mes
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarDays.appendChild(emptyDay);
    }
    
    // Crear celdas para los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        // Fecha para el día actual en el bucle
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Buscar tareas para esta fecha
        const tasksForDay = tasks.filter(task => task.date === dateString);
        
        // Contenido de la celda
        dayCell.innerHTML = `
            <div class="calendar-day-number">${day}</div>
            <div class="calendar-day-content">
                ${tasksForDay.map(task => `
                    <div class="calendar-day-event priority-${task.priority.toLowerCase()}" data-id="${task.id}">
                        ${task.report || 'Sin título'}
                    </div>
                `).join('')}
            </div>
        `;
        
        calendarDays.appendChild(dayCell);
    }
    
    // Configurar eventos del calendario
    document.querySelectorAll('.calendar-day-event').forEach(event => {
        event.addEventListener('click', function() {
            const taskId = this.getAttribute('data-id');
            const task = tasks.find(t => t.id === taskId);
            
            if (task) {
                // Aquí podrías mostrar un modal con detalles de la tarea
                // o redirigir a la edición de la tarea
                handleEditClick({ currentTarget: { getAttribute: () => taskId } });
            }
        });
    });
    
    console.log('Calendario renderizado correctamente');
}

// Variable para mantener la fecha actual del calendario
let calendarCurrentDate = new Date();

// Configurar navegación del calendario
function setupCalendarNavigation() {
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    const todayBtn = document.getElementById('today-month');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
            renderCalendar();
        });
    }
    
    if (todayBtn) {
        todayBtn.addEventListener('click', function() {
            calendarCurrentDate = new Date();
            renderCalendar();
        });
    }
}

// Funciones para Dashboard KPIs
function renderDashboard() {
    console.log('Renderizando dashboard...');
    
    // Actualizar valores de KPIs
    updateKPIValues();
    
    // Renderizar gráficos si Chart.js está disponible
    if (typeof Chart !== 'undefined') {
        renderStatusChart();
        renderPriorityChart();
        renderTypeChart();
        renderTasksEvolutionChart();
    } else {
        console.error('Chart.js no está disponible. No se pueden renderizar gráficos.');
        const chartContainers = document.querySelectorAll('.chart-card');
        chartContainers.forEach(container => {
            container.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> No se pueden cargar los gráficos. Chart.js no está disponible.</div>';
        });
    }
    
    console.log('Dashboard renderizado correctamente');
}

function updateKPIValues() {
    // Contar tareas por estado
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completada').length;
    const progressTasks = tasks.filter(task => task.status === 'En progreso').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pendiente').length;
    
    // Actualizar valores de KPI
    document.getElementById('kpi-total-tasks').textContent = totalTasks;
    document.getElementById('kpi-completed-tasks').textContent = completedTasks;
    document.getElementById('kpi-progress-tasks').textContent = progressTasks;
    document.getElementById('kpi-pending-tasks').textContent = pendingTasks;
    
    // Simular tendencias (en una aplicación real, esto vendría de datos históricos)
    document.getElementById('kpi-total-trend').textContent = '10%';
    document.getElementById('kpi-completed-trend').textContent = '15%';
    document.getElementById('kpi-progress-trend').textContent = '5%';
    document.getElementById('kpi-pending-trend').textContent = '7%';
}

// Función para renderizar los gráficos del dashboard
function renderStatusChart() {
    console.log('Renderizando gráfico de estado de tareas...');
    
    const canvas = document.getElementById('status-chart');
    if (!canvas) {
        console.error('No se encontró el canvas para el gráfico de estado');
        return;
    }
    
    // Contar tareas por estado
    const statusCounts = {
        'Pendiente': 0,
        'En Progreso': 0,
        'En Revisión': 0,
        'Completada': 0
    };
    
    tasks.forEach(task => {
        const status = task.status || 'Pendiente';
        if (statusCounts[status] !== undefined) {
            statusCounts[status]++;
        } else {
            statusCounts[status] = 1;
        }
    });
    
    // Configuración del gráfico
    const data = {
        labels: Object.keys(statusCounts),
        datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: [
                '#3498db',  // Pendiente - Azul
                '#f39c12',  // En Progreso - Naranja
                '#9b59b6',  // En Revisión - Morado
                '#2ecc71'   // Completada - Verde
            ],
            borderWidth: 1
        }]
    };
    
    // Buscar si ya existe un gráfico anterior y destruirlo
    if (window.statusChart) {
        window.statusChart.destroy();
    }
    
    // Crear nuevo gráfico
    try {
    window.statusChart = new Chart(canvas, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Distribución de Tareas por Estado'
                }
            }
        }
    });
    console.log('Gráfico de estado renderizado correctamente');
    } catch (error) {
        console.error('Error al renderizar gráfico de estado:', error);
        canvas.parentNode.innerHTML = '<div class="chart-error">Error al cargar el gráfico. Asegúrate de que Chart.js esté cargado correctamente.</div>';
    }
}

// Función para renderizar el gráfico de prioridades
function renderPriorityChart() {
    console.log('Renderizando gráfico de prioridad de tareas...');
    
    const canvas = document.getElementById('priority-chart');
    if (!canvas) {
        console.error('No se encontró el canvas para el gráfico de prioridad');
        return;
    }
    
    // Contar tareas por prioridad
    const priorityCounts = {
        'Baja': 0,
        'Media': 0,
        'Alta': 0,
        'Urgente': 0
    };
    
    tasks.forEach(task => {
        const priority = task.priority || 'Media';
        if (priorityCounts[priority] !== undefined) {
            priorityCounts[priority]++;
        } else {
            priorityCounts[priority] = 1;
        }
    });
    
    // Configuración del gráfico
    const data = {
        labels: Object.keys(priorityCounts),
        datasets: [{
            data: Object.values(priorityCounts),
            backgroundColor: [
                '#3498db',  // Baja - Azul
                '#f39c12',  // Media - Naranja
                '#e67e22',  // Alta - Naranja oscuro
                '#e74c3c'   // Urgente - Rojo
            ],
            borderWidth: 1
        }]
    };
    
    // Buscar si ya existe un gráfico anterior y destruirlo
    if (window.priorityChart) {
        window.priorityChart.destroy();
    }
    
    // Crear nuevo gráfico
    try {
    window.priorityChart = new Chart(canvas, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Distribución de Tareas por Prioridad'
                }
            }
        }
    });
    console.log('Gráfico de prioridad renderizado correctamente');
    } catch (error) {
        console.error('Error al renderizar gráfico de prioridad:', error);
        canvas.parentNode.innerHTML = '<div class="chart-error">Error al cargar el gráfico. Asegúrate de que Chart.js esté cargado correctamente.</div>';
    }
}

function renderTypeChart() {
    console.log('Renderizando gráfico de tipo de tareas...');
    
    const canvas = document.getElementById('chart-type-distribution');
    if (!canvas) return;
    
    // Obtener tipos únicos de tareas
    const taskTypes = {};
    tasks.forEach(task => {
        if (task.type) {
            if (!taskTypes[task.type]) {
                taskTypes[task.type] = 0;
            }
            taskTypes[task.type]++;
        }
    });
    
    // Colores para los diferentes tipos
    const backgroundColors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)'
    ];
    
    const borderColors = [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)'
    ];
    
    // Asignar colores a cada tipo
    const backgroundColor = [];
    const borderColor = [];
    let i = 0;
    for (const type in taskTypes) {
        backgroundColor.push(backgroundColors[i % backgroundColors.length]);
        borderColor.push(borderColors[i % borderColors.length]);
        i++;
    }
    
    // Configuración del gráfico
    const data = {
        labels: Object.keys(taskTypes),
        datasets: [{
            label: 'Tareas por Tipo',
            data: Object.values(taskTypes),
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1
        }]
    };
    
    // Buscar si ya existe un gráfico anterior y destruirlo
    if (window.typeChart) {
        window.typeChart.destroy();
    }
    
    // Crear nuevo gráfico
    window.typeChart = new Chart(canvas, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Distribución de Tareas por Tipo'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad de Tareas'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tipo de Tarea'
                    }
                }
            }
        }
    });
    
    console.log('Gráfico de tipo renderizado correctamente');
}

function renderTasksEvolutionChart() {
    console.log('Renderizando gráfico de evolución de tareas...');
    
    const canvas = document.getElementById('chart-tasks-evolution');
    if (!canvas) return;
    
    // Para este gráfico, simularemos datos de evolución temporal
    // En una aplicación real, estos datos vendrían de un historial guardado
    
    // Generar datos de ejemplo para los últimos 7 días
    const labels = [];
    const completedData = [];
    const pendingData = [];
    const inProgressData = [];
    const inReviewData = [];
    
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Formato de fecha para la etiqueta
        const options = { weekday: 'short', day: 'numeric' };
        labels.push(date.toLocaleDateString('es-ES', options));
        
        // Datos simulados - en una app real vendrían de la base de datos
        const dayCompleted = Math.floor(Math.random() * 5) + (tasks.filter(t => t.status === 'Completada').length / 2);
        const dayPending = Math.floor(Math.random() * 3) + (tasks.filter(t => t.status === 'Pendiente').length / 2);
        const dayInProgress = Math.floor(Math.random() * 4) + (tasks.filter(t => t.status === 'En progreso').length / 2);
        const dayInReview = Math.floor(Math.random() * 2) + (tasks.filter(t => t.status === 'En revisión').length / 2);
        
        completedData.push(dayCompleted);
        pendingData.push(dayPending);
        inProgressData.push(dayInProgress);
        inReviewData.push(dayInReview);
    }
    
    // Configuración del gráfico
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Completadas',
                data: completedData,
                backgroundColor: 'rgba(76, 175, 80, 0.5)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 2,
                tension: 0.3
            },
            {
                label: 'Pendientes',
                data: pendingData,
                backgroundColor: 'rgba(33, 150, 243, 0.5)',
                borderColor: 'rgba(33, 150, 243, 1)',
                borderWidth: 2,
                tension: 0.3
            },
            {
                label: 'En Progreso',
                data: inProgressData,
                backgroundColor: 'rgba(255, 153, 20, 0.5)',
                borderColor: 'rgba(255, 153, 20, 1)',
                borderWidth: 2,
                tension: 0.3
            },
            {
                label: 'En Revisión',
                data: inReviewData,
                backgroundColor: 'rgba(156, 39, 176, 0.5)',
                borderColor: 'rgba(156, 39, 176, 1)',
                borderWidth: 2,
                tension: 0.3
            }
        ]
    };
    
    // Buscar si ya existe un gráfico anterior y destruirlo
    if (window.evolutionChart) {
        window.evolutionChart.destroy();
    }
    
    // Crear nuevo gráfico
    window.evolutionChart = new Chart(canvas, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Evolución de Tareas (últimos 7 días)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad de Tareas'
                    },
                    stacked: false
                },
                x: {
                    title: {
                        display: true,
                        text: 'Día'
                    }
                }
            }
        }
    });
    
    console.log('Gráfico de evolución renderizado correctamente');
}

// Hacer disponibles las funciones principales globalmente
window.renderKanbanBoard = renderKanbanBoard;
window.renderTasksList = renderTasksList;
window.renderCalendar = renderCalendar;
window.renderDashboard = renderDashboard;

// Sistema de inicialización segura para GitHub Pages
// Este código asegura que la aplicación se inicialice correctamente
// independientemente de cuándo se carguen los recursos

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado completamente, iniciando aplicación...');
    initializeApp();
});

// Función de inicialización segura
function initializeApp() {
    try {
        console.log('Iniciando aplicación con inicialización segura...');
        
        // Comprobar si ya se ha iniciado para evitar doble inicialización
        if (window.appInitialized) {
            console.log('La aplicación ya estaba inicializada.');
            return;
        }
        
        // Marcar como inicializada
        window.appInitialized = true;
        
        // Inicializar la aplicación con un pequeño retraso
        // para asegurar que todos los recursos están cargados
        setTimeout(function() {
            initApp();
            
            // Mostrar mensaje de bienvenida
            setTimeout(function() {
                showNotification('¡Bienvenido al Gestor de Tareas!', 'info');
            }, 1000);
        }, 300);
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        
        // Intentar recuperarse del error
        try {
            // Inicializar referencias DOM
            initDOMReferences();
            
            // Cargar tareas si existen
            const storedTasks = Storage.load('tasks');
            if (storedTasks) {
                tasks = storedTasks;
                renderTasks();
                updateDependencyOptions();
                showNotification('Aplicación recuperada con datos existentes', 'warning');
            } else {
                showNotification('Error al inicializar. No se encontraron datos guardados.', 'error');
            }
            
            // Inicializar sistema de pestañas
            initTabSystem();
        } catch (recoveryError) {
            console.error('Error en la recuperación:', recoveryError);
            
            // Último intento de recuperación
            const appStatus = document.getElementById('app-status');
            if (appStatus) {
                appStatus.innerHTML = '<span style="color: #e74c3c; font-weight: bold;">Error de inicialización. Intenta recargar la página.</span>';
            }
            
            // Mostrar notificación de error
            alert('Hubo un problema al inicializar la aplicación. Intenta recargar la página.');
        }
    }
}

// Verificar si el documento ya está cargado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Documento ya cargado, iniciando directamente...');
    setTimeout(initializeApp, 100);
}