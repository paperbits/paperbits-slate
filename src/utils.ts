import * as React from "react";
import { Set, Seq, Collection, List, Map } from "immutable";

export class Utils {
    public static createElement(tagName) {
        return properties => {
            return Utils.createReactElement(tagName, properties);
        }
    }

    public static createReactElement(tagName: string, properties: any) {
        const data = properties.mark ? properties.mark.data : properties.node.data;
        const categories = data.get("categories");

        if (!categories) {
            return React.createElement(tagName, properties.attributes, properties.children);
        }

        const intentions: any = List(Object.keys(categories).map(k => categories[k]))

        const className = intentions
            .update((collection) => {
                return collection.reduce((cn, fn) => cn + " " + Utils.Configuration.IntentionsMap[fn](), "")
            })
            .trim();

        const attr = properties.attributes || {};
        Object.assign(attr, { className: className })

        return properties.children ? React.createElement(tagName, attr, properties.children) : React.createElement(tagName, attr);
    }

    public static createLinkElement() {
        return props => {
            const { data } = props.node;
            const href = data.get("href");
            const target = data.get("target");

            Object.assign(props.attributes, { href: href, target: target });

            return Utils.createReactElement("a", props);
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
