todo

### 할일 작성

1.  할일 입력 (length 1-20자)
    const todoInput = document.querySelector<HTMLInputElement>('#todoInput');

    -   인풋 value 받아서 1-20자 이내 입력 체크
        색상 선택 (글씨 색상으로 들어가게)
    -   get document.querySelector('#inputColor')
    -   let isClicked = false , 클릭 이벤트 일어났을 경우 true
    -   colorValue 선언, 삼항식으로 `isClicked ? inputColor.value : randomColor`

2.  할일 저장 `addTodo`

    -   save 버튼 클릭시 `todoForm.addEventListener('submit',()=> addTodo())`
    -   입력값 로컬스토리지에 저장 : `localStorage.setItem('todolist', JSON.STRINGIFY(todoList))`

        -   로컬스토리지 저장 함수 빼기
            `addTodoStorage(todoList)`
            저장될 todoList 에 들어갈 항목
            todo: {id, isCompleted, content, color, date, editDate}

        `id`: date함수로 받기

        `isCompleted`:checkbox.checked 로 받기 - 기본값 false

        `content` : const todoInput = document.querySelector('#todoInput');
        todoInput.value 로 value 받기
        조건문으로 1글자 20이상 일 때 alert 후 input.focus()

        `date`: 등록된 시간 저장 (YYYY-MM-dd HH:mm:ss)

        `editDate`: 수정되면 보여질 date, 기본값은 '' 로 담고 수정될 때 담아주기

        저장 하면

        -   todoList 배열에 push 입력한 todo
        -   input value 초기화
        -   addTodoStorage
        -   paintTodo
        -   새로고침
            실행

3.  버튼 클릭 후 로컬스토리지에 저장되면 저장된 값들을 불러오기 위해
    `getLocalStorage`
    로컬스토리지의 todo-list 값이 null이 아닐 경우 조건 달기
    localStorage.getItem('todo-list')
    JSON.Parse 파싱해주고 todoList 에 push,
    이 todoList 를 그려주는 함수 실행 (paintTodo)

4.  paintTodo 함수 작성 - 화면에 그려줄 DOMElement
    템플렛 리터럴로 작성
    로컬스토리지에 저장한 todoList 내의 todo를 배열로 돌려서 화면에 그려주기

    -   isCompleted 체크박스
        기본값은 false , 체크되면 input html에 'checked' 추가 - 로드되면 로컬스토리지에 갖고있는 값의 상태를 보여주기
        paintTodo 에서 map돌리는 각각의 todo에 isCompleted = true일 경우 'checked' 넣는 로직 작성
        `const checked = todo.isCompleted ? 'checked' : null;`

    -   loadTodo 함수 생성
        getLocalStorage() 넣기
        window.onload 일 때 실행

5.  isCompleted 완료된 할 일 체크박스 토글
    체크한 target id , id 값 일치하는지 확인하고 일치하면
    isCompleted = !isCompleted 토글
    체크박스 클릭할 때 마다 로컬스토리지에 있는 값 업데이트 (addTodoStorage)

### 할일 수정

1. 수정 버튼 클릭
2. input 창 활성화 ,focus, color input display
3. 수정 후 save 버튼 클릭하면 포커스 아웃
4. 수정 일시, 수정된 아이템인 것 알 수 있게 표시 (YYYY-MM-dd HH:mm:ss)
5. 리스트에 업데이트

-   editBtn(수정버튼) forEach 로 클릭된 애만 todo 수정되게
-   클릭한 버튼의 textContent 가 EDIT 일 경우 activeEdit()실행
-   activeEdit() :
    -   버튼 textContent SAVE 로 변경
    -   input disabled 상태 false로 변경
    -   input focus
    -   editColor 보이게끔
    -   editColor 기본값 = 기존color 값으로 할당
    -   active 되어 있을 때 input에 blur 이벤트 실행 되어도 input 창이 포커스 되게 유지
-   saveEdit():
    -   SAVE 클릭시 버튼의 textContent 는 다시 EDIT 으로 변경
    -   input disabled = true 로
    -   editColor input display='none'
    -   todo color = editColor[i].value로 업데이트
    -   조건문으로 기존 input 값과 비교하여 다르면 todo editDate, content 업데이트
    -   1-20 자 입력하도록 조건문
    -   수정 후 addTodoStorage
    -   윈도우 리로드

### 할일 삭제

단건, 선택삭제, 완료된 할 일 삭제 공통적으로

-   삭제 후 alert
-   todoList 로컬 스토리지 업데이트
-   deleteList 에 삭제된 todo 저장
-   deleteList 로컬스토리지에 저장
    `addDeleteStorage`
    로컬스토리지에 삭제된 할일 저장
    delete-list 라는 명으로 로컬스토리지에 따로 저장하는 함수 작성
    `getLocalStorage`에서 deletedTodo 있을 경우 그려주는 함수 작성
-   deleteList paint
    `paintDeletedTodo` 함수
    ul(class:deletedTodos)에 paint 해줄 함수
    todo.content만을 받고 paintTodo 처럼 그려주기
    getLocalStorage에서 실행

1. 단 건 삭제

-   삭제버튼 클릭 이벤트
    버튼 클릭 시 버튼 parentNode인 li classList에 delete이 있으면
    deleteBtnTodo() 실행
    함수에 li가 가지고 잇는 id 받아야 하기 때문에 li 를 상수로 가져오기
    const removeTodo = todoList.filter로
    todo.id가 같은 경우 삭제, 다를 경우만 return
    todoList = removeTodo로 업데이트 - 삭제된 리스트에 저장
-   deleteList 변수 생성하고 삭제한 todo 저장.
    todo.id === id일 경우 deleteList에 push
    새 배열 addDeleteStorage 함수로 로컬스토리지에 저장

2. 선택된 항목/완료된 항목 삭제

-   쿼리셀렉터로 버튼 가져오기 (checkDeleteBtn, completedDeleteBtn)
-   체크박스 체크 - 삭제버튼 처럼 todos 리스너 함수에서 li id 받기
-   새배열(checkIdList, deleteLsit) 만들어서 아이디 담기
    filter로 클릭한 아이디와 받은 아이디의 일치여부 확인 ->
    isTodo = true 로 초기화하고
    같으면 isTodo false 로 만들어서 todo가 true인 값만 removeTodo에 저장하여
    todoList에 할당
