const todoForm = document.querySelector<HTMLFormElement>('.todo-form');
const todos = document.querySelector('.todos') as HTMLUListElement;
const todoInput = document.querySelector<HTMLInputElement>('#todoInput');
const inputColor = document.querySelector<HTMLInputElement>('#inputColor');
const deletedTodos = document.querySelector(
    '.deleted-list'
) as HTMLUListElement;
const completedDeleteBtn =
    document.querySelector<HTMLButtonElement>('.completed-btn');
const checkDeleteBtn = document.querySelector<HTMLButtonElement>('.delete-btn');

interface Todo {
    id: number;
    isCompleted: boolean;
    content: string;
    color: string;
    date: string;
    editDate: string;
}

let todoList: Todo[] = [];
const deleteList: Todo[] = [];
const checkIdList: Set<number> = new Set();
const completedIdList: Set<number> = new Set();

//date
const date: Date = new Date();
const dateString: Date = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
);
const currDate: string = dateString
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19);

//색상 랜덤값
const randomColor = Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')
    .toUpperCase();

//local storage에 todo있을 시 로드되는 todo
const loadTodo = () => {
    getLocalStorage();
};

//save버튼 클릭시 일어나는 함수
todoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo();
});

//todo 저장 함수
const addTodo = () => {
    if (!todoInput || !inputColor) {
        return;
    }

    let isClicked = false;

    inputColor.addEventListener('click', (e) => {
        if (e) {
            isClicked = true;
        }
    });

    if (todoInput.value === '' || todoInput.value.length >= 20) {
        alert('1~20자 이내의 할 일을 입력해 주세요.');
        todoInput.focus();
        return;
    }

    const colorValue: string = isClicked ? inputColor.value : `#${randomColor}`;

    const todo: Todo = {
        id: Number(new Date().getTime()),
        isCompleted: false,
        content: todoInput.value,
        color: colorValue,
        date: currDate,
        editDate: '',
    };

    todoList.push(todo);
    todoInput.value = '';

    addTodoStorage(todoList);
    paintTodo(todoList);
    location.reload();
};

//todo list 그려주는 함수
const paintTodo = (todoList: Todo[]) => {
    const todoDOM = todoList.map((todo: Todo) => {
        //체크 상태 확인
        const checked = todo.isCompleted ? 'checked' : null;
        //완료된 항목 배열에 아이디 저장
        if (todo.isCompleted) {
            completedIdList.add(todo.id);
        } else {
            completedIdList.delete(todo.id);
        }

        return `
        <li class="todo-wrap" id=${todo.id}>
        <input type="checkbox" id=${todo.id} class="todo-check" ${checked}>
        <input id="todoDesc" class="todo-desc ${
            todo.isCompleted ? 'checked' : null
        }" style="color: ${todo.color}" disabled value=${todo.content}>
        <span class="todo-date">${todo.date}</span>
        <span class="todo-date" id="editDate">${todo.editDate ?? ''}</span>
        <input type="color" name="color" id="color" class="edit-color" value=${
            todo.color
        } />
        <button type="button" id="edit" class="todo-btn edit">EDIT</button>
        <button type="button" id="delete" class="todo-btn delete">X</button>
        <input name="deleteCheck" type="checkbox" class="delete-checkbox" >
        </li>`;
    });

    todos.innerHTML = todoDOM.join().replaceAll(',', '');
};

//delete list 그려주는 함수
const paintDeletedTodo = (todo: Todo[]) => {
    const todoDOM = todo.map((todo: Todo) => {
        return `
        <span class="todo-desc">${todo.content}</span>
        `;
    });
    deletedTodos.innerHTML = todoDOM.join().replaceAll(',', '');
};

//save to localStorage - Todo List
const addTodoStorage = (todoList: Todo[]) => {
    localStorage.setItem('todo-list', JSON.stringify(todoList));
};

//save to localStorage - delete List
const addDeleteStorage = (deleteList: Todo[]) => {
    localStorage.setItem('delete-list', JSON.stringify(deleteList));
};

//로컬스토리지 get
const getLocalStorage = () => {
    const getTodo = localStorage.getItem('todo-list') as string;
    const getDeletedTodo = localStorage.getItem('delete-list') as string;

    if (getTodo !== null) {
        const todo = JSON.parse(getTodo) as Todo[];
        todoList.push(...todo);
        paintTodo(todoList);
    }
    if (getDeletedTodo !== null) {
        const deletedTodo = JSON.parse(getDeletedTodo) as Todo[];
        deleteList.push(...deletedTodo);
        paintDeletedTodo(deleteList);
    }
};

