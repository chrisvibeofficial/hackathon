const planModel = require('../models/plan');


exports.createPlan = async (req, res) => {
  try {
    const { planName, amount, description, duration } = req.body;
    const existingPlan = await planModel.findOne({ planName: planName });

    if (existingPlan) {
      return res.status(400).json({
        message: 'Plan has been created already'
      })
    };

    let plan;

    if (duration > 1) {
      plan = new planModel({
        planName,
        amount: amount * duration,
        description,
        duration: `${duration} Months`
      })
    } else {
      plan = new planModel({
        planName,
        amount,
        description,
        duration: `${duration} Month`
      })
    };

    await plan.save();

    res.status(201).json({
      message: 'Plan created successfully',
      data: plan
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error creating plan'
    })
  }
};


exports.getAllPlans = async (req, res) => {
  try {
    const plans = await planModel.find();

    if (plans.length === 0) {
      return res.status(404).json({
        message: 'No plan created'
      })
    };

    res.status(200).json({
      message: 'All subscription plans',
      data: plans
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error getting all plans'
    })
  }
};


exports.getPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await planModel.findById(planId);

    if (!plan) {
      return res.status(404).json({
        message: 'Plan not found'
      })
    };

    res.status(200).json({
      message: 'Subscription plan',
      data: plan
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error getting plan'
    })
  }
};


exports.updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { planName, amount, description, duration } = req.body;
    const plan = await planModel.findById(planId);

    if (!plan) {
      return res.status(404).json({
        message: 'Plan not found'
      })
    };

    const data = {
      planName,
      amount,
      description,
      duration
    };

    const updatedPlan = await planModel.findByIdAndUpdate(plan._id, data, { new: true });

    res.status(200).json({
      message: 'Plan updated successfully',
      data: updatedPlan
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error updating plan'
    })
  }
};


exports.deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await planModel.findById(planId);

    if (!plan) {
      return res.status(404).json({
        message: 'Plan not found'
      })
    };

    const deletedPlan = await planModel.findByIdAndDelete(plan._id);

    res.status(200).json({
      message: 'Plan deleted successfully'
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Error deleting plan'
    })
  }
};