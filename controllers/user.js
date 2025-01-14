const ObjectId = require("mongoose").Types.ObjectId;
const md5 = require("md5");

const Estore = require("../models/estore");
const User = require("../models/user");
const UserResell = require("../models/userresell");

const { populateUsers } = require("./common");

exports.getUserDetails = async (req, res) => {
  const email = req.user.email;
  const estoreid = req.headers.estoreid;
  const resellid = req.params.resellid;
  let wishlist = [];
  let addiv3 = {};

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
      if (user.wishlist && user.wishlist.length > 0) {
        wishlist = await populateWishlist(user.wishlist, estoreid);
      }
      if (user.address && user.address.addiv3 && user.address.addiv3._id) {
        addiv3 = await populateAddress(user.address.addiv3, estoreid);
        res.json({
          ...user._doc,
          wishlist,
          address: { ...user.address, addiv3 },
        });
      } else {
        res.json({ ...user._doc, wishlist });
      }
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
        if (userWithReseller.wishlist && userWithReseller.wishlist.length > 0) {
          wishlist = await populateWishlist(
            userWithReseller.wishlist,
            estoreid
          );
        }
        if (
          userWithReseller.address &&
          userWithReseller.address.addiv3 &&
          userWithReseller.address.addiv3._id
        ) {
          addiv3 = await populateAddress(
            userWithReseller.address.addiv3,
            estoreid
          );
          res.json({
            ...userWithReseller._doc,
            wishlist,
            address: { ...userWithReseller.address, addiv3 },
          });
        } else {
          res.json({ ...userWithReseller._doc, wishlist });
        }
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
          if (userWithEmail.wishlist && userWithEmail.wishlist.length > 0) {
            wishlist = await populateWishlist(userWithEmail.wishlist, estoreid);
          }
          if (
            userWithEmail.address &&
            userWithEmail.address.addiv3 &&
            userWithEmail.address.addiv3._id
          ) {
            addiv3 = await populateAddress(
              userWithEmail.address.addiv3,
              estoreid
            );
            res.json({
              ...userWithEmail._doc,
              wishlist,
              address: { ...userWithEmail.address, addiv3 },
            });
          } else {
            res.json({ ...userWithEmail._doc, wishlist });
          }
        } else {
          res.json({
            err: "The email doesn't exist in this store.",
          });
        }
      }
    }
  } catch (error) {
    res.json({ err: "Fetching user information fails. " + error.message });
  }
};

exports.getResellerUsers = async (req, res) => {
  const resellid = req.params.resellid;

  try {
    const { sortkey, sort, currentPage, pageSize, searchQuery, masterUser } =
      req.body;

    let searchObj = searchQuery
      ? masterUser
        ? {
            $text: { $search: searchQuery },
            role: "admin",
          }
        : {
            $text: { $search: searchQuery },
            role: "admin",
            resellid: new ObjectId(resellid),
          }
      : masterUser
      ? { role: "admin" }
      : { role: "admin", resellid: new ObjectId(resellid) };

    let owners = await UserResell(resellid)
      .find(searchObj)
      .populate("estoreid")
      .skip((currentPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();

    let countOwners = {};

    if (owners.length === 0 && searchQuery) {
      owners = await UserResell(resellid)
        .find(
          masterUser
            ? {
                email: searchQuery,
                role: "admin",
              }
            : {
                email: searchQuery,
                role: "admin",
                resellid: new ObjectId(resellid),
              }
        )
        .populate("estoreid")
        .skip((currentPage - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize)
        .exec();
      countOwners = await UserResell(resellid)
        .countDocuments(
          masterUser
            ? {
                email: searchQuery,
                role: "admin",
              }
            : {
                email: searchQuery,
                role: "admin",
                resellid: new ObjectId(resellid),
              }
        )
        .exec();
    } else {
      countOwners = await UserResell(resellid).countDocuments(searchObj).exec();
    }

    owners = await populateUsers(owners, resellid);

    res.json({ owners, count: countOwners });
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
