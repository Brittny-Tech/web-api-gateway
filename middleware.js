function checkBodyParamsDefined (paramsKeys) {
    return async (ctx, next) => {
        let undefinedList = [];
        for ( let key of paramsKeys ) {
            if(!ctx.request.body[key]) undefinedList.push(key);
        }
        if(undefinedList.length) {
            ctx.body = {
                success : false,
                data: `Requires params undefined: ${undefinedList.join(", ")}`
            };
        } else {
            await next();
        }
    }
}

module.exports = {
    checkBodyParamsDefined
}
