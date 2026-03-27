class apierror extends Error {
    constructor(message="Something went wrong",code,errors=[],stack="")
    {
        super(message);
        this.code = code;
        this.message = message;
        this.errors = errors;
        this.success = false;
        
        this.data=null;
        if(stack)        {
            this.stack = stack;
        }else{
            Error.captureStackTrace(this,this.constructor);
        }

    }
}
export {apierror}