const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    designer: { type: String, required: true },
    productType: { type: String, required: true },
    colorVariants: [
        {
            color: { type: String, required: true },
            mainImage: { type: String, required: true },
            hoverImage: { type: String, required: true },
            detailImages: [{ type: String, required: true }]
        }
    ],
    dimensions: { type: String },
    material: { type: String },
    colors: { type: String },
    currency: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number, required: false },
    discountPercent: {
        type: Number,
        default: function () {
            if (this.oldPrice && this.oldPrice > this.price) {
                return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
            }
            return null;
        }
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    isNewProduct: { type: Boolean, default: false },
    isSoldOut: { type: Boolean, default: false },
    availableUnits: { type: Number, default: 0 },
    descriptionTitle: { type: String },
    descriptionText: { type: String }
});



module.exports = mongoose.model('Product', productSchema);
