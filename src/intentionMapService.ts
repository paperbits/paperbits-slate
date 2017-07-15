export class IntentionMapService {
    private readonly intentionMap: Object;

    constructor(intentionMap: Object) {
        this.intentionMap = intentionMap;
    }

    public getMap(): Object {
        return this.intentionMap;
    }
}