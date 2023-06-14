const service = require("../service");

const getAll = async (req, res, next) => {
  try {
    const contacts = await service.listContacts();
    res.json({
      status: "success",
      code: 200,
      data: { contacts },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const getById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await service.getContactById(id)
        if (result) {
            res.json({
              status: "success",
              code: 200,
              data: { contact: result },
            });
        } else {
            res.status(404).json({
                status: 'error',
                code: 404,
                message: `Not found contact id: ${id}`,
                data: 'Not found'
            })
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
};
