export abstract class Mapper<I, O> {
    abstract mapFrom(input: I): O;
    abstract mapTo(output: O): I;
}
