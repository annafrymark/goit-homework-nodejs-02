const fs = require("fs/promises");
const path = require("path");
const contactsPath = path.resolve("./models/contacts.json");

const listContacts = async () => {
  try {
    const response = await fs.readFile(contactsPath);
    const parsedContacts = JSON.parse(response);
    let stringifiedContacts = [];
    parsedContacts.forEach((contact) => {
      stringifiedContacts.push(JSON.stringify(contact));
    });
    return stringifiedContacts;
  } catch (error) {
    console.log(error);
  }
};

const getContactById = async (contactId) => {
  try {
    const contacts = await fs.readFile(contactsPath);
    const parsedContacts = JSON.parse(contacts);
    const contactFound = parsedContacts.find(
      (contact) => contact.id === contactId
    );

    return contactFound;
  } catch (error) {
    console.log(error);
  }
};

const removeContact = async (contactId) => {
  try {
    const contacts = await fs.readFile(contactsPath);
    const parsedContacts = JSON.parse(contacts);
    const filtredContacts = parsedContacts.filter(
      (contact) => contact.id !== contactId
    );
    if (filtredContacts.length !== parsedContacts.length) {
      fs.writeFile(contactsPath, JSON.stringify(filtredContacts));
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

const addContact = async (body) => {
  try {
    const contacts = await fs.readFile(contactsPath);
    const parsedContacts = JSON.parse(contacts);
    parsedContacts.push(body);
    fs.writeFile(contactsPath, JSON.stringify(parsedContacts));
  } catch (error) {
    console.log(error);
  }
};

const updateContact = async (contactId, body) => {
  try {
    const contacts = await fs.readFile(contactsPath);
    const parsedContacts = JSON.parse(contacts);

    let [contact] = parsedContacts.filter((con) => con.id === contactId);

    if (!contact) {
      return null;
    }
    for (const prop in body) {
      if (body.hasOwnProperty(prop)) {
        contact[prop] = body[prop];
      }
    }
    fs.writeFile(contactsPath, JSON.stringify(parsedContacts));
    return contact;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
