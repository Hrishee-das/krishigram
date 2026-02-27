// controllers/regionController.js
import Region from "../models/regionModels.js";

export const getRegions = async (req, res) => {
  const regions = await Region.find().sort({ name: 1 });
  res.json({
    success: true,
    data: regions
  });
};