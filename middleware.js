function checkBodyParamsDefined (paramsKeys) {
    return async (ctx, next) => {
        ctx.request.body = JSON.parse(ctx.request.rawBody) //otherwise malformatted
        console.log(ctx.request.body)
        let undefinedList = [];
        for ( let key of paramsKeys ) {
            if(!ctx.request.body[key]) undefinedList.push(key);
        }
        if(undefinedList.length) {
            ctx.body = {
                success : false,
                data: `Required params undefined: ${undefinedList.join(", ")}`
            };
        } else {
            await next();
        }
    }
}

module.exports = {
    checkBodyParamsDefined
}
