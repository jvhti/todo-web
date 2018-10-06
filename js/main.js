requirejs(["collapsible", "todo"], function(collapsible, todo) {
	let addBtn = document.getElementById("add-todo");
	let todoList = document.getElementsByClassName("todoBody")[0];
	let archiveList = document.getElementsByClassName("archiveBody")[0];
	let template = document.getElementById("todoTemplate");

	todo(addBtn, todoList, archiveList, template);

	collapsible();

});