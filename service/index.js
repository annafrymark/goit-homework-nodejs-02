const Contact = require("./schemas/contact");

const listContacts = async (owner) => {
  return Contact.find({ owner: owner });
};

const getContactById = (id, owner) => {
  return Contact.findOne({ _id: id, owner: owner });
};

const addContact = (contact) => {
  const newContact = Contact.create(contact);
  return newContact;
};

const updateContact = (id, contact, owner) => {
  return Contact.findByIdAndUpdate({ _id: id, owner: owner }, contact, {
    new: true,
  });
};

const removeContact = (id, owner) => {
  return Contact.findByIdAndRemove({ _id: id, owner: owner });
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
};
