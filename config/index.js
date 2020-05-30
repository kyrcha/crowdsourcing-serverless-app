function throwErr(msg) {
  throw new Error(msg);
}

const global = {
  // number of comparisons that will be displayed in a vote session
  paMongoDBUri:
    process.env["CALISTA_MONGODB_URI"] ||
    throwErr("CALISTA_MONGODB_URI is unset"),
  answerQualityControls: 2,
  // number of comparisons that are used for answer quality control
  numberOfComparisons:
    parseInt(process.env.REACT_APP_VOTING_ROUNDS) ||
    throwErr("REACT_APP_VOTING_ROUNDS is unset"),
  // time limit for each voting round (in seconds)
  timeLimitOfEachComparison:
    parseInt(process.env.REACT_APP_VOTING_TIME) ||
    throwErr("REACT_APP_VOTING_TIME is unset"),
};

module.exports = global;
