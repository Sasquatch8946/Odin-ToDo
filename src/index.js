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
		this.id = crypto.randomUUID()
	}
}

const displayController = (function () {

	const priorityColorCode = {
		high: "red",
		medium: "blue",
		low: "green",
	}

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
		cardTitle.dataset.id = todo.id;
		cardTitle.innerText = `${todo.title} (Due: ${todo.dueDate})`;
		cardTitle.classList.add("title");
		const hiddenContent = document.createElement("div");
		hiddenContent.classList.add("hidden");
		const cardDescription = document.createElement("div");
		cardDescription.innerText = todo.description;
		const cardDate = document.createElement("div");
		const cardPriority = document.createElement("div");
		cardPriority.innerText = `Priority: ${todo.priority}`;
		const cardChecklist = document.createElement("div");
		cardChecklist.innerText = todo.checklist;
		const cardNotes = document.createElement("div");
		cardNotes.innerText = todo.notes;
		todoCard.appendChild(cardTitle);
		hiddenContent.appendChild(cardDescription);
		hiddenContent.appendChild(cardDate);
		hiddenContent.appendChild(cardChecklist);
		hiddenContent.appendChild(cardNotes);
		setPriorityHighlight(todo, todoCard);
		todoCard.appendChild(hiddenContent);
		container.appendChild(todoCard);
		todoCard.addEventListener("click", (e) => {
			const cn = Array.from(e.currentTarget.childNodes);
			if (cn[1].classList[0] === "hidden") {
				cn[1].classList.remove("hidden");
			} else {
				cn[1].classList.add("hidden");
			}
		});
	}

	const populateProjects = () => {
		for (let project in projects) {
			displayController.createProject(project);
			displayController.createTodoCard(project, projects[project][0]);
		}

	}

	const setPriorityHighlight = (todo, todoCard) => {
		todoCard.style.borderColor = priorityColorCode[todo.priority];	
	}

	return {
		createProject,
		createTodoCard,
		populateProjects,
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

projects.Today.push(myToDo);

displayController.populateProjects();

const dialog = document.querySelector("dialog");
const newTodo = document.querySelector("button.new-todo");
newTodo.addEventListener("click", () => {
	dialog.showModal();
});




