export default class Record {
    payload: any
    metadata: any

    constructor(level: string) {
        this.payload = {}
        this.metadata = {
            level: level
        }
    }
}