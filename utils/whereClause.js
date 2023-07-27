// base - product.find()

// big-Q   /api/v1/product?search=coder&page=2&category=shortsleeves&rating=4&price[lte]=999&price[gte]=199&limit=5

class whereClause{
    // bigQ means req.query
    // base product.find()
    constructor(base, bigQ){
        this.base = base;
        this.bigQ = bigQ;
    }

    // all we do this in bigQuery we have to find search and whatever value in search we are adding regex to it
    // this is easy beacause req.query have object which consists lot of key:values
    search(){

        // the $regex operator provides the functionality for pattern matching in the queries. 
        // In other words, the $regex operator is used to search a specific string in the documents.
        // Ex : - db.student.find({Course : {$regex: "btech" }}).forEach(printjson)
        
        // $ regex used for any single pattern matches alo then it shows that product
        // like in name i Write CODE will there
        // if we search code also it gives this option

        const searchword = this.bigQ.search ? {
            // we can add like this also
            // name : {searchword} but we are adding regex operation
            name : {
                $regex: this.bigQ.search,  // this $regex given by mongoose
                $options: 'i' // i is for case insensivity.   g is for global
            }
        } : {}; // if search not presents we are not doing anything

        this.base = this.base.find({...searchword}); // existing values are added to it used spread for object
        return this;
    }

    // filtering rest values except page, limit, search
    filter(){
        const copyQ = {...this.bigQ};

        delete copyQ["search"];
        delete copyQ["page"];
        delete copyQ["limit"];

        // converting bigQ into string => copyQ
        let stringOfcopyQ = JSON.stringify(copyQ);

        stringOfcopyQ = stringOfcopyQ.replace(/\b{gte|lte|gt|lt}\b/g, (m) => `$${m}`);

        const jsonOfCopyQ = JSON.parse(stringOfcopyQ);
        this.base = this.base.find(jsonOfCopyQ);

        return this;
    }

    // for page we oly want to add limit and skip
    // resultperPage gives how many products we want to show per page 
    pager(resultPerPage){
        let currentPage = 1;

        // if we pass page number in query then we are updating
        // so we can add values according to that page
        if(this.bigQ.page){
            currentPage = this.bigQ.page;
        }

        // number of values we want to skip
        const skipVal = resultPerPage * (currentPage - 1);

        // limit --> how much values you want to show in one page
        // skip --> how many values you want to skip

        // returning a new base
        this.base = this.base.limit(resultPerPage).skip(skipVal);
        return this;
    }
}

module.exports = whereClause;