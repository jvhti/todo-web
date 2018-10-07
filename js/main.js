requirejs(["collapsible", "todo"], function(collapsible, todo) {
	let addBtn = document.getElementById("add-todo");
	let todoList = document.getElementsByClassName("todoBody")[0];
	let archiveList = document.getElementsByClassName("archiveBody")[0];
	let todoTemplate = document.getElementById("todoTemplate");
	let archiveTemplate = document.getElementById("archiveTemplate");

	todo(addBtn, todoList, archiveList, todoTemplate, archiveTemplate);

	collapsible();

});