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
        showNotification('Tarea de prueba agregada', 'success');
        return true;
    } catch (error) {
        console.error('Error al agregar tarea manual:', error);
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