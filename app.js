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
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentTaskId = null;

// Inicialización de la aplicación
function initApp() {
    console.log('Inicializando la aplicación...');
    renderTasks();
    updateDependencyOptions();
    
    // Event listeners
    taskForm.addEventListener('submit', handleFormSubmit);
    updateTaskBtn.addEventListener('click', handleTaskUpdate);
    filterStatus.addEventListener('change', applyFilters);
    filterPriority.addEventListener('change', applyFilters);
    
    // Establecer la fecha actual como valor predeterminado
    document.getElementById('taskDate').valueAsDate = new Date();
    console.log('Aplicación inicializada correctamente');
}

// Guardar tareas en localStorage
function saveTasks() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        console.log('Tareas guardadas en localStorage:', tasks);
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
}

// Renderizar la lista de tareas
function renderTasks(filteredTasks = null) {
    console.log('Renderizando tareas...');
    const tasksToRender = filteredTasks || tasks;
    console.log('Tareas a renderizar:', tasksToRender);
    
    tasksList.innerHTML = '';
    
    if (tasksToRender.length === 0) {
        console.log('No hay tareas para mostrar');
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="8" style="text-align: center; padding: 20px;">No hay tareas disponibles</td>`;
        tasksList.appendChild(emptyRow);
        return;
    }
    
    tasksToRender.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.type}</td>
            <td>${task.report}</td>
            <td>${task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description}</td>
            <td>${formatDate(task.date)}</td>
            <td class="status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</td>
            <td>${task.dependency || 'Ninguna'}</td>
            <td class="priority-${task.priority.toLowerCase()}">${task.priority}</td>
            <td class="action-buttons">
                <button class="edit-btn" data-id="${task.id}"><i class="fas fa-edit"></i> Editar</button>
                <button class="delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i> Eliminar</button>
            </td>
        `;
        
        tasksList.appendChild(row);
    });
    
    // Agregar event listeners a los botones de acción
    addActionButtonListeners();
    console.log('Tareas renderizadas correctamente');
}

// Agregar event listeners a los botones de acción
function addActionButtonListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEditClick);
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteClick);
    });
}

// Manejar el envío del formulario
function handleFormSubmit(e) {
    console.log('Formulario enviado');
    e.preventDefault();
    
    const taskData = {
        id: Date.now().toString(),
        type: document.getElementById('taskType').value,
        report: document.getElementById('taskReport').value,
        description: document.getElementById('taskDescription').value,
        date: document.getElementById('taskDate').value,
        status: document.getElementById('taskStatus').value,
        dependency: document.getElementById('taskDependency').value,
        priority: document.getElementById('taskPriority').value
    };
    
    console.log('Datos de la nueva tarea:', taskData);
    
    tasks.push(taskData);
    saveTasks();
    renderTasks();
    updateDependencyOptions();
    taskForm.reset();
    document.getElementById('taskDate').valueAsDate = new Date();
    
    // Mostrar mensaje de éxito
    showNotification('Tarea agregada correctamente', 'success');
    console.log('Tarea agregada y formulario reseteado');
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
document.addEventListener('DOMContentLoaded', initApp);
console.log('Evento DOMContentLoaded configurado');

// Comprobar si localStorage está disponible
try {
    localStorage.setItem('testLocalStorage', 'test');
    localStorage.removeItem('testLocalStorage');
    console.log('localStorage está disponible');
} catch (error) {
    console.error('localStorage no está disponible:', error);
} 