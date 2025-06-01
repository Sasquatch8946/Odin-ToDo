const PubSub = require('pubsub-js');

class ToDo {
	constructor(title,
		description,
		dueDate,
		priority,
		checklist,
		notes
	) {
		this.title = title;
		this.description = description;
		this.dueDate = dueDate;
		this.priority = priority;
		this.checklist = checklist;
		this.notes = notes;
		this.id = crypto.randomUUID()
	}

	sayHello() {
		console.log("hello world!");
	}
}

class Project {
	constructor(
		projectName,
	) {
		this.name = projectName;
		this.todos = [];
		this.id = crypto.randomUUID();
	}
}

const todoProject = (function() {

	let projects = {};

	const addProject = (_msg, data) => {
		projects[data.id] = data;
		console.log(projects);
	}

	let myToDo = new ToDo("Clean the floors",
		"Sweep and wetjet the floors in the kitchen, living room, and entryway.",
		"5-15-2025",
		"high",
		"move the furniture, sweep, wetjet",
		"be thorough");


	
	if (!localStorage) {


		const today = new Project("Today");

		projects[today.id] = today;


		projects[today.id].todos.push(myToDo);

		const projectsJSON = JSON.stringify(projects);

		localStorage.setItem("projects", projectsJSON);

	} else {
		projects = JSON.parse(localStorage.getItem("projects"));
	}


	
	PubSub.subscribe("newProject", addProject);


	const addTodo = (_msg, pubData) => {
		const projectId = pubData.project;
		const todo = newTodoFromForm(pubData.formData);
		todoProject.projects[projectId].todos.push(todo);	
		PubSub.publish("newTodo.addCard", todo);
		PubSub.publish("persistTodo", {projectId, todo})
	}

	const getProjectsFromStorage = () => {
		return JSON.parse(localStorage.getItem("projects"));
	}

	const persistTodo = (_msg, pubData) => {
		const projects = getProjectsFromStorage();
		projects[pubData.projectId].todos.push(pubData.todo);
		commitProjectsToStorage(projects);
	}

	const newTodoFromForm = (formData) => {
		return new ToDo(
			formData.title,
			formData.description,
			formData.dueDate,
			formData.priority,
			formData.checklist,
			formData.notes
		)

	}

	const commitProjectsToStorage = (projects) => {
		localStorage.setItem("projects", JSON.stringify(projects));	
	}

	const editTodo = (_msg, pubData) => {
		const todosArr = todoProject.projects[pubData.projectId].todos;
		const indx = todosArr.findIndex((i) => {
			return i.id === pubData.todoId;
		});
		const todo = editTodoObject(todosArr[indx], pubData.formData);
		PubSub.publish("editCard", todo);
	}

	const editTodoObject = (todo, formData) => {
		for (let field in formData) {
			todo[field] = formData[field];
		}

		return todo;
	}

	const removeTodo = (_msg, pubData) => {
		const projectId = pubData.projectId;
		const todoId = pubData.todoId;
		const newTodoArr = todoProject.projects[projectId].todos.filter((t) => {
			t.id !== todoId;
		});
		todoProject.projects[projectId].todos = newTodoArr;
		console.log(todoProject.projects[projectId]);
	}

	const setProjectName = (_msg, pubData) => {
		projects[pubData.projectId].name = pubData.projectName;
		console.log(projects);
	}

	const createProject = (_msg) => {
		const proj = new Project("New Project");
		projects[proj.id] = proj;
		PubSub.publish("projectCreated", proj);
	}

	const persistProj = (_msg, proj) => {
		const projects = JSON.parse(localStorage.getItem("projects"));
		projects[proj.id] = proj;
		localStorage.setItem("projects", JSON.stringify(projects));
	}


	PubSub.subscribe("newTodo.formSubmission", addTodo);

	PubSub.subscribe("projectNameChange", setProjectName);

	PubSub.subscribe("newProjectButtonClicked", createProject);

	PubSub.subscribe("removeTodo", removeTodo);

	PubSub.subscribe("todoEdit", editTodo);

	PubSub.subscribe("projectCreated", persistProj);

	PubSub.subscribe("persistTodo", persistTodo);

	return {
		projects,
		addTodo,
	}
})();

export { ToDo, Project, todoProject };