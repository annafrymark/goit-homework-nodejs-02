const service = require("../service");

const getAll = async (req, res, next) => {
  try {
    const result = await service.listContacts(req.user._id);
    res.json({
      status: "success",
      code: 200,
      data: { contacts: result },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getById = async (req, res, next) => {
  const id = req.params.contactId;
  try {
    const result = await service.getContactById(id, req.user._id);
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not found",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const addContact = async (req, res, next) => {
  const { name, email, phone, favorite } = req.body;
  try {
    const result = await service.addContact({
      name,
      email,
      phone,
      favorite,
      owner: req.user._id,
    });
    res.status(201).json({
      status: "success",
      code: 201,
      data: { contact: result },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  const id = req.params.contactId;
  const { name, email, phone, favorite } = req.body;
  try {
    const result = await service.updateContact(
      id,
      {
        name,
        email,
        phone,
        favorite,
      },
      req.user._id
    );
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not found",
      });
    }
  } catch (error) {
    console.error(error), next(error);
  }
};

const updateStatusContact = async (req, res, next) => {
  const id = req.params.contactId;
  const { favorite = false } = req.body;

  try {
    const result = await service.updateContact(
      id,
      { favorite: favorite },
      req.user._id
    );
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not found",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await service.removeContact(id, req.user._id);
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { contact: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not found",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  addContact,
  updateContact,
  updateStatusContact,
  removeContact,
};
