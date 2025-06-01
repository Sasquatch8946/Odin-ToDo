import { format, parseISO } from 'date-fns';
import { todoProject, ToDo } from './todoProject.js';
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
		const closeBtns = Array.from(document.querySelectorAll("dialog button"));
		closeBtns.forEach((closeBtn) => {
			closeBtn.addEventListener("click", (e) => {
				const dialog = e.target.closest("dialog");
				e.preventDefault();
				dialog.close();
			});
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

	const activateDelBtn = (element) => {
		element.addEventListener("click", (e) => {
			const todoCard = e.target.parentNode.parentNode.parentNode;
			const todoId = todoCard.dataset.id;
			todoCard.remove();
			const projectId = document.querySelector(".todo-section").dataset.project;
			PubSub.publish("removeTodo", {todoId, projectId});
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
				makeEditable(e.target);
			}
			const projectName = e.target.innerText;
			PubSub.publish("projectNameChange", {"projectId": e.target.dataset.id,
				"projectName": projectName
			});
		});

	}

	const showEditForm = (event) => {
		const dialog = document.querySelector('dialog.todo-form.edit-form');
		const projectId = getProjectId();
		const todoId = event.target.closest(".todo-card").dataset.id;
		dialog.dataset.todoId = todoId;
		dialog.dataset.projectId = projectId;
		const inputs = Array.from(document.querySelectorAll(".todo-form.edit-form .form-row input"));
		const todoObj = todoProject.projects[projectId].todos.filter((t) => t.id === todoId)[0];
		inputs.forEach((i) => {
			var prop = i.name;
			if (i.name === "dueDate") {
				const dateStr = format(parseISO(todoObj[prop]), "yyyy-MM-dd");
				i.value = dateStr;
			} else {
				i.value = todoObj[prop];
			}
		});
		dialog.showModal();
	}

	const getProjectId = () => {
		return document.querySelector(".todo-section").dataset.project;
	}

	const activateEditSubmit = () => {
		const f = getEditForm();
		f.addEventListener("submit", submitEdit);
	}


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
		populateTodosOnClick(projectTitle);
		container.appendChild(projectTitle);
		projectTitle.dataset.id = project.id;
		projectTitle.focus();
	}

	const createTodoCard = (_msg, todo) => {
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
		const title = document.createElement("div");
		title.innerText = todo.title;
		title.classList.add("todo-title");
		const dateStr = formatDate(todo.dueDate);
		const dueDateDiv = createDateSpan(dateStr); 
		cardTitle.dataset.id = todo.id;
		cardTitle.classList.add("title-wrapper");
		cardTitle.classList.add("title");
		cardTitle.appendChild(title);
		cardTitle.appendChild(dueDateDiv);
		return cardTitle;
	}

	const createDateSpan = (dateStr) => {
		const container = document.createElement("div");
		const span = document.createElement("span");
		span.innerText = dateStr;
		const open = document.createTextNode("(");
		const close = document.createTextNode(")");
		container.appendChild(open);
		container.appendChild(span);
		container.appendChild(close);
		container.classList.add("due-date");
		return container;
	}

	const createHiddenContent = (todo) => {
		const hiddenContent = document.createElement("div");
        hiddenContent.classList.add("expandable-content");
		hiddenContent.classList.add("hidden");
		const cardDescription = document.createElement("div");
		cardDescription.innerText = todo.description;
		cardDescription.classList.add("todo-description");
		const cardPriority = document.createElement("div");
		cardPriority.innerText = `Priority: ${todo.priority}`;
		if (todo.checklist) {
			const cardChecklist = createChecklist(todo);
			hiddenContent.appendChild(cardChecklist);
		}
		const cardNotes = document.createElement("div");
		cardNotes.innerText = todo.notes;
		cardNotes.classList.add("todo-notes");
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
		eImg.addEventListener("click", showEditForm);
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

		const defaultId = getDefaultProjectId();
		createTodoSubSection(defaultId);
		for (let project in projects) {
			displayController.createProjectDiv(null, projects[project]);
			projects[project].todos.forEach((t) => {
				createTodoCard(null, t);
			});
		}

	}

	const getDefaultProjectId = () => {
		const projects = todoProject.projects;
		let projectId;
		for (let project in projects) {
			projectId = projects[project].id;
			break;
		}

		return projectId;
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

	const getFormData = (form) => {
		const data = new FormData(form);
		console.log(data.get("Todo name"));
		const details = [...data.entries()];
		console.log(details);
		const title = details[0][1];
		const dueDate = details[1][1];
		const description = details[2][1];
		const priority = details[3][1];
		const checklist = details[4][1];
		const notes = details[5][1];
		return {title, dueDate, description, priority, checklist, notes};
	}

	const submitForm = (e) => {
			const form = document.querySelector("form");
			e.preventDefault();
			const formData = getFormData(form);
			const project = getProjectId();
			const pubData = { project, formData };
			PubSub.publish("newTodo.formSubmission", pubData);
			clearForm();
	}

	const submitEdit = (e) => {
			e.preventDefault();
			const form = getEditForm();
			const todoId = getEditDialog().dataset.todoId;
			const formData = getFormData(form);
			const projectId = getProjectId();
			const pubData = { projectId, formData, todoId };
			PubSub.publish("todoEdit", pubData);
			clearForm();
	}

	const getEditForm = () => {
		return document.querySelector("dialog.todo-form.edit-form form");

	}

	const activateFormSubmit = () => {
		const form = document.querySelector("form");
		form.addEventListener("submit", submitForm);
	}

	const getEditDialog = () => {
		return document.querySelector("dialog.todo-form.edit-form");
	}


	const clearForm = () => {
		const inputs = document.querySelectorAll("form input");
		inputs.forEach((input) => {
			if (input.type != 'submit') {
				input.value = "";
			}
		});
	}

	const formatDate = (date) => {
		return format(parseISO(date), "M/dd/yyyy");
	}

	const editCard = (_msg, todo) => {
		const todoId = todo.id;
		const todoCard = document.querySelector(`div.todo-card[data-id='${todoId}']`);
		setCardTitle(todoCard, todo.title);
		setCardDueDate(todoCard, todo.dueDate);
		setChecklist(todoCard, todo.checklist);
		setCardDescription(todoCard, todo.description);
		setCardNotes(todoCard, todo.notes);
		setPriorityHighlight(todo, todoCard);
	}

	const setCardTitle = (element, newTitle) => {
		const titleDiv = element.querySelector('.todo-title');
		titleDiv.innerText = newTitle;
	}
	
	const setCardDueDate = (element, newDate) => {
		const titleDiv = element.querySelector('.due-date > span');
		const dateStr = formatDate(newDate);
		titleDiv.innerText = dateStr;
	}

	const setChecklist = (element, checklist) => {
		const orderedList = element.querySelector("ol");
		removeAllChildren(orderedList);
		const items = checklist.split(",");
		items.forEach((i) => {
			const li = document.createElement("li");
			li.innerText = i;
			orderedList.appendChild(li);
		});
	}

	const removeAllChildren = (element) => {
		while (element.lastElementChild) {
			element.removeChild(element.lastElementChild);
		}
	}

	const setCardDescription = (element, newDescription) => {
		const description = element.querySelector(".todo-description");
		description.innerText = newDescription;
	}

	const setCardNotes = (element, newNotes) => {
		const notes = element.querySelector(".todo-notes");
		notes.innerText = newNotes;
	}

	const populateTodosOnClick = (projectDiv) => {
		projectDiv.addEventListener("click", () => {
			const projectId = projectDiv.dataset.id;
			clearTodos();
			setActiveProject(projectId);
			populateTodos(projectId);

		});

	}

	const setActiveProject = (projectId) => {
		const todoSection = document.querySelector('.todo-section');
		todoSection.dataset.project = projectId;
	}

	const clearTodos = () => {
		const todos = document.querySelector('.todos');
		removeAllChildren(todos);
	}

	const populateTodos = (projectId) => {
		if (todoProject.projects[projectId].todos.length > 0) {
			todoProject.projects[projectId].todos.forEach((t) => {
				createTodoCard(null, t);
			});
		} else {
			console.log("project has no todos");
		}
	}

	PubSub.subscribe("projectCreated", createProjectDiv);
	PubSub.subscribe("editCard", editCard);

	activateNewToDoButton();
	activateDialogClose();
	activateNewProjBtn();
	activateEditSubmit();
	activateFormSubmit();	

	return {
		createProjectDiv,
		createTodoCard,
		populateProjects,
	}
})();
