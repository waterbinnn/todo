//오늘 날짜
const todayDate = document.querySelector('#date') as HTMLParagraphElement;
//form
const todoForm = document.querySelector<HTMLFormElement>('.todo-form');
//form input text
const todoInput = document.querySelector<HTMLInputElement>('#todoInput');
//form input color
const inputColor = document.querySelector<HTMLInputElement>('#inputColor');
//할 일
const todos = document.querySelector('.todos') as HTMLUListElement;
//삭제된 할 일
const deletedTodos = document.querySelector(
    '.deleted-todos'
) as HTMLUListElement;
//완료된 할 일 삭제 버튼
const completedDeleteBtn =
    document.querySelector<HTMLButtonElement>('.completed-btn');
//선택한 할 일 삭제 버튼
const selectDeleteBtn =
    document.querySelector<HTMLButtonElement>('.select-delete-btn');
//삭제 리스트 전체 삭제 버튼
const deleteListBtn =
    document.querySelector<HTMLButtonElement>('.delete-list-btn');

interface Todo {
    id: number;
    isCompleted: boolean;
    content: string;
    color: string;
    date: string;
    editDate: string;
}

//할 일 리스트
let todoList: Todo[] = [];
//삭제된 할 일 리스트
const deleteList: Todo[] = [];
//완료된 할 일 리스트
const completedIdList: Set<number> = new Set();
//선택한 할 일 리스트
const selectIdList: Set<number> = new Set();

//date
const date: Date = new Date();
const dateString: Date = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
);
const currDate: string = dateString
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19);

//save버튼 클릭시 일어나는 함수
todoForm?.addEventListener('submit', (e: SubmitEvent): void => {
    e.preventDefault();
    addTodo();
});

//inputColor 클릭이벤트 발생했는지 확인
let isClickColorInput = false;

inputColor?.addEventListener('click', (e: MouseEvent): void => {
    if (e) {
        isClickColorInput = true;
        return;
    }
});

//todo 저장 함수
const addTodo = (): void => {
    if (!todoInput || !inputColor) {
        return;
    }

    const randomColor: string = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase();

    const colorValue: string = isClickColorInput
        ? inputColor.value
        : `#${randomColor}`;

    const todo: Todo = {
        id: Number(new Date().getTime()),
        isCompleted: false,
        content: todoInput.value,
        color: colorValue,
        date: currDate,
        editDate: '',
    };

    if (todoInput.value === '' || todoInput.value.length >= 20) {
        alert('1~20자 이내의 할 일을 입력해 주세요.');
        todoInput.focus();
        return;
    }

    todoList.push(todo);
    todoInput.value = '';

    addTodoStorage(todoList);
    paintTodo(todoList);
};

//paint todo list
const paintTodo = (todoList: Todo[]): void => {
    //todo isComplete true/false 분리
    const sortedList: Todo[] = todoList.sort((a: Todo, b: Todo) =>
        a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1
    );
    const todoDOM: string[] = paintDom(sortedList);

    todos.innerHTML = todoDOM.join().replaceAll(',', '');
};

const paintDom = (list: Todo[]): string[] => {
    const todoDOM: string[] = list.map((todo: Todo) => {
        //완료 상태 확인
        const completed = todo.isCompleted ? 'checked' : null;

        //완료된 항목 배열에 아이디 저장
        if (todo.isCompleted) {
            completedIdList.add(todo.id);
        } else {
            completedIdList.delete(todo.id);
        }

        return `
        <li class="todo-wrap" id=${todo.id}>
        <input name="completeCheck" type="checkbox" id=${
            todo.id
        } class="todo-check" ${completed}>
        <input id="todoDesc" class="todo-desc ${
            todo.isCompleted ? 'checked' : ''
        }" style="color: ${todo.color}" disabled value="${todo.content}">
        <span class="todo-date">${todo.date}</span>
        <span class="todo-date" id="editDate">${todo.editDate ?? ''}</span>
        <input type="color" name="color" id="color" class="edit-color" value="${
            todo.color
        }">
        <button type="button" id="edit" class="todo-btn edit" >EDIT</button>
        <button type="button" id="delete" class="todo-btn delete">X</button>
        <input name="deleteCheck" type="checkbox" class="delete-checkbox" >
        </li>`;
    });
    return todoDOM;
};

//paint delete list
const paintDeletedTodo = (todo: Todo[]): void => {
    const todoDOM: string[] = todo.map((todo: Todo) => {
        return `
        <span class="todo-desc">${todo.content}</span>
        `;
    });

    deletedTodos.innerHTML = todoDOM.join().replaceAll(',', '');
};

//save to localStorage - Todo List
const addTodoStorage = (todoList: Todo[]): void => {
    localStorage.setItem('todo-list', JSON.stringify(todoList));
};

//save to localStorage - delete List
const addDeleteStorage = (deleteList: Todo[]): void => {
    localStorage.setItem('delete-list', JSON.stringify(deleteList));
};

//local storage에 todo있을 시 로드되는 todo
const loadTodo = (): void => {
    getLocalStorage();
};

//로컬스토리지 get
const getStorage = (key: string): string => {
    return localStorage.getItem(key) as string;
};
const getLocalStorage = (): void => {
    if (getStorage('todo-list') !== null) {
        const todo = JSON.parse(getStorage('todo-list')) as Todo[];
        todoList.push(...todo);
        paintTodo(todoList);
    }
    if (getStorage('delete-list') !== null) {
        const deletedTodo = JSON.parse(getStorage('delete-list')) as Todo[];
        deleteList.push(...deletedTodo);
        paintDeletedTodo(deleteList);
    }
};

