const ObjectId = require("mongoose").Types.ObjectId;
const SibApiV3Sdk = require("sib-api-v3-sdk");
const slugify = require("slugify");

const EstoreResell = require("../models/estoreresell");
const UserResell = require("../models/userresell");

const { populateEstoreResell } = require("./common");

exports.getEstore = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const estore = await EstoreResell(estoreid)
      .findOne({
        _id: new ObjectId(estoreid),
      })
      .exec();

    res.json(estore.reseller);
  } catch (error) {
    res.json({ err: "Fetching store fails. " + error.message });
  }
};

exports.getEstores = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const { sortkey, sort, currentPage, pageSize, searchQuery, masterUser } =
      req.body;

    let searchObj = searchQuery
      ? masterUser
        ? { $text: { $search: searchQuery } }
        : {
            $text: { $search: searchQuery },
            resellid: new ObjectId(estoreid),
            upgradeType: "1",
          }
      : masterUser
      ? {}
      : { resellid: new ObjectId(estoreid), upgradeType: "1" };

    let estores = await EstoreResell(estoreid)
      .find(searchObj)
      .skip((currentPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();

    let countEstores = {};

    if (estores.length === 0 && searchQuery) {
      estores = await EstoreResell(estoreid)
        .find(
          masterUser
            ? {
                email: searchQuery,
              }
            : {
                email: searchQuery,
                resellid: new ObjectId(estoreid),
                upgradeType: "1",
              }
        )
        .skip((currentPage - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize)
        .exec();
      countEstores = await EstoreResell(estoreid)
        .countDocuments(
          masterUser
            ? {
                email: searchQuery,
              }
            : {
                email: searchQuery,
                resellid: new ObjectId(estoreid),
                upgradeType: "1",
              }
        )
        .exec();
    }

    if (estores.length === 0 && searchQuery && new ObjectId(searchQuery)) {
      estores = await EstoreResell(estoreid)
        .find(
          masterUser
            ? {
                _id: new ObjectId(searchQuery),
              }
            : {
                _id: new ObjectId(searchQuery),
                resellid: new ObjectId(estoreid),
                upgradeType: "1",
              }
        )
        .skip((currentPage - 1) * pageSize)
        .sort({ [sortkey]: sort })
        .limit(pageSize)
        .exec();
      countEstores = await EstoreResell(estoreid)
        .countDocuments(
          masterUser
            ? {
                _id: new ObjectId(searchQuery),
              }
            : {
                _id: new ObjectId(searchQuery),
                resellid: new ObjectId(estoreid),
                upgradeType: "1",
              }
        )
        .exec();
    } else {
      countEstores = await EstoreResell(estoreid)
        .countDocuments(searchObj)
        .exec();
    }

    estores = await populateEstoreResell(estoreid, estores);

    res.json({ estores, count: countEstores });
  } catch (error) {
    res.json({ err: "Fetching stores fails. " + error.message });
  }
};

exports.getEstoresBilling = async (req, res) => {
  const estoreid = req.headers.estoreid;

  try {
    const { sortkey, sort, currentPage, pageSize } = req.body;

    let estores = await EstoreResell(estoreid)
      .find({
        resellid: new ObjectId(estoreid),
        $or: [
          { approval: "Pending" },
          { approval2: "Pending" },
          { approval3: "Pending" },
        ],
      })
      .skip((currentPage - 1) * pageSize)
      .sort({ [sortkey]: sort })
      .limit(pageSize)
      .exec();

    estores = await populateEstoreResell(estoreid, estores);

    countEstores = await EstoreResell(estoreid)
      .find({
        resellid: new ObjectId(estoreid),
        $or: [
          { approval: "Pending" },
          { approval2: "Pending" },
          { approval3: "Pending" },
        ],
      })
      .exec();

    res.json({ estores, count: countEstores.length });
  } catch (error) {
    res.json({ err: "Fetching store billing fails. " + error.message });
  }
};

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
    const estore = await EstoreResell(estoreid)
      .findByIdAndUpdate(estoreid, values, {
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

exports.approveCosmic = async (req, res) => {
  const estoreid = req.headers.estoreid;
  try {
    const estore = await EstoreResell(estoreid).findByIdAndUpdate(
      req.body._id,
      req.body,
      {
        new: true,
      }
    );
    if (estore) {
      const email = req.body.email;
      const name = req.body.name;
      const defaultClient = SibApiV3Sdk.ApiClient.instance;

      let apiKey = defaultClient.authentications["api-key"];
      apiKey.apiKey = process.env.BREVO_APIKEY;

      let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

      sendSmtpEmail = {
        to: [
          {
            email,
            name,
          },
        ],
        templateId: 208,
        headers: {
          "X-Mailin-custom":
            "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
        },
      };

      apiInstance.sendTransacEmail(sendSmtpEmail).then(
        function (data) {
          //
        },
        function (error) {
          res.json({ err: "Sending welcome email fails. " + error.message });
        }
      );

      res.json({ ok: true });
    } else {
      res.json({ err: "Updating was not successful" });
    }
  } catch (error) {
    res.json({ err: "Fetching store information fails. " + error.message });
  }
};

exports.updateEstoreReseller = async (req, res) => {
  const upestoreid = req.headers.upestoreid;
  const estoreid = req.headers.estoreid;
  let values = req.body;

  try {
    const estore = await EstoreResell(estoreid)
      .findByIdAndUpdate(upestoreid, values, {
        new: true,
      })
      .populate("country")
      .exec();
    if (!estore) {
      res.json({ err: "No store exist under ID: " + upestoreid });
      return;
    }
    res.json(estore);
  } catch (error) {
    res.json({ err: "Fetching store information fails. " + error.message });
  }
};

exports.updateAffiliate = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const refid = req.params.refid;
  let values = req.body;

  try {
    const user = await UserResell(estoreid)
      .findOne({ _id: new ObjectId(refid) })
      .exec();
    await EstoreResell(estoreid)
      .findByIdAndUpdate(user.estoreid, values, {
        new: true,
      })
      .exec();
    res.json({ ok: true });
  } catch (error) {
    res.json({ err: "Updating affiliate fails. " + error.message });
  }
};
