requirejs(["collapsible", "todo"], function(collapsible, todo) {
	let addBtn = document.getElementById("add-todo");
	let todoList = document.getElementsByClassName("todoBody")[0];
	let archiveList = document.getElementsByClassName("archiveBody")[0];
	let todoTemplate = document.getElementById("todoTemplate");
	let archiveTemplate = document.getElementById("archiveTemplate");
	let totalArchive = document.getElementById("totalArchive");
	let totalTodo = document.getElementById("totalTodo");

	todo(addBtn, todoList, archiveList, todoTemplate, archiveTemplate, totalTodo, totalArchive);

	collapsible();

});