const express = require("express");

const router = express.Router();
const controllContact = require("../../controller");

router.get("/", controllContact.getAll);

router.get("/:contactId", controllContact.getById);

router.post("/", controllContact.addContact);

router.delete("/:contactId", controllContact.removeContact);

router.put("/:contactId", controllContact.updateContact);

router.patch("/:contactId/favorite", controllContact.updateStatusContact);

module.exports = router;
