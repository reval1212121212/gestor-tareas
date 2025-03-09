// Elementos del DOM
const taskForm = document.getElementById('taskForm');
const tasksTable = document.getElementById('tasksTable');
const tasksList = document.getElementById('tasksList');
const addTaskBtn = document.getElementById('addTask');
const updateTaskBtn = document.getElementById('updateTask');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const taskDependency = document.getElementById('taskDependency');

// Variables globales
let tasks = [];
let currentTaskId = null;

// Sistema de almacenamiento - con respaldo en caso de error
const Storage = {
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log('Datos guardados correctamente:', key, data);
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

// Inicialización de la aplicación
function initApp() {
    console.log('Iniciando aplicación...');
    
    // Cargar tareas desde almacenamiento
    const storedTasks = Storage.load('tasks');
    if (storedTasks) {
        tasks = storedTasks;
        console.log('Tareas cargadas:', tasks);
    } else {
        console.log('No se encontraron tareas guardadas');
        tasks = [];
    }
    
    // Renderizar tareas y actualizar opciones
    renderTasks();
    updateDependencyOptions();
    
    // Configurar los event listeners manualmente para asegurar que funcionen
    if (taskForm) {
        taskForm.onsubmit = function(e) {
            e.preventDefault();
            handleFormSubmit(e);
            return false;
        };
        console.log('Event listener de formulario configurado');
    } else {
        console.error('No se encontró el formulario de tareas');
    }
    
    if (updateTaskBtn) {
        updateTaskBtn.onclick = handleTaskUpdate;
    }
    
    if (filterStatus) {
        filterStatus.onchange = applyFilters;
    }
    
    if (filterPriority) {
        filterPriority.onchange = applyFilters;
    }
    
    // Establecer la fecha actual como valor predeterminado
    const dateInput = document.getElementById('taskDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    console.log('Aplicación inicializada correctamente');
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
    
    // Verificar que el elemento exista
    if (!tasksList) {
        console.error('No se encontró el elemento para la lista de tareas');
        return;
    }
    
    const tasksToRender = filteredTasks || tasks;
    console.log('Tareas a renderizar:', tasksToRender);
    
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
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.type || ''}</td>
                <td>${task.report || ''}</td>
                <td>${task.description ? (task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description) : ''}</td>
                <td>${formatDate(task.date)}</td>
                <td class="status-${(task.status || '').toLowerCase().replace(' ', '-')}">${task.status || ''}</td>
                <td>${task.dependency || 'Ninguna'}</td>
                <td class="priority-${(task.priority || '').toLowerCase()}">${task.priority || ''}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${task.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i> Eliminar</button>
                </td>
            `;
            
            tasksList.appendChild(row);
        } catch (error) {
            console.error('Error al renderizar tarea:', error, task);
        }
    });
    
    // Agregar event listeners a los botones de acción
    addActionButtonListeners();
    console.log('Tareas renderizadas correctamente');
}

// Agregar event listeners a los botones de acción
function addActionButtonListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.onclick = handleEditClick;
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.onclick = handleDeleteClick;
    });
    
    console.log('Event listeners de botones de acción configurados');
}

// Manejar el envío del formulario
function handleFormSubmit(e) {
    console.log('Enviando formulario...');
    
    // Prevenir el comportamiento predeterminado
    if (e) {
        e.preventDefault();
    }
    
    try {
        // Obtener los valores del formulario
        const typeInput = document.getElementById('taskType');
        const reportInput = document.getElementById('taskReport');
        const descriptionInput = document.getElementById('taskDescription');
        const dateInput = document.getElementById('taskDate');
        const statusInput = document.getElementById('taskStatus');
        const dependencyInput = document.getElementById('taskDependency');
        const priorityInput = document.getElementById('taskPriority');
        
        if (!typeInput || !reportInput || !descriptionInput || !dateInput || !statusInput || !priorityInput) {
            console.error('Faltan elementos del formulario');
            return;
        }
        
        // Crear objeto de tarea
        const taskData = {
            id: Date.now().toString(),
            type: typeInput.value,
            report: reportInput.value,
            description: descriptionInput.value,
            date: dateInput.value,
            status: statusInput.value,
            dependency: dependencyInput ? dependencyInput.value : '',
            priority: priorityInput.value
        };
        
        console.log('Datos de la nueva tarea:', taskData);
        
        // Validar que los campos requeridos tengan valor
        if (!taskData.type || !taskData.report || !taskData.description || !taskData.date || !taskData.status || !taskData.priority) {
            console.error('Faltan campos requeridos');
            alert('Por favor, completa todos los campos requeridos');
            return;
        }
        
        // Agregar la tarea al array
        tasks.push(taskData);
        console.log('Tarea agregada al array, nuevo total:', tasks.length);
        
        // Guardar, renderizar y actualizar
        saveTasks();
        renderTasks();
        updateDependencyOptions();
        
        // Resetear el formulario
        if (taskForm) {
            taskForm.reset();
        }
        
        // Establecer la fecha actual
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }
        
        // Mostrar mensaje de éxito
        showNotification('Tarea agregada correctamente', 'success');
        console.log('Tarea agregada y formulario reseteado');
    } catch (error) {
        console.error('Error al agregar tarea:', error);
        showNotification('Error al agregar tarea: ' + error.message, 'error');
    }
}

// Manejar el clic en el botón de editar
function handleEditClick(e) {
    const taskId = e.currentTarget.getAttribute('data-id');
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        document.getElementById('taskType').value = task.type;
        document.getElementById('taskReport').value = task.report;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskDate').value = task.date;
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskDependency').value = task.dependency;
        document.getElementById('taskPriority').value = task.priority;
        
        // Habilitar el botón de actualización y deshabilitar el de agregar
        updateTaskBtn.disabled = false;
        addTaskBtn.disabled = true;
        
        // Guardar el ID de la tarea actual
        currentTaskId = taskId;
        
        // Desplazarse al formulario
        document.querySelector('.add-task-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Manejar la actualización de tarea
function handleTaskUpdate() {
    if (!currentTaskId) return;
    
    const taskIndex = tasks.findIndex(t => t.id === currentTaskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            type: document.getElementById('taskType').value,
            report: document.getElementById('taskReport').value,
            description: document.getElementById('taskDescription').value,
            date: document.getElementById('taskDate').value,
            status: document.getElementById('taskStatus').value,
            dependency: document.getElementById('taskDependency').value,
            priority: document.getElementById('taskPriority').value
        };
        
        saveTasks();
        renderTasks();
        updateDependencyOptions();
        taskForm.reset();
        document.getElementById('taskDate').valueAsDate = new Date();
        
        // Restablecer los botones
        updateTaskBtn.disabled = true;
        addTaskBtn.disabled = false;
        currentTaskId = null;
        
        // Mostrar mensaje de éxito
        showNotification('Tarea actualizada correctamente', 'success');
    }
}

// Manejar el clic en el botón de eliminar
function handleDeleteClick(e) {
    const taskId = e.currentTarget.getAttribute('data-id');
    
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        // Verificar si hay tareas que dependen de esta
        const dependentTasks = tasks.filter(t => t.dependency === getTaskNameById(taskId));
        
        if (dependentTasks.length > 0) {
            alert('No se puede eliminar esta tarea porque hay otras tareas que dependen de ella.');
            return;
        }
        
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        updateDependencyOptions();
        
        // Si la tarea que se está editando es la que se eliminó, resetear el formulario
        if (currentTaskId === taskId) {
            taskForm.reset();
            document.getElementById('taskDate').valueAsDate = new Date();
            updateTaskBtn.disabled = true;
            addTaskBtn.disabled = false;
            currentTaskId = null;
        }
        
        // Mostrar mensaje de éxito
        showNotification('Tarea eliminada correctamente', 'success');
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

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Iniciar la aplicación cuando el DOM esté cargado
console.log('Configurando evento DOMContentLoaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado completamente');
    try {
        initApp();
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
});

// Método directo para agregar tarea (para pruebas desde consola)
window.addTaskManual = function() {
    try {
        const taskData = {
            id: Date.now().toString(),
            type: 'Desarrollo',
            report: 'Tarea de prueba',
            description: 'Esta es una tarea de prueba',
            date: new Date().toISOString().split('T')[0],
            status: 'Pendiente',
            dependency: '',
            priority: 'Media'
        };
        
        tasks.push(taskData);
        saveTasks();
        renderTasks();
        updateDependencyOptions();
        
        // Actualizar otras vistas según la pestaña activa
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            const tabId = activeTab.getAttribute('data-tab');
            if (tabId === 'tab-kanban') {
                renderKanbanBoard();
            } else if (tabId === 'tab-list') {
                renderTasksList();
            } else if (tabId === 'tab-calendar') {
                renderCalendar();
            } else if (tabId === 'tab-dashboard') {
                renderDashboard();
            }
        }
        
        showNotification('Tarea de prueba agregada', 'success');
        return true;
    } catch (error) {
        console.error('Error al agregar tarea manual:', error);
        showNotification('Error al agregar tarea de prueba', 'error');
        return false;
    }
};

// Comprobar si localStorage está disponible
try {
    localStorage.setItem('testLocalStorage', 'test');
    localStorage.removeItem('testLocalStorage');
    console.log('localStorage está disponible');
} catch (error) {
    console.error('localStorage no está disponible:', error);
}

// Inicialización del sistema de pestañas
function initTabSystem() {
    console.log('Inicialización de pestañas desde app.js - ahora esta función está desactivada para evitar conflictos');
    // La inicialización de pestañas ahora se maneja mediante un script independiente
    return; // Salir sin hacer nada para evitar conflictos
}

// Funciones para Vista Kanban
function renderKanbanBoard() {
    try {
        console.log('Renderizando tablero Kanban...');
        
        // Obtener las columnas del tablero
        const columns = document.querySelectorAll('.kanban-column-body');
        
        if (columns.length === 0) {
            console.error('No se encontraron columnas para el tablero Kanban');
            return;
        }
        
        // Limpiar las columnas
        columns.forEach(column => {
            column.innerHTML = '';
        });
        
        // Contador de tareas por columna
        const taskCounters = {
            'Pendiente': 0,
            'En progreso': 0,
            'En revisión': 0,
            'Completada': 0
        };
        
        // Distribuir las tareas en las columnas según su estado
        tasks.forEach(task => {
            try {
                // Incrementar el contador
                if (taskCounters.hasOwnProperty(task.status)) {
                    taskCounters[task.status]++;
                }
                
                // Crear tarjeta para el tablero Kanban
                const card = createKanbanCard(task);
                
                // Buscar la columna correspondiente
                const column = document.querySelector(`.kanban-column-body[data-status="${task.status}"]`);
                if (column) {
                    column.appendChild(card);
                }
            } catch (error) {
                console.error('Error al renderizar tarea en Kanban:', error, task);
            }
        });
        
        // Actualizar los contadores de tareas en cada columna
        for (const status in taskCounters) {
            try {
                const counter = document.querySelector(`.kanban-column-${status.replace(' ', '-')} .kanban-column-count`);
                if (counter) {
                    counter.textContent = taskCounters[status];
                }
            } catch (error) {
                console.error('Error al actualizar contador de columna:', error, status);
            }
        }
        
        // Asegurarse de que los botones de acción funcionen
        document.querySelectorAll('.kanban-column-body .edit-btn').forEach(button => {
            button.onclick = handleEditClick;
        });
        
        document.querySelectorAll('.kanban-column-body .delete-btn').forEach(button => {
            button.onclick = handleDeleteClick;
        });
        
        console.log('Tablero Kanban renderizado correctamente');
    } catch (error) {
        console.error('Error al renderizar tablero Kanban:', error);
        showNotification('Error al cargar vista Kanban', 'error');
    }
}

function createKanbanCard(task) {
    // Crear elemento de tarjeta
    const card = document.createElement('div');
    card.className = `kanban-card priority-${task.priority.toLowerCase()}`;
    card.style.borderLeftColor = getPriorityColor(task.priority);
    
    // Crear contenido de la tarjeta
    card.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${task.report || 'Sin título'}</h3>
        </div>
        <div class="task-meta">
            <span class="task-tag tag-type">
                <i class="fas fa-tag"></i> ${task.type || ''}
            </span>
            <span class="task-tag priority-${task.priority.toLowerCase()}">
                <i class="fas fa-flag"></i> ${task.priority || ''}
            </span>
        </div>
        <p class="task-description">${task.description ? (task.description.length > 80 ? task.description.substring(0, 80) + '...' : task.description) : ''}</p>
        <p class="task-date">
            <i class="far fa-calendar-alt"></i> ${formatDate(task.date)}
        </p>
        <div class="task-actions">
            <button class="btn btn-primary btn-small edit-btn" data-id="${task.id}">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger btn-small delete-btn" data-id="${task.id}">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        </div>
    `;
    
    // Añadir event listeners a los botones
    card.querySelector('.edit-btn').onclick = handleEditClick;
    card.querySelector('.delete-btn').onclick = handleDeleteClick;
    
    return card;
}

function getPriorityColor(priority) {
    switch (priority.toLowerCase()) {
        case 'baja':
            return '#4CAF50'; // Verde
        case 'media':
            return '#2196F3'; // Azul
        case 'alta':
            return '#ff9914'; // Naranja
        case 'urgente':
            return '#f44336'; // Rojo
        default:
            return '#757575'; // Gris
    }
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
    
    // Actualizar KPIs
    updateKPIValues();
    
    // Renderizar gráficos
    renderStatusChart();
    renderPriorityChart();
    renderTypeChart();
    renderTasksEvolutionChart();
    
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

// Función para crear gráficos (aquí usarías Chart.js en una aplicación real)
function renderStatusChart() {
    console.log('Renderizando gráfico de estado de tareas...');
    
    const canvas = document.getElementById('chart-status-distribution');
    if (!canvas) return;
    
    // Conteo de tareas por estado
    const statusCounts = {
        'Pendiente': 0,
        'En progreso': 0,
        'En revisión': 0,
        'Completada': 0
    };
    
    // Contar tareas por estado
    tasks.forEach(task => {
        if (statusCounts.hasOwnProperty(task.status)) {
            statusCounts[task.status]++;
        }
    });
    
    // Configuración del gráfico
    const data = {
        labels: Object.keys(statusCounts),
        datasets: [{
            label: 'Tareas por Estado',
            data: Object.values(statusCounts),
            backgroundColor: [
                'rgba(33, 150, 243, 0.7)', // Azul para Pendiente
                'rgba(255, 153, 20, 0.7)', // Naranja para En progreso
                'rgba(156, 39, 176, 0.7)', // Púrpura para En revisión
                'rgba(76, 175, 80, 0.7)'   // Verde para Completada
            ],
            borderColor: [
                'rgba(33, 150, 243, 1)',
                'rgba(255, 153, 20, 1)',
                'rgba(156, 39, 176, 1)',
                'rgba(76, 175, 80, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    // Buscar si ya existe un gráfico anterior y destruirlo
    if (window.statusChart) {
        window.statusChart.destroy();
    }
    
    // Crear nuevo gráfico
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
}

function renderPriorityChart() {
    console.log('Renderizando gráfico de prioridad de tareas...');
    
    const canvas = document.getElementById('chart-priority-distribution');
    if (!canvas) return;
    
    // Conteo de tareas por prioridad
    const priorityCounts = {
        'Baja': 0,
        'Media': 0,
        'Alta': 0,
        'Urgente': 0
    };
    
    // Contar tareas por prioridad
    tasks.forEach(task => {
        if (priorityCounts.hasOwnProperty(task.priority)) {
            priorityCounts[task.priority]++;
        }
    });
    
    // Configuración del gráfico
    const data = {
        labels: Object.keys(priorityCounts),
        datasets: [{
            label: 'Tareas por Prioridad',
            data: Object.values(priorityCounts),
            backgroundColor: [
                'rgba(76, 175, 80, 0.7)',  // Verde para Baja
                'rgba(33, 150, 243, 0.7)',  // Azul para Media
                'rgba(255, 153, 20, 0.7)',  // Naranja para Alta
                'rgba(244, 67, 54, 0.7)'    // Rojo para Urgente
            ],
            borderColor: [
                'rgba(76, 175, 80, 1)',
                'rgba(33, 150, 243, 1)',
                'rgba(255, 153, 20, 1)',
                'rgba(244, 67, 54, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    // Buscar si ya existe un gráfico anterior y destruirlo
    if (window.priorityChart) {
        window.priorityChart.destroy();
    }
    
    // Crear nuevo gráfico
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

// Función para verificar y volver a aplicar los event listeners críticos
function ensureEventListeners() {
    console.log('Verificando event listeners críticos...');
    
    // Formulario principal
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        // Clonar el formulario para eliminar event listeners anteriores
        const newForm = taskForm.cloneNode(true);
        taskForm.parentNode.replaceChild(newForm, taskForm);
        
        // Agregar nuevamente el event listener
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            try {
                handleFormSubmit(e);
            } catch (error) {
                console.error('Error en handleFormSubmit:', error);
                showNotification('Error al procesar el formulario', 'error');
            }
            return false;
        });
        console.log('Event listener de formulario reconfigurado');
    }
    
    // Botón de actualización
    const updateTaskBtn = document.getElementById('updateTask');
    if (updateTaskBtn) {
        updateTaskBtn.onclick = handleTaskUpdate;
        console.log('Event listener de botón de actualización reconfigurado');
    }
    
    // Filtros de la vista principal
    const filterStatus = document.getElementById('filterStatus');
    const filterPriority = document.getElementById('filterPriority');
    
    if (filterStatus) {
        filterStatus.onchange = applyFilters;
        console.log('Event listener de filtro de estado reconfigurado');
    }
    
    if (filterPriority) {
        filterPriority.onchange = applyFilters;
        console.log('Event listener de filtro de prioridad reconfigurado');
    }
    
    // Filtros de la vista de lista
    setupListFilters();
    
    // Navegación del calendario
    setupCalendarNavigation();
    
    // Botón de prueba
    const testBtn = document.getElementById('test-btn');
    if (testBtn) {
        testBtn.onclick = function() {
            try {
                // Crear tarea de prueba
                const taskData = {
                    id: Date.now().toString(),
                    type: 'Desarrollo',
                    report: 'Tarea de prueba',
                    description: 'Esta es una tarea de prueba creada automáticamente para verificar el funcionamiento del sistema.',
                    date: new Date().toISOString().split('T')[0],
                    status: 'Pendiente',
                    dependency: '',
                    priority: 'Media'
                };
                
                // Agregar tarea
                tasks.push(taskData);
                saveTasks();
                renderTasks();
                updateDependencyOptions();
                
                // Actualizar otras vistas si están activas
                const activeTab = document.querySelector('.tab-btn.active');
                if (activeTab) {
                    const tabId = activeTab.getAttribute('data-tab');
                    if (tabId === 'tab-kanban') {
                        renderKanbanBoard();
                    } else if (tabId === 'tab-list') {
                        renderTasksList();
                    } else if (tabId === 'tab-calendar') {
                        renderCalendar();
                    } else if (tabId === 'tab-dashboard') {
                        renderDashboard();
                    }
                }
                
                // Mostrar notificación
                showNotification('Tarea de prueba agregada correctamente', 'success');
            } catch (error) {
                console.error('Error al agregar tarea de prueba:', error);
                showNotification('Error al agregar tarea de prueba', 'error');
            }
        };
        console.log('Event listener de botón de prueba reconfigurado');
    }
    
    console.log('Event listeners críticos verificados y reconfigurados');
}

// Extiende la función de inicialización para incluir las nuevas características
function extendedInitApp() {
    console.log('Iniciando extensiones de la aplicación...');
    
    // Asegurar que los event listeners críticos estén configurados
    ensureEventListeners();
    
    // Inicializar el sistema de pestañas
    initTabSystem();
    
    // Actualizar app status para indicar que las nuevas vistas están disponibles
    const appStatus = document.getElementById('app-status');
    if (appStatus) {
        appStatus.innerHTML = '<span style="color: #4CAF50; font-weight: bold;">Funcionando con todas las vistas</span>';
    }
    
    console.log('Extensiones de la aplicación inicializadas correctamente');
}

// Extender la función original de inicialización
const originalInitApp = window.initApp;
window.initApp = function() {
    // Llamar a la función original primero
    if (typeof originalInitApp === 'function') {
        originalInitApp();
    }
    
    // Luego inicializar nuestras extensiones
    extendedInitApp();
};

// Asegurarnos de que nuestras extensiones se inicialicen incluso si la aplicación ya se ha cargado
document.addEventListener('DOMContentLoaded', function() {
    // Si la aplicación ya está inicializada, ejecutar nuestras extensiones
    setTimeout(extendedInitApp, 500);
});

// Si el documento ya está cargado, ejecutar directamente
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(extendedInitApp, 500);
}

// Hacer disponible la función globalmente
window.renderKanbanBoard = renderKanbanBoard;

// Hacer disponible la función globalmente
window.renderTasksList = renderTasksList;

// Hacer disponible la función globalmente
window.renderCalendar = renderCalendar;

// Hacer disponible la función globalmente
window.renderDashboard = renderDashboard;