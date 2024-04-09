import { SpriteConfig, spriteConfig } from "./sprites";

function convertToHtml(
  spriteConfigs: any,
  configToHtml: (spriteConfig: SpriteConfig) => string
): string {
  return Object
    .keys(spriteConfigs)
    .map(key => {

      if (spriteConfigs[key].tileCoords !== undefined) {
        return "<p>" + configToHtml(spriteConfigs[key]) + " " + key + "</p>";
      }

      return "<details><summary>" +
        key +
        "</summary>" +
        convertToHtml(spriteConfigs[key], configToHtml) +
        "</details>";
    })
    .join("");
}

const spriteConfigToString = (spriteConfig: SpriteConfig) => `x:${spriteConfig.tileCoords.x},y:${spriteConfig.tileCoords.y}`;

it("convert single config to HTML", () => {

  const html = convertToHtml(
    { foo: spriteConfig({ x: 4, y: 2 }) },
    spriteConfigToString
  );

  expect(html).toEqual("<p>x:4,y:2 foo</p>");
});

it("convert multiple configs to HTML", () => {

  const html = convertToHtml(
    {
      foo: spriteConfig({ x: 4, y: 2 }),
      bar: spriteConfig({ x: 5, y: 3 }),
    },
    spriteConfigToString
  );

  expect(html)
    .toEqual(
      "<p>x:4,y:2 foo</p><p>x:5,y:3 bar</p>"
    );
});

it("convert single config tree to collapsible HTML", () => {

  const html = convertToHtml(
    { foo: { bar: spriteConfig({ x: 4, y: 2 }) } },
    spriteConfigToString
  );

  expect(html)
    .toEqual(
      "<details>" +
      "<summary>" +
      "foo" +
      "</summary>" +
      "<p>" +
      "x:4,y:2 bar" +
      "</p>" +
      "</details>"
    );
});

it("convert multiple single-level config tree to collapsible HTML", () => {

  const html = convertToHtml(
    {
      foo: {
        bar: spriteConfig({ x: 4, y: 2 }),
        pop: spriteConfig({ x: 5, y: 3 }),
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
      "<p>" +
      "x:4,y:2 bar" +
      "</p>" +
      "<p>" +
      "x:5,y:3 pop" +
      "</p>" +
      "</details>"
    );
});

/*

<details>
  <summary>
    What is the meaning of life?
  </summary>
  <p>
    42
  </p>
</details>

*/
