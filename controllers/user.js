const ObjectId = require("mongoose").Types.ObjectId;
const md5 = require("md5");

const Estore = require("../models/estore");
const User = require("../models/user");
const UserResell = require("../models/userresell");

const {
  populateUsers,
  populateWishlist,
  populateAddress,
} = require("./common");

exports.getUserDetails = async (req, res) => {
  const email = req.user.email;
  const estoreid = req.headers.estoreid;
  const resellid = req.params.resellid;

  try {
    const user = await User.findOne({
      email,
      estoreid: new ObjectId(estoreid),
      resellid: new ObjectId(resellid),
    })
      .populate({
        path: "estoreid",
        populate: {
          path: "country",
        },
      })
      .select("-password -showPass -verifyCode")
      .exec();
    if (user) {
      res.json(user);
    } else {
      let userWithReseller = await User.findOne({
        email,
        resellid: new ObjectId(resellid),
      })
        .populate({
          path: "estoreid",
          populate: {
            path: "country",
          },
        })
        .select("-password -showPass -verifyCode")
        .exec();

      if (
        userWithReseller &&
        !userWithReseller.estoreid &&
        process.env.ESTORE_TYPE === "dedicated"
      ) {
        const oldEstore = await Estore.findOne().exec();
        await User.updateOne(
          {
            email,
          },
          { $set: { estoreid: new ObjectId(oldEstore._id) } }
        ).exec();
        userWithReseller = { ...userWithReseller, estoreid: oldEstore };
      }

      if (userWithReseller) {
        res.json(userWithReseller);
      } else {
        const userWithEmail = await User.findOne({
          email,
          estoreid: new ObjectId(estoreid),
        })
          .populate({
            path: "estoreid",
            populate: {
              path: "country",
            },
          })
          .select("-password -showPass -verifyCode")
          .exec();
        if (userWithEmail) {
          res.json(userWithEmail);
        } else {
          res.json({
            err: "The email doesn't exist in this store.",
          });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
    res.json({ err: "Fetching user information fails. " + error.message });
  }
};

exports.getResellerUsers = async (req, res) => {
  const resellid = req.params.resellid;

  try {
    const { sortkey, sort, currentPage, pageSize, searchQuery, masterUser } =
      req.body;

    let ownersResult = [];
    let owners = [];
    let countResult = 0;
    let countOwners = 0;

    const searchObj = masterUser
      ? { role: "admin" }
      : { resellid: new ObjectId(resellid), role: "admin" };

    if (searchQuery) {
      searchObj.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
        { phone: { $regex: searchQuery, $options: "i" } },
        { address: { $regex: searchQuery, $options: "i" } },
      ];
    }

    ownersResult = await UserResell(resellid)
      .find(searchObj)
      .populate("estoreid")
      .skip((currentPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();

    owners = [...owners, ...ownersResult];

    countResult = await UserResell(resellid).countDocuments(searchObj).exec();

    owners = await populateUsers(owners, resellid);

    res.json({ owners, count: countResult });
  } catch (error) {
    res.json({ err: "Fetching users fails. " + error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const resellid = req.headers.resellid;
  const userid = req.params.userid;

  try {
    await UserResell(resellid).findOneAndUpdate(
      { _id: new ObjectId(userid), estoreid: new ObjectId(estoreid) },
      req.body,
      {
        new: true,
      }
    );

    res.json({ ok: true });
  } catch (error) {
    res.json({ err: "Updating user fails. " + error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const resellid = req.headers.resellid;
  const userid = req.params.userid;

  try {
    const user = await UserResell(resellid).findOneAndUpdate(
      {
        _id: new ObjectId(userid),
        estoreid: new ObjectId(estoreid),
      },
      {
        password: md5("Grocery@2000"),
      },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.json({ err: "Reseting password for a user fails. " + error.message });
  }
};
