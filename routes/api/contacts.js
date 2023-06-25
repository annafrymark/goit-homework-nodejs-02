const express = require("express");
const { auth } = require("./user");
const router = express.Router();
const controllContact = require("../../controller");

router.get("/", auth, controllContact.getAll);

router.get("/:contactId", auth, controllContact.getById);

router.post("/", auth, controllContact.addContact);

router.delete("/:contactId", auth, controllContact.removeContact);

router.put("/:contactId", auth, controllContact.updateContact);

router.patch("/:contactId/favorite", auth, controllContact.updateStatusContact);

module.exports = router;
