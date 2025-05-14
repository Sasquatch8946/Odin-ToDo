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

let myToDo = new ToDo("Clean the floors",
	"Sweep and wetjet the floors in the kitche, living room, and entryway.",
	"5/15/25",
	"high",
	"move the furniture, sweep, wetjet",
	"be thorough");


