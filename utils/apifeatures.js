class ApiFeatures{

    constructor(query,queryStr){
        this.query=query
        this.queryStr=queryStr
    }


    search(){
        const keyword=this.queryStr.keyword?{
            name:{
                $regex:this.queryStr.keyword,
                $options:'i'
            }
        }
        :
        {}

        this.query=this.query.find({...keyword})
        return this;
    }

    filter(){
        const queryCopy={...this.queryStr}
       //Removing some fields 
        const removeFields=['keyword','page','limit'];
  
        removeFields.forEach(element =>delete queryCopy[element]);

       //Filter for Price

        console.log(queryCopy)
        let queryStr=JSON.stringify(queryCopy)
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key)=>`$${key}`);
        
        console.log(queryStr)
        this.query=this.query.find(JSON.parse(queryStr))
        return this
    }

    pagination(productsPerPage){
     const current=Number(this.queryStr.page) ||1;

     const skip=productsPerPage*(current-1)

     this.query=this.query.limit(productsPerPage).skip(skip)
     return this
    }
}


module.exports=ApiFeatures