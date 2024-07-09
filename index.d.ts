declare module "octavalidate-nodejs" {
    class Octavalidate {
        constructor();
        createValidator(input: Object): boolean;
        validate(input: Object): boolean;
        getError(): Object;
        getErrors(): Object;
    }

    export = Octavalidate;
}
