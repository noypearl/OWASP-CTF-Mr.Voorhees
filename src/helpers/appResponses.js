module.exports = {
  responseByStatus: (res, status) => {
    res.status(status.code).send(status.name);
  },
};
