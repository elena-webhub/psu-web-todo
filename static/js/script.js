const ToDos = {

    loadingElement: document.getElementById('loading'),
    sectionContainer: document.getElementById('section-container'),
    errorElement: document.getElementById('error'),
    todoList: document.getElementById('todo-list'),

    async init() {
        try {
            const todos = await this.fetchTodos();
            const filterBtn = document.getElementById('filter-btn');
            filterBtn.removeAttribute('disabled');
            filterBtn.addEventListener('click', () => { this.filterClick(todos) });
            this.fillTodosList(todos);
        } catch (e) {
            this.showError(e.message)
            return;
        }
    },

    setLoading(loading) {
        this.loadingElement.style.display = loading ? '' : 'none';
    },

    showError(error) {
        this.errorElement.textContent = error;
        this.errorElement.style.display = '';
    },

    async fetchTasks() {
        this.setLoading(true);
        const tasksResponse = await fetch(`${window.origin}/getTasks`);
        this.setLoading(false);
        if (!tasksResponse.ok) {
            throw new Error('Не удалось получить задачи... ');
        }
        const tasks = await tasksResponse.json();
        return tasks;
    },

    async fetchComments(id) {

        const entry = {
                task_id: id
        };
        this.setLoading(true);
        const commentsResponse = await fetch(`${window.origin}/getComments`, {
            method: "POST",
            body: JSON.stringify(entry),
            cache: "no-cache",
            headers: new Headers({
                "content-type": "application/json"
            })
        });
        this.setLoading(false);
        if (!commentsResponse.ok) {
            throw new Error('Не удалось получить комментарии... ');
        }
        const comments = await commentsResponse.json();
        return comments;
    },

    async fetchTodos() {
        this.setLoading(true);
        const todosResponse = await fetch('https://jsonplaceholder.typicode.com/todos');
        this.setLoading(false);
        if (!todosResponse.ok) {
            throw new Error('Не удалось получить комментарии... ');
        }
        const todos = await todosResponse.json();
        return todos;
    },

    async fillTodosList(todos, tasks = []) {
        for (const todo of todos) {
            const todoItem = document.querySelector(`li[data-id="${todo.id}"]`)
            let task_status = 0
            let task_description = 0
            if(todoItem)
            {
                if (tasks.length === 0) {

                    tasks = await this.fetchTasks();
                    console.log(tasks);
                }
                for (let i = 0; i < tasks.length; i++) {
                        if(tasks[i].id === todo.id) {
                            task_status = tasks[i].completed;
                            task_description = tasks[i].description;
                            break;
                        }
                    }
                // List Item (ToDo)
                const headerBlock = document.getElementById('header-block'+todo.id);
                // Task checkbox
                const checkboxDiv = document.createElement('div');
                checkboxDiv.classList.add("checkbox-completed");
                checkboxDiv.classList.add("float-right");
                checkboxDiv.classList.add("custom-control");
                checkboxDiv.classList.add("custom-checkbox");
                checkboxDiv.classList.add("form-control-lg");
                const chk = document.createElement('input');
                chk.setAttribute('type',"checkbox");
                chk.setAttribute('name',"taskComplete")
                chk.classList.add("custom-control-input");
                chk.setAttribute('id',"customCheck"+todo.id)
                if(task_status === 0)
                {
                    chk.checked = false;
                }
                else {
                    chk.checked = true;
                    todoItem.classList.add("completed-todo");
                    headerBlock.classList.add("completed-todo");
                }
                chk.addEventListener('change', async () => {
                    let currentCheckboxStatus = chk.checked
                    if (!confirm('Вы уверены, что хотите поменять статус этого задания?')) {
                        if (currentCheckboxStatus)
                            chk.checked = false
                        else
                            chk.checked = true
                        return;
                    }
                    let entry = {};
                    if(chk.checked)
                    {
                        todoItem.classList.add("completed-todo");
                        headerBlock.classList.add("completed-todo");
                        commentsListForm.classList.add("completed-form");
                        editBtn.setAttribute('disabled', 'true');
                        entry = {
                            task_id: todo.id,
                            action: "completed"
                        };
                    }
                    else {
                        todoItem.classList.remove("completed-todo");
                        headerBlock.classList.remove("completed-todo");
                        commentsListForm.classList.remove("completed-form");
                        editBtn.removeAttribute('disabled');
                        entry = {
                            task_id: todo.id,
                            action: "uncompleted"
                        };
                    }
                    await fetch(`${window.origin}`, {
                            method: "PATCH",
                            credentials: "include",
                            body: JSON.stringify(entry),
                            cache: "no-cache",
                            headers: new Headers({
                                "content-type": "application/json"
                            })
                        });
                });
                const chkLabel = document.createElement('label');
                chkLabel.htmlFor = "customCheck"+todo.id;
                chkLabel.appendChild(document.createTextNode('Выполнено'));
                checkboxDiv.appendChild(chk);
                checkboxDiv.appendChild(chkLabel);
                todoItem.appendChild(checkboxDiv);
                const divDescription = document.createElement('div');
                divDescription.setAttribute('id', 'description-block'+todo.id);
                divDescription.classList.add("description-block");
                divDescription.appendChild(document.createTextNode(task_description))
                todoItem.appendChild(divDescription)
                todoItem.appendChild(document.createElement('hr'));

                // Todo comment
                const titleEl = document.createElement('div');
                const header2 = document.createElement('h2');
                header2.textContent = "Комментарий к задаче:";
                titleEl.appendChild(header2);
                const commentServ = document.createElement('div');
                commentServ.textContent = todo.title;
                titleEl.appendChild(commentServ);

                const commentsList = document.createElement('div');
                commentsList.setAttribute('id', 'comments_list'+todo.id);
                const comments = await this.fetchComments(todo.id);
                for (let i = 0; i < comments.length; i++) {
                    const comment = document.createElement('div');
                    comment.textContent = "Вы: " + comments[i].text;
                    comment.style.fontWeight = 'bold';
                    commentsList.appendChild(comment);
                }
                titleEl.appendChild(commentsList);
                titleEl.appendChild(document.createElement('br'));

                // Add comment
                const commentsListForm = document.createElement('form');
                commentsListForm.classList.add('card-body');
                if (chk.checked) commentsListForm.classList.add('completed-form');
                commentsListForm.setAttribute('id', 'comment_form'+todo.id);
                const inpAddComm = document.createElement('input');
                inpAddComm.setAttribute('type', 'text');
                inpAddComm.setAttribute('name', 'comment_text');
                inpAddComm.setAttribute('class', 'form-control');
                inpAddComm.setAttribute('id', 'comment_input'+todo.id);
                inpAddComm.setAttribute('placeholder', 'Введите комментарий')
                commentsListForm.appendChild(inpAddComm);
                // Comment button
                const comButton = document.createElement('button');
                comButton.classList.add('btn');
                comButton.classList.add('btn-primary');
                comButton.classList.add('btn-add-comm');
                comButton.textContent = 'Добавить комментарий';
                commentsListForm.addEventListener('submit', (e) => { this.addComment(e, todo.id, inpAddComm.value) });
                commentsListForm.appendChild(comButton);

                titleEl.appendChild(commentsListForm);
                titleEl.classList.add('collapse');
                titleEl.setAttribute('id', "demo"+todo.id);
                todoItem.appendChild(titleEl);
                todoItem.appendChild(document.createElement('br'));

                // Remove button
                const delBtn = this.addButton('Удалить', 'btn-danger');
                delBtn.addEventListener('click', () => { this.removeTodo(todo.id) });
                todoItem.appendChild(delBtn);

                // Edit button
                const editBtn = this.addButton('Редактировать', 'btn-primary');
                if (chk.checked) editBtn.setAttribute('disabled', 'true');
                editBtn.setAttribute('id', 'editBtn'+todo.id);
                editBtn.addEventListener('click', () => { this.editTodo(todo.id) });
                todoItem.appendChild(editBtn);
                todoItem.appendChild(editBtn);

                // Add todo to list
                this.todoList.appendChild(todoItem);
            }
        }
    },

    addButton(text, text_for_class) {
        const button = document.createElement('button');
        button.classList.add('btn');
        button.classList.add(text_for_class);
        button.classList.add('btn-sm');
        button.classList.add('btn-remove-todo');
        button.classList.add('ml-auto');
        button.textContent = text;
        return button;
    },

    //Add comment
    async addComment(e, id, text) {
        e.preventDefault();
        try {
            const entry = {
                comment_text: text,
                task_id: id
            };
            await fetch(`${window.origin}/addComment`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(entry),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            });

            const commentsList = document.getElementById("comments_list"+id);
            const comment = document.getElementById("comment_input"+id);
            const newComment = document.createElement('div');
            newComment.textContent = "Вы: " + comment.value;
            newComment.style.fontWeight = 'bold';
            comment.value = "";
            commentsList.appendChild(newComment);

        } catch (error) {
            this.showError(error.message);
        }
    },

    // Delete task
    async removeTodo(id) {
        if (!confirm('Вы уверены, что хотите удалить это задание?')) {
            return;
        }

        try {
            this.setLoading(true);
            const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, { method: 'delete' });
            this.setLoading(false);
            if (!res.ok) {
                throw new Error("Не удалось удалить запись...");
            }

            const entry = {
                task_id: id
            };

            await fetch(`${window.origin}`, {
                method: "DELETE",
                credentials: "include",
                body: JSON.stringify(entry),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            });
            document.querySelector(`li[data-id="${id}"]`).remove();
        } catch (error) {
            this.showError(error.message);
        }
    },

    //Edit task
    async editTodo(id) {
        const headerTask = document.getElementById('header-task'+id);
        headerTask.removeAttribute('data-toggle');

        const headerBlock = document.getElementById('header-block'+id);
        headerBlock.setAttribute('contenteditable', 'true');
        const descriptionBlock = document.getElementById('description-block'+id);
        descriptionBlock.setAttribute('contenteditable', 'true');

        const saveBtn = document.createElement('button');
        saveBtn.setAttribute('id', 'saveBtn'+id);
        saveBtn.classList.add('btn');
        saveBtn.classList.add('btn-primary');
        saveBtn.classList.add('btn-sm');
        saveBtn.classList.add('ml-auto');
        saveBtn.textContent = 'Сохранить';
        saveBtn.addEventListener('click', () => { this.saveTodo(id) });

        const todoItem = document.querySelector(`li[data-id="${id}"]`)
        todoItem.appendChild(saveBtn);

        const editBtn = document.getElementById('editBtn'+id);
        editBtn.setAttribute('disabled', 'true');
    },

    //Save edited data
    async saveTodo(id) {
        const headerTask = document.getElementById('header-task'+id);
        headerTask.setAttribute('data-toggle', 'collapse');

        const headerBlock = document.getElementById('header-block'+id);
        headerBlock.removeAttribute('contenteditable');
        const descriptionBlock = document.getElementById('description-block'+id);
        descriptionBlock.removeAttribute('contenteditable');

        //обновление в БД
        try {
            const entry = {
                task_id: id,
                header_text: headerBlock.innerText,
                description_text: descriptionBlock.textContent,
            };
            await fetch(`${window.origin}/updateTask`, {
                method: "PATCH",
                credentials: "include",
                body: JSON.stringify(entry),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            });

        } catch (error) {
            this.showError(error.message);
        }

        const saveBtn = document.getElementById('saveBtn'+id);
        const todoItem = document.querySelector(`li[data-id="${id}"]`)
        todoItem.removeChild(saveBtn);

        const editBtn = document.getElementById('editBtn'+id);
        editBtn.removeAttribute('disabled');
    },

    //Filter data
    async filterClick(todos) {
        this.todoList.innerHTML = '';
        const filters = document.getElementById('filters');
        const filterTitle = document.getElementById('name-filter');
        try {
            const entry = {
                state: filters.options[filters.selectedIndex].value,
                title: filterTitle.value
            };
            const filterResponse = await fetch(`${window.origin}/filters`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(entry),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            });

            if (!filterResponse.ok) {
                throw new Error('Не удалось отсортировать... ');
            }
            const filterTasks = await filterResponse.json();
            const filterInput = document.getElementById('name-filter');
            filterInput.value = '';
            if (filterTasks.length === 0) {
                return;
            } else {
                console.log(filterTasks);
                for (let i=0; i < filterTasks.length; i++) {
                    const todoItem = document.createElement('li');
                    todoItem.classList.add('list-group-item', 'list-group-item-action', 'todo-item');
                    todoItem.setAttribute('data-id', filterTasks[i].id);

                    const headerBlock = document.createElement('div');
                    headerBlock.classList.add('header-block');
                    headerBlock.setAttribute('id', 'header-block'+filterTasks[i].id);

                    const h1El = document.createElement('h1');
                    h1El.classList.add('header-task');
                    h1El.setAttribute('id', 'header-task'+filterTasks[i].id);
                    h1El.setAttribute('data-toggle', 'collapse');
                    h1El.setAttribute('data-target', '#demo'+filterTasks[i].id);
                    h1El.textContent = filterTasks[i].name;

                    headerBlock.appendChild(h1El);
                    todoItem.appendChild(headerBlock);
                    this.todoList.appendChild(todoItem);
                }
                this.fillTodosList(todos, filterTasks);
            }

        } catch (error) {
            this.showError(error.message);
        }
    }
}

ToDos.init();