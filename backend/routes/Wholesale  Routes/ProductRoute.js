import express, {request, response} from "express";
import { Products } from '../../models/Wholesale Models/ProductModel.js';
import { asyncHandler } from "../../middleware/errorMiddleware.js";
import { createNotFoundError, createValidationError } from "../../utils/errors.js";
// import upload from "../../ProductPictures/Pictures.js";


const router = express.Router();

router.post('/', asyncHandler(async (request, response) => {
        if (
            !request.body.productID ||
            !request.body.productName ||
            !request.body.productDescription ||
            !request.body.productQuantity ||
            !request.body.productPrice
            // !request.file
        ) {
            throw createValidationError('Send all required fields');
        }

        const newProduct = {
            productID: request.body.productID,
            productName: request.body.productName,
            productDescription: request.body.productDescription,
            productQuantity: request.body.productQuantity,
            productPrice: request.body.productPrice,
            // productImage: request.file.path,
        };

        const product = await Products.create(newProduct);
        return response.success(product, 201);
}));


router.get('/', asyncHandler(async (request, response) => {
        const productrecords = await Products.find({});
        return response.success({
            count: productrecords.length,
            data: productrecords
        });
}));




router.get('/:id', asyncHandler(async(request,response) =>{
        const  {id} = request.params;

        // if(!id){
        //     return response.status(400).json({ message: 'ID parameter is required' });
        // }

        const  productRecords = await Products.findById(id);
        if (!productRecords) throw createNotFoundError('Product record');
        return response.success(productRecords);
        // if(!productRecords){
        //     return response.status(404).json({ message: 'Product Record not found' });
        // }
        //return response.status(200).jason(productRecords);
}));


router.put('/:id', asyncHandler(async (request, response) => {
        if(
            !request.body.productID ||
            !request.body.productName ||
            !request.body.productDescription ||
            !request.body.productQuantity ||
            !request.body.productPrice
        ) {
            throw createValidationError('Send all required fields');
        }

        const { id } = request.params;

        // Extract only allowed fields from request body
        const { productID, productName, productDescription, productQuantity, productPrice } = request.body;

        // Create update object with only allowed fields
        const updateData = { productID, productName, productDescription, productQuantity, productPrice };

        const result = await Products.findByIdAndUpdate(id, updateData, { new: true });

        if(!result){
            throw createNotFoundError('Product record');
        }
        return response.success({ message: 'Product record updated successfully', data: result });
}));

router.delete('/:id', async (request, response) =>{
        const { id } = request.params;

        const  result = await Products.findByIdAndDelete(id);

        if(!result){
            throw createNotFoundError('Product record');
        }
        return response.success({message: 'Product Record delete Successfully'});
});

export default router;