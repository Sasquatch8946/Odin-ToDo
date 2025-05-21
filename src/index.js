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

	const createTodoCard = (todo) => {
		const container = getContainer();
		const todoCard = createCard();
		const cardTitle = createCardTitle(todo);
		const hiddenContent = createHiddenContent(todo);
		setPriorityHighlight(todo, todoCard);
		todoCard.appendChild(cardTitle);
		todoCard.appendChild(hiddenContent);
		container.appendChild(todoCard);
		todoCard.addEventListener("click", toggleContentVisibility);	
	}

	const createCard = () => {
		const todoCard = document.createElement("div");
		todoCard.classList.add("todo-card");
		return todoCard;
	}

	const createCardTitle = (todo) => {
		const cardTitle = document.createElement("div");
		cardTitle.dataset.id = todo.id;
		cardTitle.innerText = `${todo.title} (Due: ${todo.dueDate})`;
		cardTitle.classList.add("title");
		return cardTitle;
	}

	const createHiddenContent = (todo) => {
		const hiddenContent = document.createElement("div");
		hiddenContent.classList.add("hidden");
		const cardDescription = document.createElement("div");
		cardDescription.innerText = todo.description;
		const cardPriority = document.createElement("div");
		cardPriority.innerText = `Priority: ${todo.priority}`;
		const cardChecklist = createChecklist(todo);
		const cardNotes = document.createElement("div");
		cardNotes.innerText = todo.notes;
		hiddenContent.appendChild(cardDescription);
		hiddenContent.appendChild(cardChecklist);
		hiddenContent.appendChild(cardNotes);
		return hiddenContent;
	}

	const toggleContentVisibility = (e) => {

		const cn = Array.from(e.currentTarget.childNodes);
		if (cn[1].classList[0] === "hidden") {
			cn[1].classList.remove("hidden");
		} else {
			cn[1].classList.add("hidden");
		}

	}

	const populateProjects = () => {
		for (let project in projects) {
			displayController.createProject(project);
			displayController.createTodoCard(projects[project][0]);
		}

	}

	const createChecklist = (todo) => {
		const checklist = document.createElement("ol");
		const items = todo.checklist.split(",");
		items.forEach((i) => {
			const li = document.createElement("li");	
			li.innerText = i;
			checklist.appendChild(li);
		});
		checklist.classList.add("checklist");
		return checklist;
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




