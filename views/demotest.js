User.find({email}); // it finds email on databse based on given value and gives entire info
User.find() // it gives entire database present in user


//  if we read docs in mongoDB there is comparision operators

// $eq  --> equals
// $gt  --> greater than
// $gte --> greater than equal to
// $in  --> in
// $lt  --> less than
// $lte --> less than equal to
// $ne  --> not equal
// $nin --> not in
// there are so many in docs like $and etc.., we can check


// Query looks like

// anything after ? is query
// coder, page or keywords

// sometimes there are lot of products like 2000 so to restrict that we will keep them in page that is page = 2

// price[lte] means price less than equal to 999

//  /api/v1/product?search=coder&page=2&category=shortsleeves&rating=4&price[lte]=999&price[gte]=199


User.find({qty : {$lte : 20}});

const p = 'gte gte lte';
// actually they alone doesn't work like gte it should be like $gte
// But in url we can't pass $ because it automatically get converted into url encoded like space converted as %20

// we also want lte also so adding | statement to it
// now we are changing i to g beacuse it converts all valuse which find lte or gte to $
// if we have string like 'gte gte lte mygte' it gives also at mys$gte so we have to add boundary 
// therefore added \b at end and front \b means boundary

const regex = /\b{gte | lte}\b/g;

// actualy it returns call back like this so using it
// now changing it to $${m} it gives to dollar to found values only like if gte founds $gte if lte founds $lte

console.log(p.replace(regex, m => `$${m}`));