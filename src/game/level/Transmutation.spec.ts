import { parseTransmutation, Transmutation } from "./Transmutation";

it("empty", () => {
  expect(parseTransmutation("")).toEqual<Transmutation>({
    destroy: [],
    create: []
  });
});

it("destroy one", () => {
  expect(parseTransmutation("foo-34-12")).toEqual<Transmutation>({
    destroy: [
      {
      label: "foo",
      at: { x: 34, y: 12 }
    }
    ],
    create: []
  });
});

it("destroy many", () => {
  expect(parseTransmutation("foo-34-12,bar-23-45")).toEqual<Transmutation>({
    destroy: [
      { label: "foo", at: { x: 34, y: 12 } },
      { label: "bar", at: { x: 23, y: 45 } },
    ],
    create: []
  });
});


it("create one", () => {
  expect(parseTransmutation(":foo-34-12")).toEqual<Transmutation>({
    destroy: [],
    create: [
      {
        label: "foo",
        at: { x: 34, y: 12 }
      }
    ]
  });
});

it("create many", () => {
  expect(parseTransmutation(":foo-34-12,bar-23-45")).toEqual<Transmutation>({
    destroy: [],
    create: [
      { label: "foo", at: { x: 34, y: 12 } },
      { label: "bar", at: { x: 23, y: 45 } },
    ]
  });
});

it("destroy & create many", () => {
  expect(parseTransmutation("pop-12-100,fiz-44-0:foo-34-12,bar-23-45")).toEqual<Transmutation>({
    destroy: [
      { label: "pop", at: { x: 12, y: 100 } },
      { label: "fiz", at: { x: 44, y: 0 } },
    ],
    create: [
      { label: "foo", at: { x: 34, y: 12 } },
      { label: "bar", at: { x: 23, y: 45 } },
    ]
  });
});
