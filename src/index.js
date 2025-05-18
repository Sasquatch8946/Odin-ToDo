import "./styles.css";

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
	}
}

const displayController = (function () {

	const getContainer = () => {
		return document.querySelector(".todos");
	};
	
	const getSidebar = () => {
		return document.querySelector(".sidebar");
	}

	const createProject = (projectName) => {
		const container = getSidebar();
		const project = document.createElement("div");
		const projectTitle = document.createElement("button");
		projectTitle.classList.add("project-title");
		projectTitle.innerText = projectName;
		project.appendChild(projectTitle);
		project.classList.add("project-section");
		projectTitle.dataset.project = projectName;
		container.appendChild(project);
		projectTitle.focus();
	}

	const createTodoCard = (projectName, todo) => {
		const container = getContainer();
		const todoCard = document.createElement("div");
		todoCard.classList.add("todo-card");
		const cardTitle = document.createElement("div");
		cardTitle.innerText = todo.title;
		cardTitle.classList.add("title");
		const cardDescription = document.createElement("div");
		cardDescription.innerText = todo.description;
		const cardDate = document.createElement("div");
		cardDate.innerText = todo.dueDate;
		const cardPriority = document.createElement("div");
		cardPriority.innerText = todo.priority;
		const cardChecklist = document.createElement("div");
		cardChecklist.innerText = todo.checklist;
		const cardNotes = document.createElement("div");
		cardNotes.innerText = todo.notes;
		todoCard.appendChild(cardTitle);
		todoCard.appendChild(cardDescription);
		todoCard.appendChild(cardPriority);
		todoCard.appendChild(cardChecklist);
		todoCard.appendChild(cardNotes);
		container.appendChild(todoCard);
	}

	return {
		createProject,
		createTodoCard,
	}
})();

let projects = {
	Today: []
}

let myToDo = new ToDo("Clean the floors",
	"Sweep and wetjet the floors in the kitchen, living room, and entryway.",
	"5/15/25",
	"high",
	"move the furniture, sweep, wetjet",
	"be thorough");

console.log(myToDo);

console.log(typeof projects.today);

projects.Today.push(myToDo);

for (let project in projects) {
	console.log(projects[project]);
	displayController.createProject(project);
	displayController.createTodoCard(project, projects[project][0]);
}




