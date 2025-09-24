import express, {request, response} from "express";
import {DiseasesRecord} from "../../models/Disease Tracking Models/DiseasesModel.js";
import moment from "moment";
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { protect, authorize } from "../../middleware/auth.js";


const router = express.Router();
//assigning a value 31 days before to an object which stores current date
const monthAgo = moment().subtract(31, 'days').format("YYYY-MM-DD");

router.get('/untreatedPlants', protect, authorize('user'),asyncHandler(async (request, response) => {
        //aggregates data from MongoDB
        const sumTreesAffected = await DiseasesRecord.aggregate([
            {
                $match: {
                    status: "Not Treated",
                    date: { $gte: monthAgo}
                } // Filter documents with status "Not Treated"
            },
            {
                //groups filtered data and get the sum of plant count
                $group: {
                    _id: null,
                    totalTreesAffected: { $sum: "$plant_count" } // Sum the plant_count field
                }
            }
        ]);

        console.log("Aggregation Result:", sumTreesAffected); // Log aggregation result for debugging

        // Extract the total trees affected from the aggregation result
        const totalTreesAffected = sumTreesAffected.length > 0 ? sumTreesAffected[0].totalTreesAffected : 0;

        return response.success({ totalTreesAffected });
}));

router.get('/recoveredPlants',protect, authorize('user'), asyncHandler(async (request, response) => {
        //aggregates data from MongoDB
        const sumTreesAffected = await DiseasesRecord.aggregate([
            {
                $match: {
                    status: "Recovered",
                    date: {$gte: monthAgo}
                } // Filter documents with status "Recovered"
            },
            {
                //groups filtered data and get the sum of plant count
                $group: {
                    _id: null,
                    totalTreesAffected: { $sum: "$plant_count" } // Sum the plant_count field
                }
            }
        ]);

        console.log("Aggregation Result:", sumTreesAffected); // Log aggregation result for debugging

        // Extract the total trees affected from the aggregation result
        const totalTreesAffected = sumTreesAffected.length > 0 ? sumTreesAffected[0].totalTreesAffected : 0;

        return response.success({ totalTreesAffected });
}));

router.get('/underTreatmentPlants',protect, authorize('user'), asyncHandler(async (request, response) => {
        //aggregates data from MongoDB
        const sumTreesAffected = await DiseasesRecord.aggregate([
            {
                $match: {
                    status: "Under Treatment",
                    date: {$gte: monthAgo}
                } // Filter documents with status "Under treatment"
            },
            {
                //groups filtered data and get the sum of plant count
                $group: {
                    _id: null,
                    totalTreesAffected: { $sum: "$plant_count" } // Sum the plant_count field
                }
            }
        ]);

        console.log("Aggregation Result:", sumTreesAffected); // Log aggregation result for debugging

        // Extract the total trees affected from the aggregation result
        const totalTreesAffected = sumTreesAffected.length > 0 ? sumTreesAffected[0].totalTreesAffected : 0;

        return response.success({ totalTreesAffected });
}));

export default router;