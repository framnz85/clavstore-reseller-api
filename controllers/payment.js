const ObjectId = require("mongoose").Types.ObjectId;

const Payment = require("../models/payment");

exports.getPayments = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const payments = await Payment(estoreid).find({
      estoreid: new ObjectId(estoreid),
    });
    res.json(payments);
  } catch (error) {
    res.json({ err: "Getting payments fails. " + error.message });
  }
};

exports.addPayment = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const payment = await Payment(estoreid).collection.insertOne({
      ...req.body,
      estoreid: new ObjectId(estoreid),
    });
    res.json(payment);
  } catch (error) {
    res.json({ err: "Adding payment fails. " + error.message });
  }
};

exports.updatePayment = async (req, res) => {
  const payid = req.params.payid;
  const estoreid = req.headers.estoreid;
  try {
    await Payment(estoreid).findOneAndUpdate(
      {
        _id: new ObjectId(payid),
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

exports.deletePayment = async (req, res) => {
  const payid = req.params.payid;
  const estoreid = req.headers.estoreid;
  try {
    await Payment(estoreid).findOneAndDelete({
      _id: new ObjectId(payid),
    });
    res.json({ ok: true });
  } catch (error) {
    res.json({ err: "Creating package fails. " + error.message });
  }
};
