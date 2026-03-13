const cards =
document.querySelectorAll(".task-card")

const columns =
document.querySelectorAll(".kanban-tasks")

let draggedCard = null

cards.forEach(card => {

card.addEventListener("dragstart", () => {

draggedCard = card

})

})

columns.forEach(column => {

column.addEventListener("dragover", e => {

e.preventDefault()

})

column.addEventListener("drop", () => {

column.appendChild(draggedCard)

})

})