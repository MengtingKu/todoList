<template>
  <div class="container shadow rounded all">
    <header class="d-flex align-items-center justify-content-between my-3 header">
      <h2 class="title">H E L L O ! K U K U</h2>
      <h1 class="subtitle">
        <p>{{ today }}</p>
        <p>Today I need to do something ʕ̯•͡ˑ͓•̯᷅ʔ</p>
      </h1>
    </header>
    <div class="input-group my-5 enter_text">
      <input
        v-model.trim="newTodo"
        type="text"
        class="form-control border border-0 border-bottom p-3 fs-5"
        id="inputText"
        placeholder="請輸入待辦事項"
      />
      <a
        href="javascript:void(0);"
        class="btn btn-outline-secondary border border-0 btn_add"
        type="button"
        id="addBTN"
        @click="addTodoItem"
        >+</a
      >
    </div>
    <section class="process">
      <h3 class="fw-bolder font-monospace text-center fs-5">
        任務進度 {{ todoList.completed.length }}/{{ todoLists.length }}
      </h3>
      <div
        class="progress"
        role="progressbar"
        aria-label="Example with label"
        aria-valuenow="25"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="progress-bar bar_box" :style="{ width: process }">{{ process }}</div>
      </div>
    </section>
    <div v-if="!todoLists.length" class="d-flex justify-content-center my-5">
      <font-awesome-icon icon="fa-solid fa-gears" class="fa-xl" />
      <h3 class="fs-6 ms-2">寫下你的目標，然後吃掉一個冰塊作為獎勵。</h3>
    </div>
    <div v-else class="card my-5 todo_list">
      <ul class="d-flex text-center p-0 tab">
        <li
          v-for="btn in btnList"
          :key="btn.id"
          class="p-3 w-100"
          :class="{ active: btn.completed === true }"
          @click="changeStatus(btn)"
        >
          {{ btn.text }}
          <span v-if="btn.id === 1" class="badge rounded-pill ms-5 badge_bg">{{
            todoList.all.length
          }}</span>
          <span v-else-if="btn.id === 2" class="badge rounded-pill ms-5 badge_bg">{{
            todoList.pending.length
          }}</span>
          <span v-else-if="btn.id === 3" class="badge rounded-pill ms-5 badge_bg">{{
            todoList.completed.length
          }}</span>
        </li>
      </ul>
      <div class="p-3 list_content">
        <ul class="p-0 list">
          <li
            v-for="item in filteredTodos"
            :key="item.id"
            class="p-1 w-100"
          >
            <div class="row d-flex align-items-center justify-content-between">
              <div class="col-md-10 checkbox">
                <input type="checkbox" class="me-2" :id="item.id" v-model="item.completed" />
                <input
                  v-if="item.editing"
                  type="text"
                  class="edit_input"
                  :id="item.id"
                  v-model="item.text"
                  @keyup.enter="editTodo(item)"
                />
                <span
                  v-else
                  :class="{ completed: item.completed }"
                  class="ms-5 list_text"
                  @click="item.completed = !item.completed"
                  >{{ item.text }}</span
                >
              </div>
              <div class="col-md-2 d-flex align-items-center justify-content-end">
                <font-awesome-icon icon="fa-solid fa-pen" class="p-2 edit" @click="item.editing = !item.editing" v-if="!item.editing"/>
                <font-awesome-icon icon="fa-solid fa-trash" class="ms-2 p-2 delete" @click="removeItem(item.id)"
              />
              </div>
            </div>
          </li>
        </ul>
        <hr />
        <div class="d-flex align-items-center justify-content-between list_footer">
          <p class="">{{ todoList.pending.length }} 個待完成項目</p>
          <a href="javascript:void(0);" @click="deleteAllTodoItem">清除已完成項目</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, ref, reactive } from 'vue'

const day = new Date()
const today = ref('')
const newTodo = ref('')
const todoLists = ref([])
const todoList = reactive({
  all: [],
  pending: [],
  completed: []
})
const clickedBtnId = ref('1')
const btnList = ref([
  { id: 1, text: '全部', completed: false },
  { id: 2, text: '待完成', completed: false },
  { id: 3, text: '已完成', completed: false }
])
const cacheTodo = ref({})
const cacheTitle = ref('')

const filteredTodos = computed(() => {
  switch (clickedBtnId.value) {
    case 1:
      return todoList.all
    case 2:
      return todoList.pending
    case 3:
      return todoList.completed
    default:
      return []
  }
})

const process = computed(() => {
  if (todoLists.value.length <= 0) {
    return 0
  }
  return Math.floor((todoList.completed.length / todoLists.value.length) * 100) + '%'
})

watch(
  todoList,
  () => {
    updateStorage()
  },
  { deep: true }
)

function getToday() {
  today.value = `${day.toLocaleDateString()} ${day.toLocaleString(navigator.language, {
    weekday: 'long'
  })}`
}

function changeStatus(btn) {
  btnList.value.forEach((tab) => {
    tab.completed = false
  })
  btn.completed = true
  clickedBtnId.value = btn.id
  switch (btn.id) {
    case 1:
      todoList.all = todoLists.value
      break
    case 2:
      todoList.pending = todoLists.value.filter((item) => !item.completed)
      break
    case 3:
      todoList.completed = todoLists.value.filter((item) => item.completed)
      break
    default:
      break
  }
  console.log('todoList', todoList)
}

function addTodoItem() {
  if (newTodo.value === '') {
    alert(`請輸入文字`)
    return
  }
  todoLists.value.push({
    id: `NO${new Date().getTime()}`,
    text: newTodo.value,
    completed: false,
    editing: false
  })
  newTodo.value = ''
  updateStorage()
}

function editTodo(item) {
  console.log('item', item)
  cacheTitle.value = item.text
  cacheTodo.value = item
  item.editing = false
}

function removeItem(id) {
  const index = todoLists.value.findIndex((list) => list.id === id)
  todoLists.value.splice(index, 1)
  updateStorage()
}

function deleteAllTodoItem() {
  if (!todoLists.value.length) {
    return alert(`目前無任務可以刪除`)
  }
  const res = confirm('你確定要刪除全部任務嗎? 刪除了將找不回資料~')
  if (res) {
    localStorage.removeItem('todoList')
    todoLists.value = []
    alert('已完成刪除動作')
  }
}

function updateStorage() {
  localStorage.setItem('todoList', JSON.stringify(todoLists.value))
}

onMounted(() => {
  getToday()
  if (localStorage.getItem('todoList') != null) {
    todoLists.value = JSON.parse(localStorage.getItem('todoList'))
  }
})
</script>
