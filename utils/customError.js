// we are extending classic Error class and adding our features to see errors
class CustomError extends Error{
    // here we are additionally passing code
    constructor(message, code){
        super(message);
        this.code = code;
    }
}

module.exports = CustomError;