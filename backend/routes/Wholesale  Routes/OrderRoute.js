import express, {request, response} from "express";
import {Orders} from '../../models/Wholesale Models/OrderModel.js'
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";

const router = express.Router();

router.post('/', asyncHandler(async(request, response) =>{
        if(
            !request.body.orderId ||
            !request.body.orderProductName ||
            !request.body.orderDate ||
            !request.body.orderQuantity ||
            !request.body.orderPrice ||
            !request.body.orderProductPricePerKilo ||
            !request.body.orderStatus
        ){
            throw createValidationError('Send all required fields');
    }
        const newOrder = {
            orderId: request.body.orderId,
            orderProductName: request.body.orderProductName,
            orderDate: request.body.orderDate,
            orderQuantity: request.body.orderQuantity,
            orderPrice: request.body.orderPrice,
            orderProductPricePerKilo: request.body.orderProductPricePerKilo,
            orderStatus: request.body.orderStatus,
        };

        const order = await Orders.create(newOrder);
        return response.success(order, 201);
}));

router.get('/', asyncHandler(async (request,response) =>{
        const orderrecords = await Orders.find({});
        return response.success({
            count: orderrecords.length,
            data: orderrecords
        });
}));

router.put('/:id', asyncHandler(async (request, response) =>{
        if(
            !request.body.orderQuantity
        ){
            throw createValidationError('Send all required fields');
        }

        const {id} = request.params;

        const result = await Orders.findByIdAndUpdate(id, request.body, { new: true });

        if(!result){
            throw createNotFoundError('Order record');
        }
        return response.success({ message: 'Order record updated successfully', data: result });
}));

router.get('/:id', asyncHandler(async (request, response) =>{
        const {id} =request.params;

        const orderRecords = await Orders.findById(id);
        if (!orderRecords) throw createNotFoundError('Order record');
        return response.success(orderRecords);
}));

router.delete('/:id', asyncHandler(async(request, response) =>{
        const {id} = request.params;

        const result = await Orders.findByIdAndDelete(id);

        if(!result){
            throw createNotFoundError('Order record');
        }
        return response.success({message: 'Order Record delete Successfully'});
}));

export default router;