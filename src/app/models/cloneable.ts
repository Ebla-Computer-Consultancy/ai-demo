export class cloneable<T> {
    clone(obj: Partial<T>) {
        return Object.assign(this, obj);
    }
}
