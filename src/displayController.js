import { format } from 'date-fns';
import { Project, todoProject, ToDo } from './todoProject.js';
const PubSub = require('pubsub-js');
import editImage from './file-edit.svg';

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
			makeProjectEditable(projectDiv);
			projectSection.appendChild(projectDiv);
		});
	}
	
	const enableEditOnDblClick = (event) => {
		const btn = event.target;
		btn.contentEditable = true;
		btn.focus();
		const sel = window.getSelection();
		sel.selectAllChildren(btn);
		sel.collapseToEnd();
	}

	const activateEditBtn = (element) => {
		element.addEventListener("click", (e) => {
			console.log("edit button clicked");
			makeEditable(e.target.parentNode);
			makeEditable(e.target.parentNode.previousSibling);
/*			const s = getSiblingElements(e.target);
			console.log(s);
			s.forEach((el) => {
				makeEditable(el);
			});*/
		});
	}

	const getSiblingElements = (element) => {
		return Array.from(element.parentNode.children).filter((el) => {
			return el !== element;
		});
	}

	const makeEditable = (element) => {
		element.contentEditable = "true";
	}

	const makeProjectEditable = (projectDiv) => {
		projectDiv.addEventListener("dblclick", enableEditOnDblClick);
		projectDiv.addEventListener("blur", (e) => {
			console.log("project button lost focus");
			if (e.target.contentEditable === "true") {
				e.target.contentEditable = "false";
			}
			const projectName = e.target.innerText;
			PubSub.publish("projectNameChange", {"projectId": e.target.dataset.id,
				"projectName": projectName
			});
		});

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

	const createProject = (project) => {
		const container = getProjectContainer();
		const projectTitle = document.createElement("div");
		projectTitle.classList.add("project-title");
		projectTitle.innerText = project.name;
		makeProjectEditable(projectTitle);
		container.appendChild(projectTitle);
		projectTitle.dataset.id = project.id;
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
		cardTitle.addEventListener("click", toggleContentVisibility);	
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
        hiddenContent.classList.add("expandable-content");
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
        const eImg = document.createElement("img");
        eImg.src = editImage;
        eImg.width = "30";
        eImg.height = "30";
        eImg.classList.add('edit-img');
		activateEditBtn(eImg);
		cardNotes.innerText = todo.notes;
		hiddenContent.appendChild(cardDescription);
		hiddenContent.appendChild(cardNotes);
        hiddenContent.appendChild(eImg);
		return hiddenContent;
	}

	const toggleContentVisibility = (e) => {

		if (e.currentTarget.contentEditable !== "true") {
			const ns = e.currentTarget.nextSibling;
			if (ns.classList[1] === "hidden") {
				ns.classList.remove("hidden");
			} else {
				ns.classList.add("hidden");
			}
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
			displayController.createProject(projects[project]);
			projects[project].todos.forEach((t) => {
				createTodoCard(null, {projectName: projects[project].id, todo: t});
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
