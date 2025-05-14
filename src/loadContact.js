function createContact(name, jobTitle, phone, email) {
    const contactCard = document.createElement("div");
    contactCard.classList.add("contact-card");
    createContactDetail(name, contactCard);
    createContactDetail(jobTitle, contactCard);
    createContactDetail(phone, contactCard);
    createContactDetail(email, contactCard);
    return contactCard;

}

function createContactDetail(detail, parentDiv) {
    const newDiv = document.createElement("div");
    newDiv.innerText = detail;
    parentDiv.append(newDiv);
}

export const loadContact = () => {
    const contentDiv = document.querySelector("div#content");
    const subContentDiv = document.createElement("div");
    subContentDiv.classList.add("sub-content");
    const contact1 = createContact("Schmitty Werberjagermanjensen",
        "Manager",
        "(312)-123-4567",
        "swerberjagermanjensen@fake.com"
    )
    const contact2 = createContact("Sally Hotcakes",
        "Lead Waitress",
        "(312)-456-7890",
        "shotcakes@fake.com"
    )
    subContentDiv.appendChild(contact1);
    subContentDiv.appendChild(contact2);
    contentDiv.appendChild(subContentDiv);
};