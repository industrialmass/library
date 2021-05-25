class Book {
  constructor({ title, author, pages, haveRead }) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.haveRead = haveRead;
  }
  info() {
    return `${this.title} by ${this.author}, ${this.pages} ${
      this.pages > 1 ? "pages" : "page"
    }, ${this.haveRead ? "have read" : "not read yet"}`;
  }

  toggleRead() {
    this.haveRead = this.haveRead ? false : true;
  }
}

let myLibrary;
if (storageAvailable("localStorage")) {
  myLibrary = JSON.parse(localStorage.getItem("myLibrary") || "[]").map(
    (element) => new Book(JSON.parse(element))
  );
} else {
  myLibrary = [];
}
const state = {
  checked: null,
  warned: false,
};

const renderLibrary = () => {
  // We remove and rerender all relevant DOM elements each time this function is called
  Array.from(document.querySelectorAll(".container-card")).forEach(
    (element) => {
      element.parentNode.removeChild(element);
    }
  );

  for (const [index, book] of myLibrary.entries()) {
    const containerCard = addElement(
      `containerCard${index}`,
      "div",
      "",
      document.querySelector(".main-library"),
      ["container-card"]
    );

    // Handle the top buttons
    const buttonContainer = addElement(
      `buttonContainer${index}`,
      "div",
      "",
      containerCard,
      ["button-container"]
    );

    const deleteButton = addElement(
      `deleteButton${index}`,
      "img",
      "",
      buttonContainer
    );

    deleteButton.setAttribute("src", "trash-solid.svg");
    deleteButton.setAttribute("width", "15px");
    deleteButton.setAttribute("height", "15px");

    // A closure is formed here, so deleteButton's event listener will always
    // remember its lexical environment and the value of index
    // at the time of its creation
    deleteButton.addEventListener("click", () => {
      myLibrary.splice(index, 1);
      if (storageAvailable("localStorage")) {
        localStorage.setItem(
          "myLibrary",
          JSON.stringify(myLibrary.map((element) => JSON.stringify(element)))
        );
      }
      renderLibrary();
    });

    const readToggle = addElement(
      `readToggle${index}`,
      "img",
      "",
      buttonContainer
    );

    const bookIcon = book.haveRead ? "book-open-solid.svg" : "book-solid.svg";
    readToggle.setAttribute("src", bookIcon);
    readToggle.setAttribute("width", "15px");
    readToggle.setAttribute("height", "15px");

    readToggle.addEventListener("click", () => {
      myLibrary[index].toggleRead();
      if (storageAvailable("localStorage")) {
        localStorage.setItem(
          "myLibrary",
          JSON.stringify(myLibrary.map((element) => JSON.stringify(element)))
        );
      }

      renderLibrary();
    });

    const title = addElement(
      `titleCard${index}`,
      "h2",
      book.title,
      containerCard,
      ["container-card__text", "container-card__text--title"]
    );
    const author = addElement(
      `authorCard${index}`,
      "p",
      book.author,
      containerCard,
      ["container-card__text"]
    );
    const pages = addElement(
      `pageCard${index}`,
      "p",
      book.pages,
      containerCard,
      ["container-card__text"]
    );
  }
};

// Called every load
renderLibrary();

// Logic for handling checkbox state
// Only one checkbox can be checked at a time
const handleBinaryCheckbox = (checkbox, otherCheckbox) => {
  checkbox.addEventListener("click", () => {
    if (otherCheckbox.checked) {
      state.checked = checkbox.id;
      otherCheckbox.checked = false;
    } else if (checkbox.checked) {
      state.checked = checkbox.id;
    } else {
      state.checked = null;
    }
  });

  otherCheckbox.addEventListener("click", () => {
    if (checkbox.checked) {
      state.checked = otherCheckbox.id;
      checkbox.checked = false;
    } else if (otherCheckbox.checked) {
      state.checked = otherCheckbox.id;
    } else {
      state.checked = null;
    }
  });
};

const yesBox = document.getElementById("yes");
const noBox = document.getElementById("no");

// Reset checked state
yesBox.checked = false;
noBox.checked = false;

handleBinaryCheckbox(yesBox, noBox);

// Logic for button pressing
const button = document.getElementById("submit");
button.addEventListener("click", () => {
  const inputs = {
    title: document.getElementById("title"),
    author: document.getElementById("author"),
    pages: document.getElementById("pages"),
  };

  // We should keep track of any blank fields
  const blankInputs = [];
  // Handle client-side form validation
  for (const prop in inputs) {
    inputs[prop].classList.remove("library-form__entry--error");
    if (!inputs[prop].value) {
      blankInputs.push(inputs[prop].id);
    }
  }

  if (state.warned) {
    const warning = document.getElementById("warning");
    if (warning) {
      warning.parentNode.removeChild(warning);
    }

    if (!blankInputs.length) {
      state.warned = false;
    }
  }

  // Declare our form
  const libraryForm = document.querySelector(".library-form");

  if (blankInputs.length) {
    for (const id of blankInputs) {
      const element = document.getElementById(id);
      element.classList.add("library-form__entry--error");
    }
    addElement(
      "warning",
      "p",
      `Missing ${blankInputs.join(", ")}!`,
      libraryForm,
      ["warning"]
    );
    state.warned = true;
    return;
  }

  // Now ensure we have a checkbox checked
  // This only gets sent if we have all our input
  const checkboxes = document.querySelectorAll(".library-form__checkbox");

  if (!state.checked) {
    addElement("warning", "p", `Ensure a box is checked`, libraryForm, [
      "warning",
    ]);
    state.warned = true;
    return;
  }

  // Now we can proceed with adding the book to our array
  const newBook = new Book({
    title: inputs.title.value,
    author: inputs.author.value,
    pages: inputs.pages.value,
    haveRead: state.checked === "yes",
  });

  /*
  // Clear the data from the fields;
  for (const key in inputs) {
    inputs[key].value = "";
  }
  */

  myLibrary.push(newBook);
  if (storageAvailable("localStorage")) {
    const libraryString = JSON.stringify(
      myLibrary.map((element) => {
        return JSON.stringify(element);
      })
    );
    localStorage.setItem("myLibrary", libraryString);
  }
  renderLibrary();

  console.log(myLibrary);
});

// Helper function for adding elements to the DOM
function addElement(
  id,
  tag = "div",
  content = "",
  parent = document.body,
  classes
) {
  const newElement = document.createElement(tag);
  newElement.id = id;
  // add classes if present
  if (classes) {
    newElement.classList.add(...classes);
  }

  // append text to the element
  const newContent = document.createTextNode(content);
  newElement.appendChild(newContent);

  // append element to the parent
  parent.appendChild(newElement);

  return newElement;
}

function updateStorage() {}

// Helper function for checking if local storage is available
// taken from MDN
function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}
