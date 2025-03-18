const ObjectId = require("mongoose").Types.ObjectId;
const Remittance = require("../models/remittance");
const Billing = require("../models/billing");
const User = require("../models/user");

exports.getRemittancess = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const resellid = req.headers.resellid;

  try {
    const { sortkey, sort, currentPage, pageSize } = req.body;

    let remittances = [];

    if (estoreid === resellid) {
      remittances = await Remittance.find()
        .populate("estoreid userid")
        .skip((currentPage - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize)
        .exec();
    } else {
      remittances = await Remittance.find({
        estoreid: new ObjectId(estoreid),
      })
        .populate("estoreid userid")
        .skip((currentPage - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize)
        .exec();
    }

    const countRemittances = await Remittance.countDocuments().exec();

    res.json({ remittances, count: countRemittances });
  } catch (error) {
    res.json({ err: "Getting remittances fails. " + error.message });
  }
};

exports.createRemittance = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const remittances = req.body.remittances;
  const totalAmount = req.body.totalAmount;
  const totalRemit = req.body.totalRemit;
  const email = req.user.email;

  try {
    let notRemmited = [];
    let alreadyRemmited = [];

    for (i = 0; i < remittances.length; i++) {
      const checkBill = await Billing(estoreid)
        .findOne({
          _id: new ObjectId(remittances[i]._id),
          status: "Paid",
          billStatus: "Billed",
        })
        .exec();

      if (checkBill) {
        alreadyRemmited.push(remittances[i]);
      } else {
        notRemmited.push(remittances[i]);
      }
    }

    if (alreadyRemmited.length > 0) {
      res.json({ remitted: alreadyRemmited });
    } else {
      const user = await User.findOne({
        email,
      }).exec();
      const remit = new Remittance({
        estoreid: new ObjectId(estoreid),
        userid: new ObjectId(user._id),
        remittances: notRemmited,
        totalAmount: totalAmount,
        totalRemit: totalRemit,
      });
      await remit.save();

      res.json({ ok: true });
    }
  } catch (error) {
    res.json({ err: "Creating remittances fails. " + error.message });
  }
};

exports.editRemittance = async (req, res) => {
  const remitid = req.params.remitid;
  const estoreid = req.headers.estoreid;
  const remittances = req.body.remittances;
  const totalAmount = req.body.totalAmount;
  const totalRemit = req.body.totalRemit;
  const email = req.user.email;

  try {
    let notRemmited = [];
    let alreadyRemmited = [];

    for (i = 0; i < remittances.length; i++) {
      const checkBill = await Billing(estoreid)
        .findOne({
          _id: new ObjectId(remittances[i]._id),
          status: "Paid",
          billStatus: "Billed",
        })
        .exec();

      if (checkBill) {
        alreadyRemmited.push(remittances[i]);
      } else {
        notRemmited.push(remittances[i]);
      }
    }

    if (alreadyRemmited.length > 0) {
      res.json({ remitted: alreadyRemmited });
    } else {
      const user = await User.findOne({
        email,
      }).exec();
      const finalRemittance = notRemmited.map((remit) => {
        return { ...remit, billid: new ObjectId(remit._id) };
      });
      await Remittance.findOneAndUpdate(
        { _id: new ObjectId(remitid), estoreid: new ObjectId(estoreid) },
        {
          remittances: finalRemittance,
          totalAmount: totalAmount,
          totalRemit: totalRemit,
        },
        {
          new: true,
        }
      );

      res.json({ ok: true });
    }
  } catch (error) {
    res.json({ err: "Editing remittances fails. " + error.message });
  }
};

exports.approveRemittance = async (req, res) => {
  const remitid = req.params.remitid;
  const estoreid = req.headers.estoreid;
  try {
    const result = await Remittance.findOne({
      _id: new ObjectId(remitid),
      estoreid: new ObjectId(estoreid),
    }).exec();
    const finalRemit = result.remittances;
    for (let i = 0; i < finalRemit.length; i++) {
      await Billing(estoreid)
        .findOneAndUpdate(
          {
            _id: new ObjectId(finalRemit[i]._id),
          },
          {
            billStatus: "Billed",
          },
          {
            new: true,
          }
        )
        .exec();
    }
    await Remittance.findOneAndUpdate(
      { _id: new ObjectId(remitid), estoreid: new ObjectId(estoreid) },
      {
        status: "Approved",
      },
      {
        new: true,
      }
    );
    res.json({ ok: true });
  } catch (error) {
    res.json({ err: "Approving remittances fails. " + error.message });
  }
};

exports.deleteRemittance = async (req, res) => {
  const remitid = req.params.remitid;
  const estoreid = req.headers.estoreid;
  try {
    await Remittance.findOneAndDelete({
      _id: new ObjectId(remitid),
      estoreid: new ObjectId(estoreid),
    });
    res.json({ ok: true });
  } catch (error) {
    res.json({ err: "Deleting remittances fails. " + error.message });
  }
};
