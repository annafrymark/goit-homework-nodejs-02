const Contact = require("./schemas/contact");

const listContacts = async () => {
  return Contact.find();
};

const getContactById = (id) => {
  return Contact.findOne({ _id: id });
};

const addContact = ({ name, email, phone, favorite }) => {
  return Contact.create({ name, email, phone, favorite });
};

const updateContact = () => {
  return Contact.findByIdAndUpdate({ _id: id }, body, { new: true });
};

// const updateStatusContact = ({ _id: id }, body) => {
//   return 
// };

const removeContact = (id) => {
  return Contact.findByIdAndRemove({ _id: id });
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  // updateStatusContact,
  removeContact,
};
