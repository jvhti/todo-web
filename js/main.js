/** Entry point for RequireJS. Selects needed elements and start the ToDo and Collapsible Modules. */
requirejs(["collapsible", "todo"], function(collapsible, todo) {
	let addBtn = document.getElementById("add-todo");
	let todoList = document.getElementsByClassName("list-table__body--todo")[0];
	let archiveList = document.getElementsByClassName("list-table__body--archive")[0];
	let todoTemplate = document.getElementById("todoTemplate");
	let archiveTemplate = document.getElementById("archiveTemplate");
	let totalArchive = document.getElementById("totalArchive");
	let totalTodo = document.getElementById("totalTodo");

	todo(addBtn, todoList, archiveList, todoTemplate, archiveTemplate, totalTodo, totalArchive);

	let col = collapsible("button--collapsible-controller", "list-table__body--collapsed");
	col.startup();
});
