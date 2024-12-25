const User = require("../models/user");
const Package = require("../models/package");
const Payment = require("../models/payment");
const UserResell = require("../models/userresell");
const EstoreResell = require("../models/estoreresell");

exports.populateEstore = async (estores) => {
  let estoreids = [];

  estores = estores.map((estore) => {
    estoreids.push(estore._id);
    return estore;
  });

  const ownerList = await User.find({
    estoreid: { $in: estoreids },
    role: "admin",
  }).exec();

  estores = estores.map((estore) => {
    return {
      ...(estore._doc ? estore._doc : estore),
      owner: ownerList.find(
        (owner) =>
          estore._id &&
          owner.estoreid &&
          owner.estoreid.toString() === estore._id.toString()
      ),
    };
  });

  return estores;
};

exports.populateEstoreResell = async (estoreid, estores) => {
  let estoreids = [];

  estores = estores.map((estore) => {
    estoreids.push(estore._id);
    return estore;
  });

  const ownerList = await UserResell(estoreid)
    .find({
      estoreid: { $in: estoreids },
      role: "admin",
    })
    .exec();

  estores = estores.map((estore) => {
    return {
      ...(estore._doc ? estore._doc : estore),
      owner: ownerList.find(
        (owner) =>
          estore._id &&
          owner.estoreid &&
          owner.estoreid.toString() === estore._id.toString()
      ),
    };
  });

  return estores;
};

exports.populateBilling = async (billings, estoreid) => {
  let packids = [];
  let payids = [];
  let estoreids = [];

  billings = billings.map((bill) => {
    packids.push(bill.package);
    payids.push(bill.bank);
    estoreids.push(bill.estoreid);
    return bill;
  });

  const packageList = await Package(estoreid)
    .find({
      _id: { $in: packids },
    })
    .exec();

  const paymentList = await Payment(estoreid)
    .find({
      _id: { $in: payids },
    })
    .exec();

  const estoreList = await EstoreResell(estoreid)
    .find({
      _id: { $in: estoreids },
    })
    .exec();

  billings = billings.map((bill) => {
    return {
      ...(bill._doc ? bill._doc : bill),
      package: packageList.find(
        (pack) =>
          bill.package &&
          pack._id &&
          pack._id.toString() === bill.package.toString()
      ),
      bank: paymentList.find(
        (pay) =>
          bill.bank && pay._id && pay._id.toString() === bill.bank.toString()
      ),
      estoreid: estoreList.find(
        (store) =>
          bill.bank &&
          store._id &&
          store._id.toString() === bill.estoreid.toString()
      ),
    };
  });

  return billings;
};

exports.populateUsers = async (users, estoreid) => {
  let estoreids = [];

  users = users.map((user) => {
    estoreids.push(user.estoreid);
    return user;
  });

  const estoreList = await EstoreResell(estoreid)
    .find({
      _id: { $in: estoreids },
    })
    .exec();

  users = users.map((user) => {
    return {
      ...(user._doc ? user._doc : user),
      estoreid: estoreList.find(
        (estore) =>
          user.estoreid &&
          estore._id &&
          estore._id.toString() === user.estoreid.toString()
      ),
    };
  });

  return users;
};
