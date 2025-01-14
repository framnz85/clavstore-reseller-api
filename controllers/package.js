const ObjectId = require("mongoose").Types.ObjectId;
const Package = require("../models/package");

exports.getPackages = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const packages = await Package(estoreid).find();
    res.json(packages);
  } catch (error) {
    res.json({ err: "Getting packages fails. " + error.message });
  }
};

exports.addPackage = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const package = await Package(estoreid).collection.insertOne(req.body);
    res.json(package);
  } catch (error) {
    res.json({ err: "Creating package fails. " + error.message });
  }
};

exports.updatePackage = async (req, res) => {
  const packid = req.params.packid;
  const estoreid = req.headers.estoreid;
  try {
    await Package(estoreid).findOneAndUpdate(
      {
        _id: new ObjectId(packid),
      },
      req.body,
      {
        new: true,
      }
    );
    res.json({ ok: true });
  } catch (error) {
    res.json({ err: "Creating package fails. " + error.message });
  }
};

exports.deletePackage = async (req, res) => {
  const packid = req.params.packid;
  const estoreid = req.headers.estoreid;
  try {
    await Package(estoreid).findOneAndDelete({
      _id: new ObjectId(packid),
    });
    res.json({ ok: true });
  } catch (error) {
    res.json({ err: "Creating package fails. " + error.message });
  }
};