//완료된 할 일 체크박스 토글 함수
const toggleCheckBox = (id: number) => {
    todoList.forEach((todo: Todo) => {
        if (todo.id === id) {
            todo.isCompleted = !todo.isCompleted;
        }
    });
    addTodoStorage(todoList);
};

//선택한 할 일 체크박스 토클
const toggleDeleteCheckbox = () => {
    const selected = document.querySelectorAll(
        'input[name="deleteCheck"]:checked'
    );
    selected.forEach((v) => {
        const li = v.parentNode as HTMLLIElement;
        checkIdList.add(Number(li.id));
    });
};

//수정 핸들러
const editTodo = () => {
    const input = document.querySelectorAll<HTMLInputElement>('.todo-desc');
    const editBtn = document.querySelectorAll<HTMLButtonElement>('#edit');
    const editColor = document.querySelectorAll<HTMLInputElement>('#color');

    editBtn.forEach((button: Element, i: number) => {
        button.addEventListener('click', () => {
            if (editBtn[i].textContent === 'EDIT') {
                activeEdit(i, input, editBtn, editColor);
            } else if (editBtn[i].textContent === 'SAVE') {
                saveEdit(i, input, editBtn, editColor);
            }
        });
        input[i].addEventListener('blur', () => {
            input[i].focus();
        });
    });
};

//수정 활성화
const activeEdit = (
    i: number,
    input: NodeListOf<HTMLInputElement>,
    editBtn: NodeListOf<HTMLButtonElement>,
    editColor: NodeListOf<HTMLInputElement>
) => {
    editBtn[i].textContent = 'SAVE';
    input[i].disabled = false;
    input[i].focus();
    editColor[i].style.display = 'block';
    editColor[i].value = todoList[i].color;
};

//수정 저장
const saveEdit = (
    i: number,
    input: NodeListOf<HTMLInputElement>,
    editBtn: NodeListOf<HTMLButtonElement>,
    editColor: NodeListOf<HTMLInputElement>
) => {
    editBtn[i].textContent = 'EDIT';
    input[i].disabled = true;
    editColor[i].style.display = 'none';
    todoList[i].color = editColor[i].value;
    if (todoList[i].content !== input[i].value) {
        todoList[i].editDate = currDate;
        todoList[i].content = input[i].value;
    }
    if (input[i].value === '' || input[i].value.length >= 20) {
        alert('1~20자 이내의 할 일을 입력해 주세요.');
        todoInput?.focus();
        return;
    }
    addTodoStorage(todoList);
    location.reload();
};

//단건 삭제
const deleteBtnTodo = (id: number) => {
    const removeTodo = todoList.filter((todo) => {
        return todo.id !== id;
    });

    todoList.filter((todo) => {
        if (todo.id === id) {
            deleteList.push(todo);
        }
    });

    todoList = removeTodo;
    deleteTodo();
};

//선택한, 완료된 투두 삭제
const deleteSelectedTodo = (ids: Set<number>) => {
    const removeTodo = todoList.filter((todo) => {
        let isTodo = true;
        ids.forEach((id) => {
            if (todo.id === id) {
                isTodo = false;
            }
        });
        return isTodo;
    });

    todoList.filter((todo) => {
        ids.forEach((id) => {
            if (todo.id === id) {
                deleteList.push(todo);
            }
        });
    });

    todoList = removeTodo;
    deleteTodo();
};

//삭제 공통 함수
const deleteTodo = () => {
    addTodoStorage(todoList);
    addDeleteStorage(deleteList);
    alert('삭제되었습니다.');
    location.reload();
};

todos.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLInputElement;
    const button = e.target as HTMLButtonElement;
    const li = button.parentNode as HTMLLIElement;

    // 완료된 할 일 체크박스 토글 함수
    if (target.classList.contains('todo-check')) {
        toggleCheckBox(Number(target.id));
        location.reload();
    }

    //선택한 할일 삭제 함수 실행
    if (target.classList.contains('delete-checkbox')) {
        toggleDeleteCheckbox();
    }

    //단건 삭제 함수 실행
    if (button.classList.contains('delete')) {
        deleteBtnTodo(Number(li.id));
    }

    //수정 함수 실행
    if (button.classList.contains('edit')) {
        editTodo();
    }
});

//완료된 할 일 선택 버튼 클릭시 실행
completedDeleteBtn?.addEventListener('click', () => {
    if (completedIdList.size > 0) {
        deleteSelectedTodo(completedIdList);
    } else {
        alert('완료된 항목이 없습니다.');
    }
});

//선택한 할 일 선택 버튼 클릭시 실행
checkDeleteBtn?.addEventListener('click', () => {
    if (checkIdList.size > 0) {
        deleteSelectedTodo(checkIdList);
    } else {
        alert('삭제할 항목을 선택해 주세요.');
    }
});

window.onload = () => {
    loadTodo();
};
