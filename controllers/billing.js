const ObjectId = require("mongoose").Types.ObjectId;
const Billing = require("../models/billing");
const Estore = require("../models/estoreresell");

const { populateBilling } = require("./common");

exports.getBillingsByEstore = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const estoreid2 = req.params.estoreid;

  try {
    let billings = await Billing(estoreid)
      .find({ estoreid: new ObjectId(estoreid2) })
      .sort({ deadline: 1 });
    billings = await populateBilling(billings, estoreid);
    res.json({ billings });
  } catch (error) {
    res.json({ err: "Getting billings fails. " + error.message });
  }
};

exports.getNotRemitted = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    let billings = await Billing(estoreid)
      .find({ status: "Paid", billStatus: "Not Billed" })
      .sort({ billDeadline: 1 })
      .select("_id estoreid package packageDesc totalAmount billDeadline");

    billings = await populateBilling(billings, estoreid);

    res.json(
      billings.map((bill) => {
        const packageType = bill.package.defaultPackage;
        delete bill.package;
        return { ...bill, packageType };
      })
    );
  } catch (error) {
    res.json({ err: "Getting not remitted fails. " + error.message });
  }
};

exports.getBillings = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const { sortkey, sort, currentPage, pageSize, status } = req.body;

    let billings = await Billing(estoreid)
      .find(status === "all" ? {} : { status })
      .skip((currentPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();

    billings = await populateBilling(billings, estoreid);

    const countBillings = await Billing(estoreid).countDocuments().exec();

    res.json({ billings, count: countBillings });
  } catch (error) {
    res.json({ err: "Getting billings fails. " + error.message });
  }
};

exports.createBilling = async (req, res) => {
  const resellid = req.headers.resellid;
  const estoreList = req.body.estoreList;
  let updateObj = {};

  try {
    const billing = await Billing(resellid).collection.insertOne({
      ...req.body,
      resellid,
    });
    await billing.save();

    for (i = 0; i < estoreList.length; i++) {
      if (estoreList[i].product === "Package A") {
        updateObj = { approval: "For Approval" };
      }
      if (estoreList[i].product === "Package B") {
        updateObj = { approval2: "For Approval" };
      }
      if (estoreList[i].product === "Package C") {
        updateObj = { approval3: "For Approval" };
      }

      await Estore(estoreList[i].estoreid)
        .findByIdAndUpdate(estoreList[i].estoreid, updateObj, {
          new: true,
        })
        .exec();
    }

    res.json(billing);
  } catch (error) {
    res.json({ err: "Creating billing fails. " + error.message });
  }
};

exports.updateBilling = async (req, res) => {
  const billid = req.params.billid;
  const estoreid = req.headers.estoreid;
  const resellid = req.headers.resellid;

  try {
    const billing = await Billing(resellid).findOneAndUpdate(
      {
        _id: Object(billid),
        estoreid: new ObjectId(estoreid),
      },
      req.body,
      { new: true }
    );
    if (billing) {
      res.json(billing);
    } else {
      res.json({ err: "No billing exist under ID: " + billid });
    }
  } catch (error) {
    res.json({ err: "Fetching billing information fails. " + error.message });
  }
};
