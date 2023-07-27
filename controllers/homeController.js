const BigPromise = require('../middlewares/bigPromise');

exports.home = BigPromise( async (req, res) => {
    
    // const db = await something()

    res.status(200).json({
        Success: true,
        Greeting: "Hello from API - venkat",
    });
});

// another way of handline promise
exports.homeDummy = async (req, res) => {
    
    try {
        // const db = await something()
        res.status(200).json({
            Success: true,
            Greeting: "This is dummy route...",
        });
        
    } catch (error) {
        console.log(error);
    }
};