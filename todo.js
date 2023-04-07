"use strict";
//form
const todoForm = document.querySelector('.todo-form');
//form input text
const todoInput = document.querySelector('#todoInput');
//form input color
const inputColor = document.querySelector('#inputColor');
//할 일
const todos = document.querySelector('.todos');
//삭제된 할 일
const deletedTodos = document.querySelector('.deleted-todos');
//완료된 할 일 삭제 버튼
const completedDeleteBtn = document.querySelector('.completed-btn');
//선택한 할 일 삭제 버튼
const selectDeleteBtn = document.querySelector('.select-delete-btn');
//할 일 리스트
let todoList = [];
//삭제된 할 일 리스트
const deleteList = [];
//완료된 할 일 리스트
const completedIdList = new Set();
//선택한 할 일 리스트
const selectIdList = new Set();
//date
const date = new Date();
const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
const currDate = dateString
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19);
//save버튼 클릭시 일어나는 함수
todoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo();
});
//inputColor 클릭이벤트 발생했는지 확인
let isClickColorInput = false;
inputColor?.addEventListener('click', (e) => {
    if (e) {
        isClickColorInput = true;
        return;
    }
});
//todo 저장 함수
const addTodo = () => {
    if (!todoInput || !inputColor) {
        return;
    }
    const randomColor = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase();
    const colorValue = isClickColorInput
        ? inputColor.value
        : `#${randomColor}`;
    const todo = {
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
const paintTodo = (todoList) => {
    //todo isComplete true/false 분리
    const sortedList = todoList.sort((a, b) => a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1);
    const todoDOM = paintDom(sortedList);
    todos.innerHTML = todoDOM.join().replaceAll(',', '');
};
const paintDom = (list) => {
    const todoDOM = list.map((todo) => {
        //완료 상태 확인
        const completed = todo.isCompleted ? 'checked' : null;
        //완료된 항목 배열에 아이디 저장
        if (todo.isCompleted) {
            completedIdList.add(todo.id);
        }
        else {
            completedIdList.delete(todo.id);
        }
        return `
        <li class="todo-wrap" id=${todo.id}>
        <input name="completeCheck" type="checkbox" id=${todo.id} class="todo-check" ${completed}>
        <input id="todoDesc" class="todo-desc ${todo.isCompleted ? 'checked' : ''}" style="color: ${todo.color}" disabled value="${todo.content}">
        <span class="todo-date">${todo.date}</span>
        <span class="todo-date" id="editDate">${todo.editDate ?? ''}</span>
        <input type="color" name="color" id="color" class="edit-color" value="${todo.color}">
        <button type="button" id="edit" class="todo-btn edit" >EDIT</button>
        <button type="button" id="delete" class="todo-btn delete">X</button>
        <input name="deleteCheck" type="checkbox" class="delete-checkbox" >
        </li>`;
    });
    return todoDOM;
};
//paint delete list
const paintDeletedTodo = (todo) => {
    const todoDOM = todo.map((todo) => {
        return `
        <span class="todo-desc">${todo.content}</span>
        `;
    });
    deletedTodos.innerHTML = todoDOM.join().replaceAll(',', '');
};
//save to localStorage - Todo List
const addTodoStorage = (todoList) => {
    localStorage.setItem('todo-list', JSON.stringify(todoList));
};
//save to localStorage - delete List
const addDeleteStorage = (deleteList) => {
    localStorage.setItem('delete-list', JSON.stringify(deleteList));
};
//local storage에 todo있을 시 로드되는 todo
const loadTodo = () => {
    getLocalStorage();
};
//로컬스토리지 get
const getStorage = (key) => {
    return localStorage.getItem(key);
};
const getLocalStorage = () => {
    if (getStorage('todo-list') !== null) {
        const todo = JSON.parse(getStorage('todo-list'));
        todoList.push(...todo);
        paintTodo(todoList);
    }
    if (getStorage('delete-list') !== null) {
        const deletedTodo = JSON.parse(getStorage('delete-list'));
        deleteList.push(...deletedTodo);
        paintDeletedTodo(deleteList);
    }
};
//완료된 할 일 체크박스 토글 함수
const toggleCheckBox = (id) => {
    const input = document.querySelectorAll('.todo-desc');
    todoList.forEach((todo, i) => {
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
const toggleDeleteCheckbox = () => {
    const selected = document.querySelectorAll('input[name="deleteCheck"]:checked');
    selected.forEach((v) => {
        const li = v.parentNode;
        selectIdList.add(Number(li.id));
    });
};
//수정 핸들러
const editTodo = (id) => {
    const input = document.querySelectorAll('.todo-desc');
    const editBtn = document.querySelectorAll('#edit');
    const editColor = document.querySelectorAll('#color');
    const editDate = document.querySelectorAll('#editDate');
    const todoCompleted = document.querySelectorAll('.todo-check');
    todoList.forEach((todo, i) => {
        if (todo.id === id) {
            if (editBtn[i].textContent === 'EDIT') {
                activeEdit(i, input, editBtn, editColor, todoCompleted);
            }
            else {
                saveEdit(i, input, editBtn, editColor, editDate);
            }
        }
        input[i].addEventListener('blur', () => {
            input[i].focus();
        });
    });
};
//수정 활성화
const activeEdit = (i, input, editBtn, editColor, todoCompleted) => {
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
const saveEdit = (i, input, editBtn, editColor, editDate) => {
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
const deleteBtnTodo = (id) => {
    const removeTodo = todoList.filter((todo) => {
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
const deleteSelectedTodo = (ids) => {
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
    deleteTodo(todoList, deleteList);
};
//삭제 공통 함수
const deleteTodo = (todoList, deleteList) => {
    addTodoStorage(todoList);
    addDeleteStorage(deleteList);
    alert('삭제되었습니다.');
    paintTodo(todoList);
    paintDeletedTodo(deleteList);
};
todos.addEventListener('click', (e) => {
    const target = e.target;
    const button = e.target;
    const li = button.parentNode;
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
completedDeleteBtn?.addEventListener('click', () => {
    if (completedIdList.size > 0) {
        deleteSelectedTodo(completedIdList);
    }
    else {
        alert('완료된 항목이 없습니다.');
    }
});
//선택한 할 일 삭제 선택 버튼 클릭시 실행
selectDeleteBtn?.addEventListener('click', () => {
    if (selectIdList.size > 0) {
        deleteSelectedTodo(selectIdList);
    }
    else {
        alert('삭제할 항목을 선택해 주세요.');
    }
});
window.onload = () => {
    loadTodo();
};
