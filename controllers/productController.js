const Product = require('../models/product');
const mongoose = require('mongoose');


const getProduct = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 9,
            search,
            designer,
            productType,
            color,
            inStock,
            minPrice,
            maxPrice,
            isNewProduct
        } = req.query;

        const filter = {};

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        if (designer) {
            filter.designer = designer;
        }

        if (productType) {
            filter.productType = productType;
        }

        if (color) {
            filter['colorVariants.color'] = color;
        }

        if (inStock) {
            filter.isSoldOut = inStock === 'false';
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (isNewProduct) {
            filter.isNewProduct = isNewProduct === 'true';
        }

        const products = await Product.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ price: 1, designer: 1, 'colorVariants.color': 1 });

        const totalCount = await Product.countDocuments(filter);

        res.status(200).json({ totalCount, page: Number(page), limit: Number(limit), products });
    } catch (err) {
        console.error('Error in getProduct route:', err);
        res.status(500).json({ msg: 'Server error', err });
    }
};

const getProductByTitle = async (req, res) => {

    try {
        const { title } = req.params;

        const product = await Product.findOne({ title });

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.status(200).json({ product });
    } catch (err) {
        console.error('Error in getProductByTitle route:', err);
        res.status(500).json({ msg: 'Server error', err });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid product ID format' });
        }


        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.status(200).json({ product });
    } catch (err) {
        console.error('Error in getProductById route:', err);
        res.status(500).json({ msg: 'Server error', err });
    }
};

const addProduct = async (req, res) => {
    console.log('Request Body:', req.body);
    const {
        title,
        designer,
        productType,
        colorVariants,
        dimensions,
        material,
        colors,
        currency,
        price,
        oldPrice,
        discountPercent,
        rating,
        isNewProduct,
        isSoldOut,
        availableUnits,
        descriptionTitle,
        descriptionText,
    } = req.body;


    if (!title || !designer || !productType || !colorVariants || !price || !currency) {
        return res.status(400).json({ msg: 'Please fill in all required fields' });
    }

    try {
        const product = new Product({
            title,
            designer,
            productType,
            colorVariants,
            dimensions: dimensions || null,
            material: material || null,
            colors: colors || null,
            currency,
            price,
            oldPrice: oldPrice || null,
            discountPercent: discountPercent || null,
            rating: rating || 0,
            isNewProduct: isNewProduct || false,
            isSoldOut: isSoldOut || false,
            availableUnits: availableUnits || 0,
            descriptionTitle: descriptionTitle || null,
            descriptionText: descriptionText || null,
        });

        await product.save();
        res.status(201).json({ msg: 'Product added successfully', product });
    } catch (err) {
        console.error('Error in addProduct route:', err);
        res.status(500).json({ msg: 'Server error', err });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        await Product.findByIdAndDelete(id);
        res.status(200).json({ msg: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error in deleteProduct route:', err);
        res.status(500).json({ msg: 'Server error', err });
    }
};

const editProduct = async (req, res) => {
    const { id } = req.params;

    const {
        title,
        designer,
        productType,
        colorVariants,
        dimensions,
        material,
        colors,
        currency,
        price,
        oldPrice,
        discountPercent,
        rating,
        isNewProduct,
        isSoldOut,
        availableUnits,
        descriptionTitle,
        descriptionText,
    } = req.body;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Update the product fields if they exist in the request body
        if (title) product.title = title;
        if (designer) product.designer = designer;
        if (productType) product.productType = productType;
        if (colorVariants) product.colorVariants = colorVariants;
        if (dimensions !== undefined) product.dimensions = dimensions || null;
        if (material) product.material = material || null;
        if (colors) product.colors = colors || null;
        if (currency) product.currency = currency;
        if (price !== undefined) product.price = price;
        if (oldPrice !== undefined) product.oldPrice = oldPrice || null;
        if (discountPercent !== undefined) product.discountPercent = discountPercent || null;
        if (rating !== undefined) product.rating = rating || 0;
        if (isNewProduct !== undefined) product.isNewProduct = isNewProduct;
        if (isSoldOut !== undefined) product.isSoldOut = isSoldOut;
        if (availableUnits !== undefined) product.availableUnits = availableUnits || 0;
        if (descriptionTitle) product.descriptionTitle = descriptionTitle || null;
        if (descriptionText) product.descriptionText = descriptionText || null;

        // Save the updated product
        await product.save();
        res.status(200).json({ msg: 'Product updated successfully', product });
    } catch (err) {
        console.error('Error in editProduct route:', err);
        res.status(500).json({ msg: 'Server error', err });
    }
};


module.exports = { getProduct, addProduct, deleteProduct, getProductByTitle, editProduct, getProductById };


