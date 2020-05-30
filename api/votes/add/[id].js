const VoteSession = require("../../../models/voteSession.js");
const { connect } = require("../../_mongoose");

// add vote to vote session
module.exports = async (req, res) => {
  await connect();
  let _id = req.query.id;

  // find the current vote session and add the result of a comparison
  VoteSession.findOneAndUpdate(
    { _id: _id },
    { $push: { vot: req.body } },
    (err, doc) => {
      if (err) {
        res.status(400).send(err);
        console.log("Failed to add vote to vote session: " + _id);
        console.log("Error message: " + err);
      } else {
        res.status(200).send("Vote added successfully: " + _id);
        console.log("Vote added successfully: " + _id);
      }
    }
  );
};
