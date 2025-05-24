import "./styles.css";
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

const displayController = (function () {


	const dialog = document.querySelector("dialog");

	const activateNewToDoButton = () => {
		const newTodo = document.querySelector(".new-button > button");
		newTodo.addEventListener("click", () => {
			dialog.showModal();
		});
	}

	const activateDialogClose = () => {
		const closeBtn = document.querySelector("dialog button");
		closeBtn.addEventListener("click", () => {
			dialog.close();
		});
	}

	activateNewToDoButton();
	activateDialogClose();

	const priorityColorCode = {
		high: "red",
		medium: "blue",
		low: "green",
	}

	const getWrapper = () => {
		return document.querySelector(".todo-section");
	};
	
	const getProjectContainer = () => {
		return document.querySelector(".project-section");
	}

	const createProject = (projectName) => {
		const container = getProjectContainer();
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
		const wrapper = getWrapper();
		const container = document.createElement("div");
		container.classList.add("todos");
		container.dataset.project = projectName;
		const todoCard = createCard();
		const cardTitle = createCardTitle(todo);
		const hiddenContent = createHiddenContent(todo);
		setPriorityHighlight(todo, todoCard);
		todoCard.appendChild(cardTitle);
		todoCard.appendChild(hiddenContent);
		container.appendChild(todoCard);
		todoCard.addEventListener("click", toggleContentVisibility);	
		wrapper.appendChild(container);
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
		const projects = todoProject.projects;
		if (getProjectContainer()) {
			clearProjects();
			createProjectContainer();
		} else {
			createProjectContainer();
		}
		for (let project in projects) {
			displayController.createProject(project);
			projects[project].forEach((t) => {
				createTodoCard(project, t);
			});
		}

	}

	const clearProjects = () => {
		const projectSection = document.querySelector("div.project-section");
		projectSection.remove();
	}

	const createProjectContainer = () => {
		const sidebar = document.querySelector("div.sidebar");
		const projectContainer = document.createElement("div");
		projectContainer.classList.add("project-section");
		sidebar.appendChild(projectContainer);
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

	const activateFormSubmit = () => {
		const form = document.querySelector("form");
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			console.log(e.target);
			const data = new FormData(form);
			console.log(data.get("Todo name"));
			const details = [...data.entries()];
			console.log(details);
			const todoName = details[0][1];
			const dueDate = details[1][1];
			const descript = details[2][1];
			const priority = details[3][1];
			const checklist = details[4][1];
			const notes = details[5][1];
			const todo = new ToDo(todoName, descript, dueDate, priority, checklist, notes);
			console.log("todo object from event listener:");
			console.log(todo);
			const project = document.querySelector('.todos').dataset.project;
			const pubData = { project, todo };
			PubSub.publish("newTodo", pubData);
			clearForm();
		});
	}

	activateFormSubmit();	

	const clearForm = () => {
		const inputs = document.querySelectorAll("form input");
		inputs.forEach((input) => {
			if (input.type != 'submit') {
				input.value = "";
			}
		});
	}

	return {
		createProject,
		createTodoCard,
		populateProjects,
	}
})();

const todoProject = (function() {
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


	const addTodo = (_msg, pubData) => {
		const projectName = pubData.project;
		const todo = pubData.todo;
		todoProject.projects[projectName].push(todo);	
	}


	PubSub.subscribe("newTodo", addTodo);

	return {
		projects,
		addTodo,
	}
})();

displayController.populateProjects();