//완료된 할 일 체크박스 토글 함수
const toggleCheckBox = (id: number): void => {
    const input: NodeListOf<HTMLInputElement> =
        document.querySelectorAll('.todo-desc');

    todoList.forEach((todo: Todo, i: number) => {
        if (todo.id === id) {
            todo.isCompleted = !todo.isCompleted;
            input[i].classList.toggle('checked');
            completedIdList.add(todo.id);
        }
    });
    paintTodo(todoList);
    addTodoStorage(todoList);
};

//선택한 할 일 체크박스 토클
const toggleDeleteCheckbox = (): void => {
    const selected: NodeListOf<HTMLInputElement> = document.querySelectorAll(
        'input[name="deleteCheck"]:checked'
    );
    selected.forEach((v) => {
        const li = v.parentNode as HTMLLIElement;
        selectIdList.add(Number(li.id));
    });
};

//수정 핸들러
const editTodo = (id: number): void => {
    const input = document.querySelectorAll<HTMLInputElement>('.todo-desc');
    const editBtn = document.querySelectorAll<HTMLButtonElement>('#edit');
    const editColor = document.querySelectorAll<HTMLInputElement>('#color');
    const editDate = document.querySelectorAll<HTMLSpanElement>('#editDate');
    const todoCompleted =
        document.querySelectorAll<HTMLInputElement>('.todo-check');

    todoList.forEach((todo: Todo, i: number) => {
        if (todo.id === id) {
            if (editBtn[i].textContent === 'EDIT') {
                activeEdit(i, input, editBtn, editColor, todoCompleted);
            } else {
                saveEdit(i, input, editBtn, editColor, editDate);
            }
        }
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
    editColor: NodeListOf<HTMLInputElement>,
    todoCompleted?: NodeListOf<HTMLInputElement>
): void => {
    editBtn[i].textContent = 'SAVE';
    input[i].disabled = false;
    input[i].classList.remove('checked');
    input[i].focus();
    input[i].value = todoList[i].content;
    editColor[i].style.display = 'block';
    editColor[i].value = todoList[i].color;
    todoList[i].isCompleted = false;

    if (todoCompleted) {
        todoCompleted[i].checked = false;
        return;
    }
};

//수정 저장
const saveEdit = (
    i: number,
    input: NodeListOf<HTMLInputElement>,
    editBtn: NodeListOf<HTMLButtonElement>,
    editColor: NodeListOf<HTMLInputElement>,
    editDate: NodeListOf<HTMLSpanElement>
): void => {
    editBtn[i].textContent = 'EDIT';
    input[i].disabled = true;
    editColor[i].style.display = 'none';
    todoList[i].color = editColor[i].value;
    input[i].style.color = editColor[i].value;

    if (todoList[i].content !== input[i].value) {
        editDate[i].textContent = currDate;
        todoList[i].editDate = currDate;
        todoList[i].content = input[i].value;
    }

    if (input[i].value === '' || input[i].value.length >= 20) {
        alert('1~20자 이내의 할 일을 입력해 주세요.');
        activeEdit(i, input, editBtn, editColor);
    }

    addTodoStorage(todoList);
};

//단건 삭제
const deleteBtnTodo = (id: number): void => {
    const removeTodo: Todo[] = todoList.filter((todo) => {
        return todo.id !== id;
    });

    todoList.filter((todo) => {
        if (todo.id === id) {
            deleteList.push(todo);
        }
    });

    todoList = removeTodo;
    deleteTodo(todoList, deleteList);
};

//선택한, 완료된 투두 삭제
const deleteSelectedTodo = (ids: Set<number>): void => {
    const removeTodo: Todo[] = todoList.filter((todo) => {
        let isTodo = true;
        ids.forEach((id: number) => {
            if (todo.id === id) {
                isTodo = false;
            }
        });
        return isTodo;
    });

    todoList.filter((todo: Todo) => {
        ids.forEach((id: number) => {
            if (todo.id === id) {
                deleteList.push(todo);
            }
        });
    });

    todoList = removeTodo;
    deleteTodo(todoList, deleteList);
};

//삭제 공통 함수
const deleteTodo = (todoList: Todo[], deleteList: Todo[]): void => {
    addTodoStorage(todoList);
    addDeleteStorage(deleteList);
    alert('삭제되었습니다.');
    paintTodo(todoList);
    paintDeletedTodo(deleteList);
};

todos.addEventListener('click', (e: Event): void => {
    const target = e.target as HTMLInputElement;
    const button = e.target as HTMLButtonElement;
    const li = button.parentNode as HTMLLIElement;

    // 완료된 할 일 체크박스 토글 함수
    if (target.classList.contains('todo-check')) {
        toggleCheckBox(Number(target.id));
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
        editTodo(Number(li.id));
    }
});

//완료된 할 일 삭제 선택 버튼 클릭시 실행
completedDeleteBtn?.addEventListener('click', (): void => {
    if (completedIdList.size > 0) {
        deleteSelectedTodo(completedIdList);
    } else {
        alert('완료된 항목이 없습니다.');
    }
});

//선택한 할 일 삭제 선택 버튼 클릭시 실행
selectDeleteBtn?.addEventListener('click', (): void => {
    if (selectIdList.size > 0) {
        deleteSelectedTodo(selectIdList);
    } else {
        alert('삭제할 항목을 선택해 주세요.');
    }
});

//삭제한 할 일 전체삭제 버튼 클릭시 실행
deleteListBtn?.addEventListener('click', (): void => {
    if (deleteList.length > 0) {
        alert('삭제되었습니다.');
        localStorage.removeItem('delete-list');
        const deleteList: Todo[] = [];
        paintDeletedTodo(deleteList);
    } else {
        alert('삭제할 할 일이 없습니다.');
    }
});

window.onload = () => {
    loadTodo();
    todayDate.innerHTML = `${date.toLocaleDateString('ko-KR').slice(0, -1)}`;
};
