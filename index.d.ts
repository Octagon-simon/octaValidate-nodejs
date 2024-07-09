declare module "octavalidate-nodejs" {
    class Octavalidate {
        constructor();
        createValidator(input: Object): boolean;
        validate(input: Object): boolean;
        getError(): string | null;
        getErrors(): Object;
    }

    export = Octavalidate;
}
