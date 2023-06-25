<template>
  <Loading v-if="isLoading" />
  <div v-else class="container-md shadow rounded all">
    <header class="header">
      <div class="row d-flex align-items-center justify-content-between">
        <div class="col-md-8">
          <h2 class="title">H E L L O ! K U K U</h2>
        </div>
        <div class="col-md-4">
          <h1 class="subtitle">
            <p>{{ today }}</p>
            <p>Today I need to do something ʕ̯•͡ˑ͓•̯᷅ʔ</p>
          </h1>
        </div>
      </div>
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
        任務進度 {{ completedTodosLength }}/{{ todos.length }}
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
    <div v-if="!todos.length" class="d-flex justify-content-center my-5">
      <font-awesome-icon icon="fa-solid fa-gears" class="fa-xl" />
      <h3 class="fs-6 ms-2">寫下你的目標，完成後吃掉一顆冰塊作為獎勵。</h3>
    </div>
    <div v-else class="card my-5 todo_list">
      <ul class="d-flex text-center p-0 tab">
        <li
          v-for="(item, index) in btnList"
          :key="`${index}-${item.id}`"
          class="p-3 w-100"
          :class="{ active: visibility === item.value }"
          @click="visibility = item.value"
        >
          {{ item.text }}
          <span v-if="item.id === 1" class="badge rounded-pill ms-5 badge_bg">{{
            todos.length
          }}</span>
          <span v-else-if="item.id === 2" class="badge rounded-pill ms-5 badge_bg">{{
            pendingTodosLength
          }}</span>
          <span v-else-if="item.id === 3" class="badge rounded-pill ms-5 badge_bg">{{
            completedTodosLength
          }}</span>
        </li>
      </ul>
      <div class="p-3 list_content">
        <ul class="p-0 list">
          <li v-for="item in filteredTodos" :key="item.id" class="p-1 w-100">
            <div class="row d-flex align-items-center justify-content-between">
              <div class="col-md-10 checkbox">
                <input
                  type="checkbox"
                  class="me-2"
                  :id="item.id"
                  v-model="item.completed"
                  @click="changeCompleted(item.id)"
                />
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
                <font-awesome-icon
                  v-if="!item.editing"
                  icon="fa-solid fa-pen"
                  class="p-2 edit"
                  @click="item.editing = !item.editing"
                />
                <font-awesome-icon
                  icon="fa-solid fa-trash"
                  class="ms-2 p-2 delete"
                  @click="removeItem(item.id)"
                />
              </div>
            </div>
          </li>
        </ul>
        <hr />
        <div class="d-flex align-items-center justify-content-between list_footer">
          <p>{{ pendingTodosLength }} 個待完成項目</p>
          <a href="javascript:void(0);" @click="deleteAllTodoItem">清除所有項目</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import XEUtils from 'xe-utils'
import Swal from 'sweetalert2'
import sweetAlert from '@/mixin/sweetAlert'
import Loading from '@/components/loadingStyle.vue'

const isLoading = ref(false)
const today = ref('')
const newTodo = ref('')
const todos = ref([])
const visibility = ref('all')
const btnList = ref([
  { id: 1, text: '全部', value: 'all' },
  { id: 2, text: '待完成', value: 'pending' },
  { id: 3, text: '已完成', value: 'completed' }
])
const cacheTodo = reactive({})
const cacheTitle = ref('')

const filteredTodos = computed(() => {
  switch (visibility.value) {
    case 'all':
      return todos.value
    case 'pending':
      return todos.value.filter((item) => !item.completed)
    case 'completed':
      return todos.value.filter((item) => item.completed)
    default:
      return todos.value
  }
})

const pendingTodosLength = computed(() => {
  return todos.value.filter((item) => !item.completed).length
})
const completedTodosLength = computed(() => {
  return todos.value.filter((item) => item.completed).length
})

const process = computed(() => {
  if (todos.value.length <= 0) {
    return 0
  }

  return XEUtils.round((completedTodosLength.value / todos.value.length) * 100, 2) + '%'
})

function getToday() {
  today.value = XEUtils.toDateString(new Date(), 'yyyy/M/d')
  isLoading.value = false
}

function addTodoItem() {
  if (newTodo.value === '') {
    sweetAlert.typicalType('提示', '請輸入文字', 'warning', true)

    return
  }
  todos.value.push({
    id: `NO${XEUtils.timestamp(new Date())}`,
    text: newTodo.value,
    completed: false,
    editing: false
  })
  newTodo.value = ''
  updateStorage()
}

function getIndex(id) {
  return todos.value.findIndex((list) => list.id === id)
}

function changeCompleted(id) {
  const index = getIndex(id)
  todos.value[index].completed = !todos.value[index].completed
}

function editTodo(item) {
  cacheTitle.value = item.text
  Object.assign(cacheTodo, { ...item })
  item.editing = false
}

function removeItem(id) {
  sweetAlert.twoLayerCheckType().then((result) => {
    if (result.isConfirmed) {
      Swal.fire('Deleted!', 'Your file has been deleted.', 'success', false)
      const index = getIndex(id)
      todos.value.splice(index, 1)
      updateStorage()
    } else if (result.isDenied) {
      console.log('取消')
    }
  })
}
function deleteAllTodoItem() {
  if (!todos.value.length) {
    return sweetAlert.typicalType('注意', '目前無任務可以刪除', 'error', `Continue → `)
  }
  sweetAlert.twoLayerCheckType().then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('todoList')
      todos.value = []
      sweetAlert.typicalType('完成', '已完成刪除動作', 'success', false)
    } else if (result.isDenied) {
      console.log('取消')
    }
  })
}

function updateStorage() {
  localStorage.setItem('todoList', JSON.stringify(todos.value))
}

onMounted(() => {
  isLoading.value = true
  getToday()
  if (localStorage.getItem('todoList') != null) {
    todos.value = JSON.parse(localStorage.getItem('todoList'))
  }
})
</script>
