export class Inventory {

  private readonly storageKey;

  constructor(name: string){
    this.storageKey = `Inventory_${name}`;
  }

  getContents(): string[] {
    return JSON.parse(localStorage.getItem(this.storageKey) || "[]");
  }

  add(item: string) {
    const items: string[] = this.getContents();
    items.push(item);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  remove(itemToRemove: string) {
    const items: string[] = this.getContents();
    localStorage.setItem(this.storageKey, JSON.stringify(items.filter(item => item !== itemToRemove)));
  }

  has(item: string) :boolean{
    return this.getContents().includes(item);
  }
}
