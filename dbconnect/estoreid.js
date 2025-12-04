const estoreid1 = [
  "66dd4ca828a6ce0ba1a696e0",
  "613216389261e003d696cc65",
  "675403abc7a3632df514d5fc",
  "677b30364223a4c3cec394dc",
  "6745503c1b6db62f0e7e9d94",
  "67d8cdd3391083e7c0c4960d",
  "684dc805b98789f0c822e3c3",
];

const estoreid2 = ["66180257fd06884019423dbe", "67262902fc9b3d9326cd9e63"];

const estoreid3 = ["68674af77ec6ae28ef74cf67"];

const estoreid = [
  {
    estore: estoreid1,
    database: process.env.RESELLER_DATABASE1,
    extension: process.env.DATABASE_EXTENSION,
  },
  {
    estore: estoreid2,
    database: process.env.RESELLER_DATABASE2,
    extension: process.env.DATABASE_EXTENSION,
  },
  {
    estore: estoreid3,
    database: process.env.RESELLER_DATABASE3,
    extension: process.env.DATABASE_EXTENSION,
  },
];

module.exports = estoreid;
