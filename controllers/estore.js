const slugify = require("slugify");

const Estore = require("../models/estore");

exports.updateEstore = async (req, res) => {
  const estoreid = req.headers.estoreid;
  let values = req.body;
  const name = req.body.name;

  if (name) {
    values = {
      ...values,
      slug: slugify(name.toString().toLowerCase()),
    };
  }

  try {
    const estore = await Estore.findByIdAndUpdate(estoreid, values, {
      new: true,
    })
      .populate("country")
      .exec();
    if (!estore) {
      res.json({ err: "No eStore exist under ID: " + estoreid });
      return;
    }
    res.json(estore);
  } catch (error) {
    res.json({ err: "Fetching store information fails. " + error.message });
  }
};
