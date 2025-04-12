const Package = require("../models/package");
const Payment = require("../models/payment");
const UserResell = require("../models/userresell");
const EstoreResell = require("../models/estoreresell");

exports.populateEstoreResell = async (estoreid, estores) => {
  let estoreids = [];
  let packids = [];
  let packids2 = [];

  estores = estores.map((estore) => {
    estoreids.push(estore._id);
    packids.push(estore.upPackage);
    packids2.push(estore.upPackage2);
    return estore;
  });

  const ownerList = await UserResell(estoreid)
    .find({
      estoreid: { $in: estoreids },
      role: "admin",
    })
    .exec();

  const packageList = await Package(estoreid)
    .find({
      _id: { $in: packids },
    })
    .exec();

  const packageList2 = await Package(estoreid)
    .find({
      _id: { $in: packids2 },
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
      upPackage: packageList.find(
        (pack) =>
          estore.upPackage &&
          pack._id &&
          pack._id.toString() === estore.upPackage.toString()
      ),
      upPackage2: packageList2.find(
        (pack) =>
          estore.upPackage &&
          pack._id &&
          pack._id.toString() === estore.upPackage.toString()
      ),
    };
  });

  return estores;
};

exports.populateBilling = async (billings, estoreid) => {
  let packids = [];
  let payids = [];
  let estoreids = [];
  let userids = [];

  billings = billings.map((bill) => {
    packids.push(bill.package);
    payids.push(bill.bank);
    estoreids.push(bill.estoreid);
    userids.push(bill.userid);
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

  const userList = await UserResell(estoreid)
    .find({
      _id: { $in: userids },
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
          bill.estoreid &&
          store._id &&
          store._id.toString() === bill.estoreid.toString()
      ),
      userid: userList.find(
        (user) =>
          bill.userid &&
          user._id &&
          user._id.toString() === bill.userid.toString()
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
