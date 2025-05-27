import { format } from 'date-fns';
import { Project, todoProject } from './todoProject.js';
const PubSub = require('pubsub-js');

export const displayController = (function () {


	const dialog = document.querySelector("dialog.todo-form");

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

	const activateNewProjBtn = () => {
		const newProjBtn = document.querySelector('button.project');
		newProjBtn.addEventListener("click", () => {
			const projectSection = document.querySelector('.project-section');
			const projectDiv = document.createElement('button');
			projectDiv.innerText = "New Project";
			projectDiv.classList.add("project-title");
			const project = new Project(projectDiv.innerText);
			PubSub.publish("newProject", project);
			projectDiv.dataset.id = project.id;
			projectDiv.addEventListener("dblclick", enableEditOnDblClick);
			projectDiv.addEventListener("blur", (e) => {
				console.log("project button lost focus");
				const projectName = e.target.innerText;
				PubSub.publish("newProject.nameChange", {"project": e.target.dataset.id,
					"name": projectName
				});
			});
			projectSection.appendChild(projectDiv);
		});
	}
	
	const enableEditOnDblClick = (event) => {
		const btn = event.target;
		btn.contentEditable = true;
		btn.focus();
	}

	activateNewToDoButton();
	activateDialogClose();
	activateNewProjBtn();

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
		console.log("PROJECT NAME");
		console.log(projectName);
		const container = getProjectContainer();
//		const projectWrapper = document.createElement("div");
//		projectWrapper.classList.add("project-wrapper");
		const projectTitle = document.createElement("button");
		projectTitle.classList.add("project-title");
		projectTitle.innerText = projectName;
//		projectWrapper.appendChild(projectTitle);
		container.appendChild(projectTitle);
		projectTitle.dataset.project = projectName;
		projectTitle.focus();
	}

	const createTodoCard = (_msg, data) => {
		const projectName = data.projectName 
		const todo = data.todo;
		const wrapper = getWrapper();
		wrapper.dataset.project = projectName;
		const container = document.createElement("div");
		container.classList.add("todos");
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

	PubSub.subscribe("newTodo.addCard", createTodoCard);

	const createCard = () => {
		const todoCard = document.createElement("div");
		todoCard.classList.add("todo-card");
		return todoCard;
	}

	const createCardTitle = (todo) => {
		const cardTitle = document.createElement("div");
		const dateStr = formatDate(todo.dueDate);
		cardTitle.dataset.id = todo.id;
		cardTitle.innerText = `${todo.title} (Due: ${dateStr})`;
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
		if (todo.checklist) {
			const cardChecklist = createChecklist(todo);
			hiddenContent.appendChild(cardChecklist);
		}
		const cardNotes = document.createElement("div");
		cardNotes.innerText = todo.notes;
		hiddenContent.appendChild(cardDescription);
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
			displayController.createProject(projects[project].name);
			projects[project].todos.forEach((t) => {
				createTodoCard(null, {projectName: project.name, todo: t});
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
			const project = document.querySelector('.todo-section').dataset.project;
			const pubData = { project, todo };
			PubSub.publish("newTodo.formSubmission", pubData);
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

	const formatDate = (date) => {
		return format(date, "M/dd/yyyy");
	}

	return {
		createProject,
		createTodoCard,
		populateProjects,
	}
})();
