class ApiFeatures {
    // mongooseQuery: query mongoose that is used to access to DataBase ex: "Model.find()"
    // queryString: query string that is get from user ex: "req.query"
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }

    paginate(countDocs) {
        const page = +this.queryString.page || 1;
        const limit = +this.queryString.limit || 20;
        const skip = (page - 1) * limit;
        const endIndex = page * limit;

        // pagination results
        const pagination = {};
        pagination.currentPage = page;
        pagination.limit = limit;
        pagination.numbersOfPages = Math.ceil(countDocs / limit);
        pagination.totalResults = countDocs;
        if (endIndex < countDocs) {
            pagination.nextPage = page + 1;
        }
        if (skip > 0) {
            pagination.previousPage = page - 1;
        }


        this.mongooseQuery = this.mongooseQuery.limit(limit).skip(skip);
        this.paginationResult = pagination;

        return this;
    };

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(" ");
            this.mongooseQuery = this.mongooseQuery.sort(sortBy);
        } else {
            this.mongooseQuery = this.mongooseQuery.sort("createdAt");
        }
        return this;
    };

    filter(){
        const queryStringObj = {...this.queryString}
        const excludesFields = ["page", "limit", "sort", "fields", "keyword"];
        excludesFields.forEach(field => delete queryStringObj[field]);

        let queryStr = JSON.stringify(queryStringObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

        return this;
    }
}

module.exports = ApiFeatures