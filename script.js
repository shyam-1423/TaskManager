document.addEventListener("DOMContentLoaded", function () {
    const taskForm = document.getElementById("task-form");
    const taskList = document.getElementById("task-list");
    const priorityFilter = document.getElementById("priority-filter");
    const statusFilter = document.getElementById("status-filter");
    const progressBar = document.querySelector('.progress-bar');
    const taskCountBadge = document.getElementById('task-count-badge');
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const formContainer = document.getElementById('form-container');
    const submitTaskBtn = document.getElementById('submit-task-btn');

    // For editing tasks
    let editingIndex = null;

    // Toggle form visibility
    toggleFormBtn.addEventListener('click', function () {
        const isVisible = formContainer.style.display !== 'none';
        formContainer.style.display = isVisible ? 'none' : 'block';
        toggleFormBtn.innerHTML = isVisible
            ? '<i class="fas fa-plus-circle"></i> Add New Task'
            : '<i class="fas fa-minus-circle"></i> Hide Form';

        if (!isVisible) {
            formContainer.classList.add('new-task-animation');
            setTimeout(() => formContainer.classList.remove('new-task-animation'), 300);
        }
    });

    function updateProgressBar(tasks) {
        if (tasks.length === 0) {
            progressBar.style.width = '0%';
            return;
        }

        const completedTasks = tasks.filter(task => task.completed).length;
        const completionPercentage = Math.round((completedTasks / tasks.length) * 100);
        progressBar.style.width = completionPercentage + '%';
        taskCountBadge.textContent = `${completedTasks}/${tasks.length} done`;
    }
    // Load Tasks
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        displayFilteredTasks();
        updateProgressBar(tasks);
    }

    //Save Tasks
    function saveTasks(tasks) {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        updateProgressBar(tasks);
    }

    // Formate DATa
    function formatDate(dateString) {
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    //Display Tasks
    function displayTasks(tasks) {
        taskList.innerHTML = "";

        if (tasks.length === 0) {
            taskList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon empty-state-animation"><i class="fas fa-clipboard-check"></i></div>
            <p>No tasks to display</p>
        </div>
    `;
            return;
        }

        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.classList.add("task-item", `priority-${task.priority}`);

            if (task.completed) {
                li.classList.add("completed");
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDate = new Date(task.date);
            dueDate.setHours(0, 0, 0, 0);
            const isOverdue = !task.completed && dueDate < today;

            li.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="task-content">
                        <div class="task-title">${task.title}</div>
                        ${task.desc ? `<div class="task-description">${task.desc}</div>` : ''}
                        <div class="task-meta">
                            <span class="due-date">
                                <i class="far fa-calendar-alt me-1"></i> ${formatDate(task.date)}
                                ${isOverdue ? '<span class="ms-1 badge-overdue">Overdue</span>' : ''}
                                ${task.completed ? '<span class="ms-1 badge-completed">Completed</span>' : ''}
                            </span>
                            <span class="priority-badge priority-${task.priority}">
                                <i class="fas fa-flag me-1"></i> ${task.priority}
                            </span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn complete-btn" data-index="${index}" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                            <i class="fas ${task.completed ? 'fa-times' : 'fa-check'}"></i>
                        </button>
                        <button class="action-btn edit-btn" data-index="${index}" title="Edit task">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="action-btn delete-btn" data-index="${index}" title="Delete task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            li.classList.add('new-task-animation');
            taskList.appendChild(li);
        });
    }

    //Display Filtered Tasks
    function displayFilteredTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const priorityValue = priorityFilter.value;
        const statusValue = statusFilter.value;

        let filteredTasks = [...tasks];

        if (priorityValue !== "all") {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityValue);
        }

        if (statusValue !== "all") {
            if (statusValue === "completed") {
                filteredTasks = filteredTasks.filter(task => task.completed === true);
            } else {
                filteredTasks = filteredTasks.filter(task => task.completed === false);
            }
        }
        // Display filtered tasks
        displayTasks(filteredTasks);
    }

    // Form submission
    taskForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById('task-title').value;
        const desc = document.getElementById('task-desc').value;
        const date = document.getElementById('task-date').value;
        const priority = document.getElementById('task-priority').value;

        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

        const newTask = {
            title,
            desc,
            date,
            priority,
            completed: false
        };

        if (editingIndex !== null) {
            tasks[editingIndex] = newTask;
            editingIndex = null;
            submitTaskBtn.textContent = 'Add Task';
        } else {
            tasks.push(newTask);
        }

        saveTasks(tasks);
        displayFilteredTasks();
        taskForm.reset();
        formContainer.style.display = 'none';
        toggleFormBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Task';
    });

    // Task actions handler
    taskList.addEventListener('click', function (e) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const index = e.target.closest('.action-btn')?.dataset.index;

        if (!index) return;

        if (e.target.closest('.complete-btn')) {
            tasks[index].completed = !tasks[index].completed;
            saveTasks(tasks);
            displayFilteredTasks();
        }

        if (e.target.closest('.edit-btn')) {
            const task = tasks[index];
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-desc').value = task.desc || '';
            document.getElementById('task-date').value = task.date;
            document.getElementById('task-priority').value = task.priority;

            editingIndex = index;
            submitTaskBtn.textContent = 'Update Task';
            formContainer.style.display = 'block';
            toggleFormBtn.innerHTML = '<i class="fas fa-minus-circle"></i> Hide Form';
        }

        if (e.target.closest('.delete-btn')) {
            if (confirm('Are you sure you want to delete this task?')) {
                tasks.splice(index, 1);
                saveTasks(tasks);
                displayFilteredTasks();
            }
        }
    });

    // Filter change handlers
    priorityFilter.addEventListener('change', displayFilteredTasks);
    statusFilter.addEventListener('change', displayFilteredTasks);

    // Initial load
    loadTasks();
});