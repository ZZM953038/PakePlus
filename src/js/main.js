// 本地存储键
const TASKS_STORAGE_KEY = 'eisenhower-tasks';

// 从本地存储加载任务或初始化空数组
const tasks = loadTasksFromStorage() || [];

// 从本地存储加载任务
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
}

// 保存任务到本地存储
function saveTasksToStorage() {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

// DOM元素引用
const quadrants = {
    'urgent-important': document.querySelector('.urgent-important'),
    'important-not-urgent': document.querySelector('.important-not-urgent'),
    'not-important-urgent': document.querySelector('.not-important-urgent'),
    'not-important-not-urgent': document.querySelector('.not-important-not-urgent')
};

// 任务计数显示元素
const taskCountElements = {
    'urgent-important': null,
    'important-not-urgent': null,
    'not-important-urgent': null,
    'not-important-not-urgent': null
};

// 任务状态枚举
const TaskPriority = {
    URGENT_IMPORTANT: 'urgent-important',
    IMPORTANT_NOT_URGENT: 'important-not-urgent',
    NOT_IMPORTANT_URGENT: 'not-important-urgent',
    NOT_IMPORTANT_NOT_URGENT: 'not-important-not-urgent'
};

// 创建新任务
function createTask(title, priority = TaskPriority.URGENT_IMPORTANT) {
    const task = {
        id: Date.now().toString(),
        title,
        priority,
        createdAt: new Date(),
        completed: false
    };
    
    tasks.push(task);
    
    // 保存到本地存储
    saveTasksToStorage();
    
    // 确保DOM元素存在后再渲染
    if (quadrants[priority]) {
        renderTask(task);
    } else {
        console.error(`Quadrant not found for priority: ${priority}`);
    }
    
    updateTaskCounts();
    return task;
}

// 更新任务计数
function updateTaskCounts() {
    // 移除旧的计数元素
    Object.values(taskCountElements).forEach(el => {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });

    // 为每个象限添加新的计数
    const counts = {
        'urgent-important': 0,
        'important-not-urgent': 0,
        'not-important-urgent': 0,
        'not-important-not-urgent': 0
    };

    tasks.forEach(task => {
        counts[task.priority]++;
    });

    // 为每个象限添加计数显示（插入到第一个子元素位置）
    Object.entries(counts).forEach(([quadrant, count]) => {
        const quadrantElement = quadrants[quadrant];
        const countElement = document.createElement('div');
        countElement.className = 'task-count';
        countElement.textContent = `📌 ${count} 个任务`;
        
        // 插入到象限的第一个子元素之前
        if (quadrantElement.firstChild) {
            quadrantElement.insertBefore(countElement, quadrantElement.firstChild);
        } else {
            quadrantElement.appendChild(countElement);
        }
        
        taskCountElements[quadrant] = countElement;
    });
}

// 渲染单个任务
function renderTask(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-card';
    
    // 添加优先级图标
    let priorityIcon = '';
    switch(task.priority) {
        case TaskPriority.URGENT_IMPORTANT:
            priorityIcon = '🔥';
            break;
        case TaskPriority.IMPORTANT_NOT_URGENT:
            priorityIcon = '📌';
            break;
        case TaskPriority.NOT_IMPORTANT_URGENT:
            priorityIcon = '⏰';
            break;
        default:
            priorityIcon = '🧠';
    }
    
    taskElement.innerHTML = `
        <div class="task-header">
            <span class="priority-icon">${priorityIcon}</span>
            <h3>${task.title}</h3>
        </div>
        <button class="complete-btn">完成</button>
    `;
    
    // 根据优先级添加不同样式
    switch(task.priority) {
        case TaskPriority.URGENT_IMPORTANT:
            taskElement.classList.add('urgent-important-bg');
            break;
        case TaskPriority.IMPORTANT_NOT_URGENT:
            taskElement.classList.add('important-not-urgent-bg');
            break;
        case TaskPriority.NOT_IMPORTANT_URGENT:
            taskElement.classList.add('not-important-urgent-bg');
            break;
        default:
            taskElement.classList.add('not-important-not-urgent-bg');
    }
    
    // 添加到对应象限
    quadrants[task.priority].appendChild(taskElement);
    
    // 添加点击事件
    taskElement.querySelector('.complete-btn').addEventListener('click', () => {
        completeTask(taskElement);
    });
}

// 在文件底部添加完成任务函数
function completeTask(taskElement) {
    taskElement.classList.add('completed');
    
    // 找到任务在tasks数组中的索引
    // 由于我们没有在taskElement上存储任务ID，我们需要通过标题来查找
    const taskTitle = taskElement.querySelector('h3').textContent;
    
    // 从DOM中移除任务卡片
    setTimeout(() => {
        if (taskElement.parentNode) {
            // 在移除DOM元素前找到对应的任务
            const taskIndex = tasks.findIndex(task => task.title === taskTitle);
            if (taskIndex !== -1) {
                // 从tasks数组中移除任务
                tasks.splice(taskIndex, 1);
                // 保存到本地存储
                saveTasksToStorage();
                // 更新任务计数
                updateTaskCounts();
            }
            
            taskElement.parentNode.removeChild(taskElement);
        }
    }, 300);
}

// 在init函数中添加DOMContentLoaded检查
function init() {
    // 确保DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeApp();
        });
    } else {
        initializeApp();
    }
}

// 分离初始化逻辑便于调用
function initializeApp() {
    // 绑定表单提交事件
    document.querySelector('.task-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const titleInput = document.getElementById('task-title');
        const prioritySelect = document.getElementById('task-priority');
        
        if (titleInput && prioritySelect) {
            createTask(titleInput.value, prioritySelect.value);
            updateTaskCounts();
            titleInput.value = '';
        }
    });

    // 从本地存储加载并渲染任务
    tasks.forEach(task => {
        renderTask(task);
    });
    
    // 更新任务计数
    updateTaskCounts();
}

// 添加任务函数 - 用于HTML中的onclick事件
function addTask() {
    const titleInput = document.getElementById('task-title');
    const prioritySelect = document.getElementById('task-priority');
    
    if (titleInput && prioritySelect && titleInput.value.trim()) {
        createTask(titleInput.value, prioritySelect.value);
        titleInput.value = '';
    } else {
        alert('请输入任务标题');
    }
}

// 启动应用
init();