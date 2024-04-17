import { spriteAt, SpriteConfig, spriteConfig } from "./sprites";
import { convertToHtml } from "./editor-panel";



const spriteConfigToString = (lastKey: string, spriteConfig: SpriteConfig) => `${lastKey}=x:${spriteConfig.tileCoords.x},y:${spriteConfig.tileCoords.y}`;

it("convert single config to HTML", () => {

  const html = convertToHtml(
    { foo: spriteAt(4, 2) },
    spriteConfigToString
  );

  expect(html).toEqual("foo=x:4,y:2");
});

it("convert multiple configs to HTML", () => {

  const html = convertToHtml(
    {
      foo: spriteAt(4, 2),
      bar: spriteAt(5, 3),
    },
    spriteConfigToString
  );

  expect(html)
    .toEqual(
      "foo=x:4,y:2bar=x:5,y:3"
    );
});

it("convert single config tree to collapsible HTML", () => {

  const html = convertToHtml(
    { foo: { bar: spriteAt(4, 2) } },
    spriteConfigToString
  );

  expect(html)
    .toEqual(
      "<details>" +
      "<summary>" +
      "foo" +
      "</summary>" +
      "bar=x:4,y:2" +
      "</details>"
    );
});

it("convert multiple single-level config tree to collapsible HTML", () => {

  const html = convertToHtml(
    {
      foo: {
        bar: spriteAt(4, 2),
        pop: spriteAt(5, 3),
      }
    },
    spriteConfigToString
  );

  expect(html)
    .toEqual(
      "<details>" +
      "<summary>" +
      "foo" +
      "</summary>" +
      "bar=x:4,y:2" +
      "pop=x:5,y:3" +
      "</details>"
    );
});

it("convert multi-level config tree to collapsible HTML", () => {

  const html = convertToHtml(
    {
      foo: {
        bar: spriteAt(4, 2),
        pop: {
          fuzz: spriteAt(5, 3)
        },
      }
    },
    spriteConfigToString
  );

  expect(html)
    .toEqual(
      "<details>" +
      "<summary>" +
      "foo" +
      "</summary>" +
      "bar=x:4,y:2" +
      "<details>" +
      "<summary>" +
      "pop" +
      "</summary>" +
      "fuzz=x:5,y:3" +
      "</details>" +
      "</details>"
    );
});
