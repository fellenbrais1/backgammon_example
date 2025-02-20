// CODE START

// NOTES
// Sets up and exports a local storage object for storing user's data between sessions

"use strict";

console.log(`localStorage.js running`);

// VARIABLES
export const localStorage = window.localStorage;

const defaultLocalStorageObject = {
  displayName: "",
  skillLevel: "beginner",
  languages: [],
};

// FUNCTIONS
// Creates a copy of the defaultLocalStorageObject to be used in the user's local storage
// Exported to , called by setLocalStorage()
export function createLocalStorage() {
  const localStorageObject = { ...defaultLocalStorageObject };
  localStorage.setItem(
    "localStorageObject",
    JSON.stringify(localStorageObject)
  );
  return localStorageObject;
}

// Sets the user's data on their copy of the localStorageObject
// Exported to , called by
export function setLocalStorage(
  displayName = "",
  skillLevel = "beginner",
  languages = ["English"]
) {
  let storedObject = localStorage.getItem("localStorageObject");
  if (!storedObject) {
    storedObject = createLocalStorage();
  }
  const localStorageObject = JSON.parse(storedObject);
  localStorageObject.displayName = displayName;
  localStorageObject.skillLevel = skillLevel;
  localStorageObject.languages = languages;
  localStorage.setItem(
    "localStorageObject",
    JSON.stringify(localStorageObject)
  );
  return;
}

// Loads the data from the perviously created localStorageObject, or supplies default values if an object does not exist.
// Exported to , called by
export function loadLocalStorage() {
  const storedObject = localStorage.getItem("localStorageObject");
  if (storedObject) {
    const localStorageObject = JSON.parse(storedObject);
    return {
      displayName: localStorageObject.displayName,
      skillLevel: localStorageObject.skillLevel,
      languages: localStorageObject.languages,
    };
  } else {
    const newObject = createLocalStorage();
    return {
      displayName: newObject.displayName,
      skillLevel: newObject.skillLevel,
      languages: newObject.languages,
    };
  }
}

// CODE END
