const { Op } = require("sequelize");
const { Categories, Imagesproduct } = require("../models");

class ProductQueryBuilder {
    constructor() {
        this.queryOptions = {
            where: {},
            include: [
                { model: Categories, attributes: ["name"] },
                { model: Imagesproduct, attributes: ["url"] },
            ],
        };
    }

    filterByName(name) {
        if (name) {
            this.queryOptions.where.name = {
                [Op.like]: `%${name}%`,
            };
        }
        return this;
    }

    filterByPriceRange(minPrice, maxPrice) {
        if (minPrice && maxPrice) {
            this.queryOptions.where.price = {
                [Op.between]: [minPrice, maxPrice],
            };
        } else if (minPrice) {
            this.queryOptions.where.price = { [Op.gte]: minPrice };
        } else if (maxPrice) {
            this.queryOptions.where.price = { [Op.lte]: maxPrice };
        }
        return this;
    }

    filterByCategory(categoryId) {
        if (categoryId) {
            this.queryOptions.where.category_id = categoryId;
        }
        return this;
    }

    setPagination(page, limit) {
        if (page && limit) {
            const offset = (page - 1) * limit;
            this.queryOptions.limit = Number.parseInt(limit, 10);
            this.queryOptions.offset = Number.parseInt(offset, 10);
        }
        return this;
    }

    setSort(sortBy, sortOrder = "ASC") {
        if (sortBy) {
            this.queryOptions.order = [[sortBy, sortOrder]];
        }
        return this;
    }

    build() {
        return this.queryOptions;
    }
}

module.exports = ProductQueryBuilder;
