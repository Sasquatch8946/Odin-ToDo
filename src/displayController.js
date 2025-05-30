import { format } from 'date-fns';
import { Project, todoProject, ToDo } from './todoProject.js';
const PubSub = require('pubsub-js');
import editImage from './file-edit.svg';
import delImage from './delete.svg';

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
			console.log("new project button clicked");
			PubSub.publish("newProjectButtonClicked");
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

	const activateDelBtn = (element) => {
		element.addEventListener("click", (e) => {
			const todoCard = e.target.parentNode.parentNode.parentNode;
			todoCard.remove();
			PubSub.publish("removeTodo");
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

	const getTodoWrapper = () => {
		return document.querySelector(".todo-section");
	};
	
	const getProjectContainer = () => {
		return document.querySelector(".project-section");
	}

	const createProjectDiv = (_msg, project) => {
		const container = getProjectContainer();
		const projectTitle = document.createElement("div");
		projectTitle.classList.add("project-title");
		projectTitle.innerText = project.name;
		projectTitle.tabIndex = "0";
		makeProjectEditable(projectTitle);
		container.appendChild(projectTitle);
		projectTitle.dataset.id = project.id;
		projectTitle.focus();
	}

	const createTodoCard = (_msg, data) => {
		const todo = data.todo;
		const wrapper = getTodoWrapper();
		const container = document.querySelector(".todos");
		const todoCard = createCard(todo.id);
		const cardTitle = createCardTitle(todo);
		const hiddenContent = createHiddenContent(todo);
		setPriorityHighlight(todo, todoCard);
		todoCard.appendChild(cardTitle);
		todoCard.appendChild(hiddenContent);
		container.appendChild(todoCard);
		wrapper.appendChild(container);
		cardTitle.addEventListener("click", toggleContentVisibility);	
	}

	const createTodoSubSection = (projectId) => {
		const todoSection = getTodoWrapper();
		todoSection.dataset.project = projectId;
		const todoSubSection = document.createElement("div");
		todoSubSection.classList.add("todos");
		todoSection.appendChild(todoSubSection);
		
	}

	PubSub.subscribe("newTodo.addCard", createTodoCard);

	const createCard = (todoId) => {
		const todoCard = document.createElement("div");
		todoCard.classList.add("todo-card");
		todoCard.dataset.id = todoId;
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
		cardNotes.innerText = todo.notes;
		const buttonDiv = createBtnDiv();
		hiddenContent.appendChild(cardDescription);
		hiddenContent.appendChild(cardNotes);
		hiddenContent.appendChild(buttonDiv);
		return hiddenContent;
	}

	const createBtnDiv = () => {
		const wrapper = document.createElement("div");
		wrapper.classList.add('button-wrapper');
        const eImg = document.createElement("img");
        eImg.src = editImage;
        eImg.width = "30";
        eImg.height = "30";
        eImg.classList.add('edit-img');
		activateEditBtn(eImg);
		const delImg = document.createElement("img");
		delImg.src = delImage;
		delImg.width = "30";
		delImg.height = "30";
		activateDelBtn(delImg);
		wrapper.appendChild(eImg);
		wrapper.appendChild(delImg);
		return wrapper;
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
			displayController.createProjectDiv(null, projects[project]);
			projects[project].todos.forEach((t) => {
				createTodoSubSection(projects[project].id);
				createTodoCard(null, {todo: t});
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

	PubSub.subscribe("projectCreated", createProjectDiv);

	return {
		createProjectDiv,
		createTodoCard,
		populateProjects,
	}
})();
