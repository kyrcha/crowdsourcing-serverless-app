const VoteSession = require("../../../models/voteSession.js");
const Comparison = require("../../../models/comparison.js");
const { connect } = require("../../_mongoose");
const {
  numberOfComparisons,
  answerQualityControls,
} = require("../../../config");

// check if the vote session passes the answer quality control
function checkIfVoteSessionIsAccepted(votes) {
  // get the answer quality control comparisons
  let answerControlIndex1 = numberOfComparisons / answerQualityControls - 1;
  let answerControlIndex2 = numberOfComparisons - 1;

  let votesSegment1 = votes.slice(0, answerControlIndex1);
  let votesSegment2 = votes.slice(answerControlIndex1 + 1, answerControlIndex2);

  let controlVote1 = votes[answerControlIndex1];
  let controlVote2 = votes[answerControlIndex2];

  // check if the user gave correct answer to the control comparisons
  let answerIsAccepted1 = false;
  for (let index = 0; index < votesSegment1.length; index++) {
    if (
      votesSegment1[index].imL === controlVote1.imR &&
      votesSegment1[index].imR === controlVote1.imL
    ) {
      answerIsAccepted1 = votesSegment1[index].imC === controlVote1.imC;
      break;
    }
  }

  let answerIsAccepted2 = false;
  for (let index = 0; index < votesSegment2.length; index++) {
    if (
      votesSegment2[index].imL === controlVote2.imR &&
      votesSegment2[index].imR === controlVote2.imL
    ) {
      answerIsAccepted2 = votesSegment2[index].imC === controlVote2.imC;
      break;
    }
  }

  // the vote session is accepted only if all the control comparisons
  // were answered correctly
  return answerIsAccepted1 && answerIsAccepted2;
}

// remove the answer quality control comparisons from the votes array
function removeControlComparisons(votes) {
  let answerControlIndex1 = numberOfComparisons / answerQualityControls - 1;
  let answerControlIndex2 = numberOfComparisons - 1;

  votes.splice(answerControlIndex1, 1);
  votes.splice(answerControlIndex2 - 1, 1);

  return votes;
}

// add vote to vote session
module.exports = async (req, res) => {
  await connect();
  // process the votes of the user when the vote session is complete
  let _id = req.query.id;

  // get the votes of the vote session
  VoteSession.findOne({ _id: _id }, (err, doc) => {
    if (err) {
      res.status(400).send(err);
      console.log("Failed to find vote session for submission: " + _id);
    } else {
      let votes = doc.vot;

      // check if the vote session passes the answer quality control
      if (checkIfVoteSessionIsAccepted(votes)) {
        // mark the vote session as "accepted"
        VoteSession.findOneAndUpdate(
          { _id: _id },
          { $set: { acc: true } },
          (err, doc) => {
            if (err) {
              res.status(400).send(err);
              console.log("Failed to accept vote session: " + _id);
              console.log("Error message: " + err);
            } else {
              console.log("Accepted vote session successfully: " + _id);
            }
          }
        );

        // remove the answer quality control comparisons
        votes = removeControlComparisons(votes);

        // update the comparisons collection with the results of the vote session
        for (let index = 0; index < votes.length; index++) {
          let vote = votes[index];

          // if the user did not choose an image during a voting round,
          // a timeout occurred. In this case, the comparisons collection is
          // not updated for this particular comparison
          if (vote.imC !== -1) {
            let rowId, columnId;
            if (vote.imL > vote.imR) {
              rowId = vote.imL;
              columnId = vote.imR;
            } else {
              rowId = vote.imR;
              columnId = vote.imL;
            }

            let imageWonPropertyName = rowId === vote.imC ? "w1" : "w2";

            Comparison.findOneAndUpdate(
              { im1: rowId, im2: columnId },
              {
                $inc: {
                  [imageWonPropertyName]: 1,
                  t: 1,
                },
              },
              (err, doc) => {
                if (err) {
                  console.log(
                    `Error while updating comparison table (index ${index}): ` +
                      _id
                  );
                  res.status(400).send(err);
                } else {
                  console.log(
                    `Comparison table updated successfully (index ${index}): ` +
                      _id
                  );
                }
              }
            );
          }
        }
        res.status(200).send("Vote session was processed successfully: " + _id);
      } else {
        res.status(200).send("Vote session was not accepted: " + _id);
        console.log("Vote session was not accepted: " + _id);
      }
    }
  });
};
