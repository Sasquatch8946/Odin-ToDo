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

	const createProject = (projectName) => {
		const container = getContainer();
		const project = document.createElement("div");
		project.innerText = projectName;
		project.classList.add("project-section");
		project.dataset.project = projectName;
		container.appendChild(project);
	}

	const createTodoCard = (projectName, todo) => {
		const container = document.querySelector(`.project-section[data-project=${projectName}`);
		const cardTitle = document.createElement("div");
		cardTitle.innerText = todo.title;
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
		container.appendChild(cardTitle);
		container.appendChild(cardDescription);
		container.appendChild(cardPriority);
		container.appendChild(cardChecklist);
		container.appendChild(cardNotes);
	}

	return {
		createProject,
		createTodoCard,
	}
})();

let projects = {
	today: []
}

let myToDo = new ToDo("Clean the floors",
	"Sweep and wetjet the floors in the kitche, living room, and entryway.",
	"5/15/25",
	"high",
	"move the furniture, sweep, wetjet",
	"be thorough");

console.log(myToDo);

console.log(typeof projects.today);

projects.today.push(myToDo);

for (let project in projects) {
	console.log(projects[project]);
	displayController.createProject(project);
	displayController.createTodoCard(project, projects[project][0]);
}




