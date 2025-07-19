const ObjectId = require("mongoose").Types.ObjectId;

const Store = require("../../models/ingreventory/ingstore");

exports.getstores = async (req, res) => {
  try {
    const { sortBy, sortOrder, page, limit, search } = req.query;

    let storeResult = [];
    let stores = [];
    let countResult = 0;
    let countstores = 0;

    let searchObj = search
      ? masterUser
        ? { $text: { $search: search } }
        : {
            $text: { $search: search },
          }
      : {};

    storeResult = await Store.find(searchObj)
      .skip((page - 1) * limit)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .exec();

    stores = [...stores, ...storeResult];

    if (stores.length < 3 && search) {
      storeResult = await Store.find(
        masterUser
          ? {
              email: search,
            }
          : {
              email: search,
            }
      )
        .skip((page - 1) * limit)
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .exec();

      stores = [...stores, ...storeResult];

      countResult = await Store.countDocuments(
        masterUser
          ? {
              email: search,
            }
          : {
              email: search,
            }
      ).exec();
      countstores = countstores + countResult;
    }

    if (stores.length < 3 && search && ObjectId.isValid(search)) {
      storeResult = await Store.find(
        masterUser
          ? {
              _id: new ObjectId(search),
            }
          : {
              _id: new ObjectId(search),
            }
      )
        .skip((page - 1) * limit)
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .exec();

      stores = [...stores, ...storeResult];

      countResult = await Store.countDocuments(
        masterUser
          ? {
              _id: new ObjectId(search),
            }
          : {
              _id: new ObjectId(search),
            }
      ).exec();
      countstores = countstores + countResult;
    } else {
      countResult = await Store.countDocuments(searchObj).exec();
      countstores = countstores + countResult;
    }

    res.json({ stores, count: countstores });
  } catch (error) {
    console.log(error.message);
    res.json({ err: "Fetching stores fails. " + error.message });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const storeId = req.params.id;
    const updateData = req.body;

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        $set: updateData,
      },
      { new: true }
    );

    if (!updatedStore) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    res.json({ success: true, data: updatedStore });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update store",
      error: error.message,
    });
  }
};
