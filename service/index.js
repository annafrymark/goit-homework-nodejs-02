const Contact = require("./schemas/contact");

const listContacts = async () => {
  return Contact.find();
};

const getContactById = (id) => {
  return Contact.findOne({ _id: id });
};

const addContact = (contact) => {
  const newContact = Contact.create(contact);
  return newContact;
};

const updateContact = () => {
  return Contact.findByIdAndUpdate({ _id: id }, body, { new: true });
};

const removeContact = (id) => {
  return Contact.findByIdAndRemove({ _id: id });
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
};
