import * as React from "react";

export class Utils {
    public static createElement(tagName) {
        return properties => {
            return Utils.createReactElement(tagName, properties);
        }
    }

    public static createReactElement(tagName: string, properties: any): JSX.Element {
        const data = properties.mark ? properties.mark.data : properties.node.data;
        const categories = data.get("categories");

        if (!categories) {
            return React.createElement(tagName, properties.attributes, properties.children);
        }

        const attributes = properties.attributes || {};

        const classNameCategoryKeys = Object.keys(categories).filter(x => x !== "anchorKey");

        if (classNameCategoryKeys.length > 0) {
            const className = classNameCategoryKeys
                .map(category => categories[category])
                .map(intentionKey => {
                    const intentionFunc = Utils.Configuration.IntentionsMap[intentionKey];

                    if (!intentionFunc) {
                        console.warn(`Could not find intention with key ${intentionKey}`);
                        return "";
                    }

                    return intentionFunc();
                })
                .join(" ");

            Object.assign(attributes, { className: className });
        }

        const anchorCategoryKey = Object.keys(categories).find(x => x === "anchorKey");

        if (anchorCategoryKey) {
            const id = categories[anchorCategoryKey];

            Object.assign(attributes, { id: id });
        }

        return properties.children ? React.createElement(tagName, attributes, properties.children) : React.createElement(tagName, attributes);
    }

    public static createLinkElement() {
        return properties => {
            const { data } = properties.node;
            const href = data.get("href");
            const target = data.get("target");

            Object.assign(properties.attributes, { href: href, target: target });

            return Utils.createReactElement("a", properties);
        }
    }

    public static Configuration = {
        IntentionsMap: {},
        Schema: {
            nodes: {
                "block-quote": Utils.createElement("blockquote"),
                "bulleted-list": Utils.createElement("ul"),
                "heading-one": Utils.createElement("h1"),
                "heading-two": Utils.createElement("h2"),
                "heading-three": Utils.createElement("h3"),
                "heading-four": Utils.createElement("h4"),
                "heading-five": Utils.createElement("h5"),
                "heading-six": Utils.createElement("h6"),
                "list-item": Utils.createElement("li"),
                "numbered-list": Utils.createElement("ol"),
                "link": Utils.createLinkElement(),
                "code": Utils.createElement("pre"),
                "paragraph": Utils.createElement("p"),
                "custom": Utils.createElement("div")
            },
            marks: {
                bold: Utils.createElement("b"),
                italic: Utils.createElement("i"),
                underlined: Utils.createElement("u"),
                custom: Utils.createElement("span")
            }
        }
    }
}
