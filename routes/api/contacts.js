const express = require("express");
const router = express.Router();
const contacts = require("../../models/contacts");
const { nanoid } = require("nanoid");

router.get("/", async (req, res, next) => {
  const contactList = await contacts.listContacts();
  res.json({ status: "success", code: 200, data: contactList });
});

// router.get('/:contactId', async (req, res, next) => {
//   res.json({ message: 'template message' })
// })

router.get("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  const contact = await contacts.getContactById(contactId);
  if (contact === undefined) {
    res.json({
      status: "error",
      code: 404,
      message: "Not found",
    });
  } else {
    res.json({
      status: "success",
      code: 200,
      data: contact,
    });
  }
});

router.post("/", async (req, res, next) => {
  if (req.body.name && req.body.email && req.body.phone) {
    req.body.id = nanoid();
    contacts.addContact(req.body);

    res.json({
      status: "success",
      code: 201,
      data: req.body,
    });
  } else {
    res.json({
      status: "error",
      code: 400,
      message: "missing required field",
    });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  let contactId = req.params.contactId;
  let deleted = false;
  if (contactId) {
    deleted = await contacts.removeContact(contactId);
  }

  if (deleted) {
    res.json({
      status: "success",
      code: 200,
      message: "contact deleted",
    });
  } else {
    res.json({
      status: "error",
      code: 404,
      message: "Not found",
    });
  }
});

router.put("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  if (req.body && contactId) {
    const updatedcontact = await contacts.updateContact(contactId, req.body);
    if (updatedcontact) {
      res.json({
        status: "success",
        code: 200,
        data: updatedcontact,
      });
    } else {
      res.json({
        status: "error",
        code: 404,
        message: "Not found",
      });
    }
  } else {
    res.json({
      status: "error",
      code: 400,
      message: "missing fields",
    });
  }
});

module.exports = router;
