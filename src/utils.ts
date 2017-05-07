import * as React from 'react';
import { Set, Seq, Collection, List, Map } from 'immutable';

export class Utils {
    public static createElement(tagName) {
        return props => {
            return Utils.createReactElement(tagName, props);
        }
    }

    public static createReactElement(tagName, props) {
        let data = props.mark ? props.mark.data : props.node.data;
        let intentions = data.get("intentions");
        let categories = data.get("categories");

        if (!intentions && !categories) {
            return React.createElement(tagName, props.attributes, props.children)
        }

        if (!intentions) {
            intentions = List(Object.keys(categories).map(k => categories[k]))
        } else if (categories) {
            intentions = List(Set(intentions).union(Object.keys(categories).map(k => categories[k])))
        } else {
            intentions = List(intentions)
        }

        let className = intentions
            .update((collection) => {
                return collection.reduce((cn, fn) => cn + " " + Utils.Configuration.IntentionsMap[fn](), "")
            })
            .trim();

        let attr = props.attributes || {}
        Object.assign(attr, { className: className })

        return props.children ? React.createElement(tagName, attr, props.children) : React.createElement(tagName, attr);
    }

    public static createLinkElement() {
        return props => {
            const { data } = props.node;
            const href = data.get('href');
            const target = data.get('target');

            Object.assign(props.attributes, { href: href, target: target });

            return Utils.createReactElement("a", props);
        }
    }

    public static Configuration = {
        IntentionsMap: {},
        Schema: {
            nodes: {
                'block-quote': Utils.createElement('blockquote'),
                'bulleted-list': Utils.createElement('ul'),
                'heading-one': Utils.createElement('h1'),
                'heading-two': Utils.createElement('h2'),
                'heading-three': Utils.createElement('h3'),
                'heading-four': Utils.createElement('h4'),
                'heading-five': Utils.createElement('h5'),
                'heading-six': Utils.createElement('h6'),
                'list-item': Utils.createElement('li'),
                'numbered-list': Utils.createElement('ol'),
                'link': Utils.createLinkElement(),
                'code': Utils.createElement('pre'),
                'paragraph': Utils.createElement("p"),
                'custom': Utils.createElement("div")
            },
            marks: {
                bold: Utils.createElement('b'),
                italic: Utils.createElement('i'),
                underlined: Utils.createElement('u'),
                custom: Utils.createElement('span')
            }
        }
    }
}
