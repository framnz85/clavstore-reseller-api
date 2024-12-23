const ObjectId = require("mongoose").Types.ObjectId;

const User = require("../models/user");
const Withdraw = require("../models/withdraw");

exports.getAllAffiliates = async (req, res) => {
  const resellid = req.headers.resellid;
  try {
    const affiliates = [];

    const referralIds = await User.distinct("refid");

    for (let i = 0; i <= referralIds.length; i++) {
      const earnings = await User.aggregate([
        { $match: { refid: new ObjectId(referralIds[i]) } },
        { $group: { _id: null, amount: { $sum: "$refCommission" } } },
      ]);
      const withdrawal = await Withdraw(resellid).aggregate([
        {
          $match: {
            userid: new ObjectId(referralIds[i]),
            $or: [{ status: "Pending" }, { status: "Approved" }],
          },
        },
        { $group: { _id: null, amount: { $sum: "$amount" } } },
      ]);
      if (earnings && earnings[0] && earnings[0].amount) {
        const withdraw =
          withdrawal && withdrawal[0] && withdrawal[0].amount
            ? withdrawal[0].amount
            : 0;
        const balance = earnings[0].amount - withdraw;
        const user = await User.findOne({ _id: new ObjectId(referralIds[i]) });
        affiliates.push({
          _id: new ObjectId(referralIds[i]),
          name: user.name,
          earnings: earnings[0].amount,
          withdrawal: withdraw,
          balance,
        });
      }
    }

    const countAffiliates = await Withdraw.estimatedDocumentCount({});
    res.json({ affiliates, countAffiliates });
  } catch (error) {
    res.json({ err: "Saving withdrawal fails. " + error.message });
  }
};

exports.getAllWithdrawals = async (req, res) => {
  const resellid = req.headers.resellid;
  try {
    const { sortkey, sort, currentPage, pageSize } = req.body;
    const withdrawal = await Withdraw.find({})
      .skip((currentPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();

    const countWithdrawals = await Withdraw(resellid).estimatedDocumentCount(
      {}
    );
    res.json({ withdrawal, countWithdrawals });
  } catch (error) {
    res.json({ err: "Saving withdrawal fails. " + error.message });
  }
};
