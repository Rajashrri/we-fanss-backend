const { z } = require("zod");
//create an object schema
const loginSchema = z.object({
    email :z
        .string({message:"Email is required"})
        .trim()
        .email({message:"Invalid Email Id"})
        .min(3, {message:"Email must be at least of 3 characters" })
        .max(255, {message:"Email must not be more than 255 characters"}),
    
    password :z
        .string({message:"Password is required"})
        .trim()
        .min(6, {message:"password must be at least of 6 characters" })
        
});

const signupSchema = loginSchema.extend({
   
    username :z
        .string({message:"Name is required"})
        .trim()
        .min(3, {message:"Name must be at least of 3 characters" })
        .max(255, {message:"Name must not be more than 255 characters"}),

   
    });

const registerSchema = loginSchema.extend({

    username :z
        .string({message:"Name is required"})
        .trim()
        .min(3, {message:"Name must be at least of 3 characters" })
        .max(255, {message:"Name must not be more than 255 characters"}),

    phone :z
        .string({message:"Phone is required"})
        .trim()
        .min(10, {message:"Phone must be at least of 10 numbers" })
        .max(20, {message:"Phone must not be more than 20 numbers"}),    
    });

const contactSchema = z.object({

    username :z
        .string({message:"Name is required"})
        .trim()
        .min(3, {message:"Name must be at least of 3 characters" })
        .max(255, {message:"Name must not be more than 255 characters"}),

    email :z
        .string({message:"Email is required"})
        .trim()
        .email({message:"Invalid Email Id"})
        .min(3, {message:"Email must be at least of 3 characters" })
        .max(255, {message:"Email must not be more than 255 characters"}),
});    

//classmaster
    const classmasterSchema = z.object({
        classname :z
            .string({message:"Class Name is required"})
            .trim(),
        
        endate :z
            .string({message:"End Date is required"})
            .trim(),
            
    });

    //subject
    
    const subjectSchema = z.object({
        subjectname :z
            .string({message:"Subject Name is required"})
            .trim(),
            
    });

    //studymaterialSchema
    const studymaterialSchema = z.object({
        classname :z
            .string({message:"Class Name is required"})
            .trim(),
        medium :z
            .string({message:"Medium  is required"})
            .trim(),
        subject :z
            .string({message:"Subject  is required"})
            .trim(),
            
    });

    //studymaterialSchema
    const moduleSchema = z.object({
        modulename :z
            .string({message:"Module Name is required"})
            .trim(),
    });
    module.exports = { signupSchema, loginSchema,registerSchema, contactSchema , classmasterSchema, subjectSchema, studymaterialSchema, moduleSchema};