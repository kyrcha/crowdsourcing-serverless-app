const VoteSession = require("../../models/voteSession.js");
const Comparison = require("../../models/comparison.js");
const { connect } = require("../_mongoose");
const {
  timeLimitOfEachComparison,
  numberOfComparisons,
  answerQualityControls,
} = require("../../config");

// generate a random integer number between [low, high)
function randomInteger(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

module.exports = async (req, res) => {
  await connect();

  // create a new document and save the time/date that
  // the vote session started
  let voteSession = new VoteSession(req.body);
  voteSession
    .save()
    // select the comparisons that will be displayed in the vote session
    .then((voteSession) => {
      const numberOfComparisonsToSelect =
        numberOfComparisons - answerQualityControls;

      // get the comparisons that have been displayed less
      Comparison.find(
        { u: false },
        { _id: 1, im1: 1, im2: 1 },
        { sort: { t: 1 }, limit: numberOfComparisonsToSelect },
        (err, docs) => {
          if (err) {
            res.status(400).send(err);
            console.log("Failed to select images: " + voteSession.id);
            console.log(err);
          } else {
            // imageLeftIds and imageRightIds contain the image pairs that will
            // be compared. imageLeftIds contains the images that will be
            // displayed on the left and imageRightIds the images that will be
            // displayed on the right.
            let imageLeftIds = [];
            let imageRightIds = [];

            // determine randomly the position (left or right) that images will
            // be displayed
            let imageOrder = Math.random() > 0.5 ? true : false;

            for (let i = 0; i < docs.length; i++) {
              if (imageOrder) {
                imageLeftIds.push(docs[i].im1);
                imageRightIds.push(docs[i].im2);
              } else {
                imageLeftIds.push(docs[i].im2);
                imageRightIds.push(docs[i].im1);
              }
            }

            // add the answer quality control comparisons. These comparisons
            // are selected randomly from imageLeftIds and imageRightIds arrays
            let answerControlIndex1 =
              numberOfComparisons / answerQualityControls - 1;
            let answerControlIndex2 = numberOfComparisons - 1;

            let controlComparisonIndex1 = randomInteger(
              0,
              answerControlIndex1 - 1
            );
            let controlComparisonIndex2 = randomInteger(
              answerControlIndex1 + 1,
              answerControlIndex2 - 1
            );

            imageLeftIds.splice(
              answerControlIndex1,
              0,
              imageRightIds[controlComparisonIndex1]
            );
            imageRightIds.splice(
              answerControlIndex1,
              0,
              imageLeftIds[controlComparisonIndex1]
            );

            imageLeftIds.splice(
              answerControlIndex2,
              0,
              imageRightIds[controlComparisonIndex2]
            );
            imageRightIds.splice(
              answerControlIndex2,
              0,
              imageLeftIds[controlComparisonIndex2]
            );

            res.status(200).send({
              _id: voteSession.id,
              imageLeftIds: imageLeftIds,
              imageRightIds: imageRightIds,
            });

            console.log("\nNew vote session started: " + voteSession.id);
          }
        }
      )

        // mark the comparisons that are currently used by the vote session as "used",
        // so they are not selected by another vote session. After a time interval,
        // the comparisons will be marked again as "not used".
        .then((docs) => {
          docs.forEach((doc) => {
            Comparison.updateOne(
              { _id: doc._id },
              { $set: { u: true } },
              (err) => {
                if (err) {
                  console.log(
                    "Error occurred while updating the comparisons selected: " +
                      err
                  );
                }

                // timeout time in milliseconds
                const timeoutTime =
                  (numberOfComparisons + 1) * timeLimitOfEachComparison * 1000 +
                  2000;

                setTimeout(() => {
                  docs.forEach((doc) => {
                    Comparison.updateOne(
                      { _id: doc._id },
                      { $set: { u: false } },
                      (err) => {
                        if (err) {
                          console.log(
                            "Error occurred while updating the comparisons selected: " +
                              err
                          );
                        }
                      }
                    );
                  });
                }, timeoutTime);
              }
            );
          });
        });
    })
    .catch((err) => {
      res.status(400).send("Failed to add new voteSession");
      console.log("Failed to start new vote session");
      console.log(err);
    });
};
