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

	const today = new Project("Today");

	projects[today.id] = today;

	const addProject = (_msg, data) => {
		projects[data.id] = data;
		console.log(projects);
	}

	let myToDo = new ToDo("Clean the floors",
		"Sweep and wetjet the floors in the kitchen, living room, and entryway.",
		"5/15/25",
		"high",
		"move the furniture, sweep, wetjet",
		"be thorough");

	projects[today.id].todos.push(myToDo);

	console.log("PROJECTS");

	console.log(projects);
	
	PubSub.subscribe("newProject", addProject);


	const addTodo = (_msg, pubData) => {
		const projectName = pubData.project;
		const todo = pubData.todo;
		todoProject.projects[projectName].todos.push(todo);	
		PubSub.publish("newTodo.addCard", pubData);
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


	PubSub.subscribe("newTodo.formSubmission", addTodo);

	PubSub.subscribe("projectNameChange", setProjectName);

	PubSub.subscribe("newProjectButtonClicked", createProject);

	PubSub.subscribe("removeTodo", removeTodo);

	return {
		projects,
		addTodo,
	}
})();

export { ToDo, Project, todoProject };