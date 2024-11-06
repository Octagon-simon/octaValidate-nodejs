export type ValidationOptions = {
    strictMode?: boolean;
    prohibitedWords?: string[];
}

type RuleTitle = 
    | "userName"
    | "alphaOnly"
    | "alphaNumeric"
    | "lowerAlpha"
    | "upperAlpha"
    | "urlQP"
    | "url"
    | "strongPassword"
    | "generalText"
    | "alphaSpaces"
    | "email";

export type ValidationRules = {
    [key: string]: { 
        required: boolean;
        type?: 'string' | 'number' | 'file';
        pattern?: RegExp;
        length?: number;
        minLength?: number;
        maxLength?: number;
        ruleTitle?: RuleTitle;
        matches?: string[];
        mimeType?: string;
        fileSize?: string;
        minFileSize?: string;
        maxFileSize?: string;
        numOfFiles?: number;
        minNumOfFiles?: number;
        maxNumOfFiles?: number;
        errorMessage?: {
            required?: string;
            type?: string;
            length?: string;
            minLength?: string;
            maxLength?: string;
            pattern?: string;
            ruleTitle?: string;
            matches?: string;
            mimeType?: string;
            fileSize?: string;
            minFileSize?: string;
            maxFileSize?: string;
            numOfFiles?: string;
            minNumOfFiles?: string;
            maxNumOfFiles?: string;
        };
    }
}

declare module "octavalidate-nodejs" {
    class Octavalidate {
        constructor(routeIdentifier: string, opts?: ValidationOptions);
        
        createValidator(input: ValidationRules): boolean;
        validate(input: Record<string, any>): boolean;
        
        getError(): string | null;
        getErrors(): Record<string, any>;
    }

    export = Octavalidate;
}