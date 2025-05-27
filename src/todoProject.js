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
		const id = crypto.randomUUID();
		projects[id] = data;
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


	PubSub.subscribe("newTodo.formSubmission", addTodo);

	return {
		projects,
		addTodo,
	}
})();

export { ToDo, Project, todoProject };