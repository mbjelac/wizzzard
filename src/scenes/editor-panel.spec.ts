import { SpriteConfig, spriteConfig } from "./sprites";

function convertToHtml(
  spriteConfigs: any,
  configToHtml: (spriteConfig: SpriteConfig) => string
): string {
  return Object
    .keys(spriteConfigs)
    .map(key =>
      "<details><summary>" +
      key +
  "</summary><p>" +
    configToHtml(spriteConfigs[key]) +
  "</p></details>"
  )
    .join("");
}

it("convert sprite config tree to collapsible HTML", () => {

  const html = convertToHtml(
    { foo: spriteConfig({ x: 4, y: 2 }) },
    spriteConfig => `x:${spriteConfig.tileCoords.x},y:${spriteConfig.tileCoords.y}`
  );

  expect(html)
    .toEqual(
      "<details>" +
      "<summary>" +
      "foo" +
      "</summary>" +
      "<p>" +
      "x:4,y:2" +
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
