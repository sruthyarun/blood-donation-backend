const express = require("express");
const router = express.Router();

const {
    createFeedback,
    getFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
} = require("../controllers/feedbackController");

router.post("/", createFeedback);
router.get("/", getFeedback);
router.get("/:id", getFeedbackById);
router.patch("/:id", updateFeedback);
router.delete("/:id", deleteFeedback);

module.exports = router;