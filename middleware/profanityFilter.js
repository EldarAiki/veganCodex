const leoProfanity = require("leo-profanity");

const checkProfanity = (req, res, next) => {
  leoProfanity.add(["veganhater", "meatlover"]);

  const fieldsToCheck = ["name", "description", "text", "content"];
  const hasProfanity = fieldsToCheck.some(
    (field) => req.body[field] && leoProfanity.check(req.body[field])
  );

  if (hasProfanity) {
    return res.status(400).json({
      error: "Content contains inappropriate language. Please revise.",
    });
  }

  next();
};

module.exports =  checkProfanity ;
