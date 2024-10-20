import { Inventory } from "./Inventory";

const inventoryName = "inventory";
let inventory: Inventory;

beforeEach(()=>{
  localStorage.clear();
  inventory = new Inventory(inventoryName);
});

it("initially empty", () => {
  expect(inventory.getContents()).toEqual<string[]>([]);
});

it("contents contains added items", () => {
  inventory.add("foo");
  inventory.add("bar");
  expect(inventory.getContents()).toEqual<string[]>(["foo", "bar"]);
});

it("contents can not be changed by changing retrieved contents array", () => {
  inventory.add("foo");
  inventory.getContents().push("bar");
  expect(inventory.getContents()).toEqual<string[]>(["foo"]);
});

it("inventory is stored outside of memory", () => {
  inventory.add("foo");
  inventory.add("bar");
  expect(new Inventory(inventoryName).getContents()).toEqual<string[]>(["foo", "bar"]);
});

it("two inventories do not share contents", () => {
  inventory.add("foo");

  const inventory2 = new Inventory("another");

  inventory2.add("bar");

  const actual = {
    contents1: inventory.getContents(),
    contents2: inventory2.getContents()
  };

  expect(actual).toEqual<typeof actual>({
    contents1: ["foo"],
    contents2: ["bar"]
  });
});

it("removed item is no longer in inventory contents", () => {

  inventory.add("foo");
  inventory.add("bar");

  inventory.remove("foo");

  expect(inventory.getContents()).toEqual<string[]>(["bar"]);
});

it("check if item is present", () => {

  inventory.add("foo");

  const actual = {
    hasFoo: inventory.has("foo"),
    hasBar: inventory.has("bar")
  };

  expect(actual).toEqual<typeof actual>({
    hasFoo: true,
    hasBar: false
  });
});
